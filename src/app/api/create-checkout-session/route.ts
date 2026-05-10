import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe/server";

const requestSchema = z.object({
  items: z
    .array(
      z.object({
        planId: z.string().uuid(),
        quantity: z.number().int().min(1).max(10),
      })
    )
    .min(1),
  email: z.string().email(),
});

function generateOrderNumber(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "ORD-";
  for (let i = 0; i < 8; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = requestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { items, email } = parsed.data;
    const supabase = await createClient();

    // Fetch all requested plans with country info
    const planIds = items.map((i) => i.planId);
    const { data: plans, error: plansError } = await supabase
      .from("plans")
      .select("*, country:countries(*)")
      .in("id", planIds)
      .eq("is_active", true);

    if (plansError || !plans) {
      return NextResponse.json(
        { error: "Failed to fetch plans" },
        { status: 500 }
      );
    }

    // Validate all plans found and active
    const planMap = new Map(plans.map((p) => [p.id, p]));
    for (const item of items) {
      const plan = planMap.get(item.planId);
      if (!plan) {
        return NextResponse.json(
          {
            error: `Plan ${item.planId} is no longer available. Please remove it from your cart.`,
          },
          { status: 400 }
        );
      }
    }

    // Calculate total
    const totalCents = items.reduce((sum, item) => {
      const plan = planMap.get(item.planId)!;
      return sum + plan.price_cents * item.quantity;
    }, 0);

    // Generate unique order number (retry up to 5 times)
    let orderNumber = "";
    for (let attempt = 0; attempt < 5; attempt++) {
      orderNumber = generateOrderNumber();
      const { count } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("order_number", orderNumber);
      if (count === 0) break;
    }

    // Create order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        customer_email: email,
        status: "pending",
        total_cents: totalCents,
        currency: "usd",
      })
      .select()
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: "Failed to create order" },
        { status: 500 }
      );
    }

    // Create order items
    const orderItems = items.map((item) => {
      const plan = planMap.get(item.planId)!;
      return {
        order_id: order.id,
        plan_id: item.planId,
        quantity: item.quantity,
        unit_price_cents: plan.price_cents,
        subtotal_cents: plan.price_cents * item.quantity,
      };
    });

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      // Clean up the orphaned order
      await supabase.from("orders").delete().eq("id", order.id);
      return NextResponse.json(
        { error: "Failed to create order items" },
        { status: 500 }
      );
    }

    // Build Stripe line items
    const lineItems = items.map((item) => {
      const plan = planMap.get(item.planId)!;
      const isRegional = plan.coverage_type === "regional";
      const countryName = isRegional
        ? plan.coverage_region || "Global"
        : plan.country?.name || "Country";

      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: `${plan.name} (${countryName})`,
            description: `${plan.data_amount_gb}GB — ${plan.validity_days} days`,
          },
          unit_amount: plan.price_cents,
        },
        quantity: item.quantity,
      };
    });

    // Create Stripe Checkout session
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      customer_email: email,
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cart`,
      metadata: {
        order_id: order.id,
        order_number: orderNumber,
      },
    });

    // Link Stripe session to order
    await supabase
      .from("orders")
      .update({ stripe_session_id: session.id })
      .eq("id", order.id);

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
