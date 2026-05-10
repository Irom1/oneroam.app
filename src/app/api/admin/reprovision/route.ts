import { NextResponse } from "next/server";
import { queryOne, query, generateId } from "@/lib/d1/client";
import { purchaseEsim } from "@/lib/esimaccess/order";
import { verifyAdmin } from "@/lib/admin-auth";

export async function POST(request: Request) {
  const credId = request.headers.get("x-admin-credential") || "";
  if (!(await verifyAdmin(credId))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { orderId } = await request.json();
    const order = await queryOne<Record<string, unknown>>(
      "SELECT * FROM orders WHERE id = ?",
      [orderId]
    );
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    const packageCode = order.package_code as string;
    if (!packageCode) return NextResponse.json({ error: "No package code" }, { status: 400 });

    // Purchase new eSIM
    const transactionId = generateId();
    const result = await purchaseEsim(packageCode, transactionId);

    await query(
      "UPDATE orders SET esimaccess_order_no = ?, status = 'completed', updated_at = datetime('now') WHERE id = ?",
      [result.orderNo, orderId]
    );

    return NextResponse.json({ ok: true, orderNo: result.orderNo });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 500 }
    );
  }
}
