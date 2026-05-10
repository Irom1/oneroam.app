import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
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

  const supabase = await createClient();

  const { data: order, error } = await supabase
    .from("orders")
    .select("*, items:order_items(*, plan:plans(*, country:countries(*)))")
    .eq("stripe_session_id", sessionId)
    .single();

  if (error || !order) {
    return NextResponse.json(
      { error: "Order not found" },
      { status: 404 }
    );
  }

  // If order is already completed, return immediately
  if (order.status === "completed") {
    return NextResponse.json(order);
  }

  // If still pending, verify with Stripe directly (catches payments before webhook)
  if (order.status === "pending") {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);

      if (session.payment_status === "paid") {
        const { error: updateError } = await supabase
          .from("orders")
          .update({
            status: "completed",
            stripe_payment_intent_id:
              typeof session.payment_intent === "string"
                ? session.payment_intent
                : session.payment_intent?.id || null,
          })
          .eq("id", order.id)
          .eq("status", "pending");

        if (!updateError) {
          order.status = "completed";
          order.stripe_payment_intent_id =
            typeof session.payment_intent === "string"
              ? session.payment_intent
              : session.payment_intent?.id || null;
        }
      }
    } catch {
      // Stripe API call failed — return whatever we have in the DB
    }
  }

  return NextResponse.json(order);
}
