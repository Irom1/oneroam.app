import { NextResponse } from "next/server";
import { z } from "zod";
import { fetchPackages, buildDisplayPlan } from "@/lib/esimaccess/catalog";
import { getStripe } from "@/lib/stripe/server";
import { query, generateId } from "@/lib/d1/client";

const requestSchema = z.object({
  packageCode: z.string().min(1),
  email: z.string().email().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = requestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request" },
        { status: 400 }
      );
    }

    const { packageCode, email } = parsed.data;

    // Fetch live plan and calculate price with 25% markup
    const pkgs = await fetchPackages();
    const pkg = pkgs.find((p) => p.packageCode === packageCode);

    if (!pkg) {
      return NextResponse.json({ error: "Plan not found" }, { status: 400 });
    }

    const plan = buildDisplayPlan(pkg);

    // Pre-create order in D1
    const orderId = generateId();
    await query(
      `INSERT INTO orders (id, customer_email, package_code, package_name, amount_cents, status)
       VALUES (?, ?, ?, ?, ?, 'pending')`,
      [orderId, email || "", plan.id, plan.name, plan.priceCents]
    );

    // Create Stripe PaymentIntent
    const paymentIntent = await getStripe().paymentIntents.create({
      amount: plan.priceCents,
      currency: "usd",
      receipt_email: email || undefined,
      automatic_payment_methods: { enabled: true },
      metadata: {
        orderId,
        packageCode: plan.id,
        packageName: plan.name,
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      amount: plan.priceCents,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error("Payment intent error:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
