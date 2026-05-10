import { NextResponse } from "next/server";
import { getOrderBySessionId, updateOrderCompleted } from "@/lib/d1/data";
import { stripe } from "@/lib/stripe/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.json(
      { error: "Missing session_id" },
      { status: 400 }
    );
  }

  try {
    const order = await getOrderBySessionId(sessionId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Already completed
    if (order.status === "completed") {
      return NextResponse.json(order);
    }

    // If still pending, verify with Stripe directly
    if (order.status === "pending") {
      try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        if (session.payment_status === "paid") {
          const paymentIntentId =
            typeof session.payment_intent === "string"
              ? session.payment_intent
              : session.payment_intent?.id || null;

          await updateOrderCompleted(order.id, paymentIntentId);
          order.status = "completed";
          order.stripe_payment_intent_id = paymentIntentId;
        }
      } catch {
        // Stripe API call failed — return whatever we have
      }
    }

    return NextResponse.json(order);
  } catch {
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
  }
}
