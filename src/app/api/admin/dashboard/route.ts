import { NextResponse } from "next/server";
import { query } from "@/lib/d1/client";
import { apiCall } from "@/lib/esimaccess/client";
import { getStripe } from "@/lib/stripe/server";

export async function GET() {
  try {
    // Recent orders
    const ordersResult = await query<Record<string, unknown>>(
      "SELECT * FROM orders ORDER BY created_at DESC LIMIT 50"
    );

    const orders = ordersResult.results.map((o) => ({
      id: o.id,
      orderNumber: o.order_number,
      email: o.customer_email,
      packageName: o.package_name,
      amountCents: o.amount_cents,
      status: o.status,
      esimOrderNo: o.esimaccess_order_no,
      createdAt: o.created_at,
    }));

    // Revenue totals from D1
    const revenueResult = await query<{ total: number }>(
      "SELECT COALESCE(SUM(amount_cents), 0) as total FROM orders WHERE status = 'completed'"
    );
    const totalRevenue = revenueResult.results[0]?.total || 0;

    const countResult = await query<{ count: number }>(
      "SELECT COUNT(*) as count FROM orders"
    );
    const totalOrders = countResult.results[0]?.count || 0;

    // esimaccess balance
    let balance = null;
    try {
      const bal = await apiCall<{ balance: number; currencyCode: string }>(
        "/balance/query"
      );
      balance = {
        microUnits: bal.balance,
        usd: (bal.balance / 10000).toFixed(2),
      };
    } catch {
      // balance unavailable
    }

    // Stripe balance
    let stripeBalance = null;
    try {
      const sb = await getStripe().balance.retrieve();
      stripeBalance = {
        available: sb.available.map((a) => ({
          amount: (a.amount / 100).toFixed(2),
          currency: a.currency,
        })),
        pending: sb.pending.map((a) => ({
          amount: (a.amount / 100).toFixed(2),
          currency: a.currency,
        })),
      };
    } catch {
      // stripe unavailable
    }

    return NextResponse.json({
      orders,
      totalRevenue,
      totalOrders,
      balance,
      stripeBalance,
    });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
