import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe/server";
import { purchaseEsim } from "@/lib/esimaccess/order";
import { query, generateId } from "@/lib/d1/client";
import type Stripe from "stripe";

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const sig = headersList.get("stripe-signature");

  if (!sig) {
    return NextResponse.json(
      { error: "Missing stripe-signature" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const pi = event.data.object as Stripe.PaymentIntent;
        const packageCode = pi.metadata?.packageCode;
        const packageName = pi.metadata?.packageName || packageCode;
        const email = pi.receipt_email || "unknown@email";

        if (!packageCode) break;

        // Purchase eSIM from esimaccess
        const transactionId = generateId();
        let orderNo = "";
        try {
          const result = await purchaseEsim(packageCode, transactionId);
          orderNo = result.orderNo;
        } catch (e) {
          console.error("esimaccess order failed:", e);
          // Still store the order as failed
        }

        // Store order in D1
        const id = generateId();
        await query(
          `INSERT INTO orders (id, customer_email, stripe_payment_intent_id, esimaccess_order_no, package_code, package_name, amount_cents, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            id,
            email,
            pi.id,
            orderNo || null,
            packageCode,
            packageName,
            pi.amount,
            orderNo ? "fulfilled" : "failed",
          ]
        );

        break;
      }
    }
  } catch (error) {
    console.error("Webhook processing error:", error);
  }

  return NextResponse.json({ received: true });
}
