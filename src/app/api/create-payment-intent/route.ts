import { NextResponse } from "next/server";
import { z } from "zod";
import { fetchPackages, buildDisplayPlan } from "@/lib/esimaccess/catalog";
import { stripe } from "@/lib/stripe/server";

const requestSchema = z.object({
  packageCode: z.string().min(1),
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

    const { packageCode } = parsed.data;

    // Fetch live plan and calculate price with 25% markup
    const pkgs = await fetchPackages();
    const pkg = pkgs.find((p) => p.packageCode === packageCode);

    if (!pkg) {
      return NextResponse.json(
        { error: "Plan not found" },
        { status: 400 }
      );
    }

    const plan = buildDisplayPlan(pkg);

    // Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: plan.priceCents,
      currency: "usd",
      metadata: {
        packageCode: plan.id,
        packageName: plan.name,
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      amount: plan.priceCents,
    });
  } catch (error) {
    console.error("Payment intent error:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
