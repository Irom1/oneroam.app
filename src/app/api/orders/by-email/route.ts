import { NextResponse } from "next/server";
import { query } from "@/lib/d1/client";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    const result = await query<Record<string, unknown>>(
      `SELECT id, order_number, customer_email, esimaccess_order_no, package_code, package_name, amount_cents, status, created_at
       FROM orders WHERE customer_email = ? AND status = 'completed'
       ORDER BY created_at DESC`,
      [email.toLowerCase().trim()]
    );

    return NextResponse.json({ orders: result.results });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
