import { NextResponse } from "next/server";
import { z } from "zod";
import { getPlans, createPendingOrder, createOrderItems, updateOrderStripeSession, isOrderNumberUnique } from "@/lib/d1/data";
import { stripe } from "@/lib/stripe/server";
import type { PlanWithCountry } from "@/lib/types";

const requestSchema = z.object({
  items: z
    .array(
      z.object({
        planId: z.string().min(1),
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

    // Fetch all requested plans
    const planIds = items.map((i) => i.planId);
    const allPlans = await getPlans();
    const planMap = new Map<string, PlanWithCountry>(
      allPlans.map((p) => [p.id, p])
    );

    // Validate all plans found
    const missingIds = planIds.filter((id) => !planMap.has(id));
    if (missingIds.length > 0) {
      return NextResponse.json(
        { error: "One or more plans are no longer available." },
        { status: 400 }
      );
    }

    // Calculate total
    const totalCents = items.reduce((sum, item) => {
      const plan = planMap.get(item.planId)!;
      return sum + plan.price_cents * item.quantity;
    }, 0);

    // Generate unique order number
    let orderNumber = "";
    for (let attempt = 0; attempt < 5; attempt++) {
      orderNumber = generateOrderNumber();
      if (await isOrderNumberUnique(orderNumber)) break;
    }

    // Create order
    const orderId = await createPendingOrder(orderNumber, email, totalCents);

    // Create order items
    await createOrderItems(
      orderId,
      items.map((item) => {
        const plan = planMap.get(item.planId)!;
        return {
          planId: item.planId,
          quantity: item.quantity,
          unitPriceCents: plan.price_cents,
          subtotalCents: plan.price_cents * item.quantity,
        };
      })
    );

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
        order_id: orderId,
        order_number: orderNumber,
      },
    });

    // Link Stripe session to order
    await updateOrderStripeSession(orderId, session.id);

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
