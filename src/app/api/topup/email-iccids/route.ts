import { NextResponse } from "next/server";
import { query } from "@/lib/d1/client";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

    const result = await query<Record<string, unknown>>(
      `SELECT esimaccess_order_no, package_name, created_at FROM orders
       WHERE customer_email = ? AND status = 'completed' AND esimaccess_order_no IS NOT NULL
       ORDER BY created_at DESC LIMIT 10`,
      [email.toLowerCase().trim()]
    );

    if (!result.results.length) {
      return NextResponse.json({ error: "No orders found for this email." }, { status: 404 });
    }

    // Send email with order details
    const key = process.env.RESEND_API_KEY;
    if (key) {
      const rows = result.results
        .map((o) => `<li>${o.package_name} — ICCID lookup via: <a href="https://oneroam.app/topup?order=${o.esimaccess_order_no}">${o.esimaccess_order_no}</a></li>`)
        .join("");

      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "oneroam <esim@oneroam.app>",
          to: [email],
          subject: "Your eSIM orders — oneroam",
          html: `<p>Here are your past eSIM orders for top-up:</p><ul>${rows}</ul><p>Click any link to check usage and top up.</p>`,
        }),
      });
    }

    return NextResponse.json({ ok: true, count: result.results.length });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
