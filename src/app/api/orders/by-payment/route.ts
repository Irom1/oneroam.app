import { NextResponse } from "next/server";
import { queryOne } from "@/lib/d1/client";
import { queryEsim } from "@/lib/esimaccess/order";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const paymentIntent = searchParams.get("payment_intent");

  if (!paymentIntent) {
    return NextResponse.json({ error: "Missing payment_intent" }, { status: 400 });
  }

  try {
    const order = await queryOne<Record<string, unknown>>(
      "SELECT * FROM orders WHERE stripe_payment_intent_id = ?",
      [paymentIntent]
    );

    if (!order) {
      return NextResponse.json({ order: null });
    }

    // If fulfilled and has orderNo, query eSIM details
    let esimDetails = {};
    if (order.status === "fulfilled" && order.esimaccess_order_no) {
      try {
        const details = await queryEsim(order.esimaccess_order_no as string);
        esimDetails = {
          orderNo: details.orderNo,
          iccid: details.iccid,
          qrCodeUrl: details.qrCodeUrl || "",
          ac: details.ac || "",
        };
      } catch {
        // eSIM might not be ready yet
      }
    }

    return NextResponse.json({
      order: {
        ...esimDetails,
        status: order.status,
        packageName: order.package_name,
        amountCents: order.amount_cents,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}
