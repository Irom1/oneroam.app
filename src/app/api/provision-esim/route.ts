import { NextResponse } from "next/server";
import { z } from "zod";
import { getStripe } from "@/lib/stripe/server";
import { purchaseEsim, queryEsim } from "@/lib/esimaccess/order";
import { query, queryOne, generateId } from "@/lib/d1/client";
import { sendEsimEmail } from "@/lib/email";

const requestSchema = z.object({
  paymentIntentId: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = requestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const { paymentIntentId } = parsed.data;

    // 1. Verify payment with Stripe
    const pi = await getStripe().paymentIntents.retrieve(paymentIntentId);

    if (pi.status !== "succeeded") {
      return NextResponse.json(
        { error: "Payment not yet confirmed. Please wait and refresh." },
        { status: 400 }
      );
    }

    const packageCode = pi.metadata?.packageCode;
    const orderId = pi.metadata?.orderId;

    if (!packageCode) {
      return NextResponse.json(
        { error: "Order metadata missing." },
        { status: 400 }
      );
    }

    // 2. Check if already provisioned
    if (orderId) {
      const existing = await queryOne<Record<string, unknown>>(
        "SELECT * FROM orders WHERE id = ? AND status = 'fulfilled'",
        [orderId]
      );

      if (existing?.esimaccess_order_no) {
        // Already done — query eSIM details
        try {
          const details = await queryEsim(existing.esimaccess_order_no as string);
          return NextResponse.json({
            esim: {
              orderNo: details.orderNo,
              iccid: details.iccid,
              qrCodeUrl: details.qrCodeUrl || "",
              ac: details.ac || "",
            },
          });
        } catch {
          return NextResponse.json({
            esim: { orderNo: existing.esimaccess_order_no },
          });
        }
      }
    }

    // 3. Purchase eSIM from esimaccess
    const transactionId = generateId();
    let orderNo = "";
    try {
      const result = await purchaseEsim(packageCode, transactionId);
      orderNo = result.orderNo;
    } catch (e) {
      console.error("esimaccess purchase failed:", e);

      // Update order as failed
      if (orderId) {
        await query(
          "UPDATE orders SET status = 'failed' WHERE id = ?",
          [orderId]
        );
      }

      const msg =
        e instanceof Error ? e.message : "eSIM provider error";
      return NextResponse.json({ error: msg }, { status: 500 });
    }

    // 4. Update order in D1
    if (orderId) {
      await query(
        `UPDATE orders SET status = 'fulfilled', esimaccess_order_no = ?, stripe_payment_intent_id = ?, updated_at = datetime('now')
         WHERE id = ?`,
        [orderNo, paymentIntentId, orderId]
      );
    } else {
      // Create order if it doesn't exist
      const newId = generateId();
      const newOrderNumber = `ORD-${Date.now().toString(36).toUpperCase()}`;
      const amount = pi.amount;
      await query(
        `INSERT INTO orders (id, order_number, customer_email, stripe_payment_intent_id, esimaccess_order_no, package_code, package_name, amount_cents, total_cents, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'fulfilled')`,
        [newId, newOrderNumber, pi.receipt_email || "", paymentIntentId, orderNo, packageCode, pi.metadata?.packageName || packageCode, amount, amount]
      );
    }

    // 5. Query eSIM details (QR code, activation code)
    const esimDetails: {
      orderNo: string;
      iccid?: string;
      qrCodeUrl?: string;
      ac?: string;
    } = { orderNo };
    try {
      const details = await queryEsim(orderNo);
      esimDetails.orderNo = details.orderNo;
      esimDetails.iccid = details.iccid;
      esimDetails.qrCodeUrl = details.qrCodeUrl || "";
      esimDetails.ac = details.ac || "";
    } catch {
      // Details might not be ready immediately
    }

    // 6. Send email (fire-and-forget — don't block response)
    const email = pi.receipt_email || (orderId
      ? ((await queryOne<{ customer_email: string }>(
          "SELECT customer_email FROM orders WHERE id = ?", [orderId]
        ))?.customer_email)
      : "");
    if (email) {
      sendEsimEmail({
        to: email,
        qrCodeUrl: esimDetails.qrCodeUrl,
        activationCode: esimDetails.ac,
        iccid: esimDetails.iccid,
        orderNo: esimDetails.orderNo,
        planName: pi.metadata?.packageName || packageCode,
      }).catch((e) => console.error("Email failed:", e));
    }

    return NextResponse.json({ esim: esimDetails });
  } catch (error) {
    console.error("Provision error:", error);
    const msg =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
