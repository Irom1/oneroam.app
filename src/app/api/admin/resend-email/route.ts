import { NextResponse } from "next/server";
import { queryOne } from "@/lib/d1/client";
import { queryEsim } from "@/lib/esimaccess/order";
import { sendEsimEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const { orderId } = await request.json();
    const order = await queryOne<Record<string, unknown>>(
      "SELECT * FROM orders WHERE id = ?",
      [orderId]
    );
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    const esimOrderNo = order.esimaccess_order_no as string;
    const email = order.customer_email as string;
    const packageName = order.package_name as string;

    let qrCodeUrl = "";
    let activationCode = "";
    let iccid = "";

    if (esimOrderNo) {
      try {
        const details = await queryEsim(esimOrderNo);
        if (details) {
          qrCodeUrl = details.qrCodeUrl || "";
          activationCode = details.ac || "";
          iccid = details.iccid || "";
        }
      } catch {}
    }

    await sendEsimEmail({
      to: email,
      qrCodeUrl,
      activationCode,
      iccid,
      orderNo: esimOrderNo || (order.order_number as string),
      planName: packageName,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
