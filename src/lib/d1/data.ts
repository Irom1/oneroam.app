// Data access helpers for the eSIM app.
// Abstracts D1 queries into typed functions used by pages and API routes.

import { query, queryOne, generateId } from "./client";
import type { Country, PlanWithCountry, OrderWithItems } from "@/lib/types";

// ---- Countries ----

export async function getCountries(): Promise<Country[]> {
  const result = await query<Country>(
    "SELECT * FROM countries ORDER BY name"
  );
  return result.results;
}

// ---- Plans ----

export async function getPlanById(id: string): Promise<PlanWithCountry | null> {
  const plan = await queryOne<Record<string, unknown>>(
    "SELECT * FROM plans WHERE id = ? AND is_active = 1",
    [id]
  );
  if (!plan) return null;
  return hydratePlan(plan);
}

export async function getPlans({
  countryId,
  search,
  popular,
  limit,
}: {
  countryId?: string;
  search?: string;
  popular?: boolean;
  limit?: number;
} = {}): Promise<PlanWithCountry[]> {
  let sql = "SELECT * FROM plans WHERE is_active = 1";
  const params: unknown[] = [];

  if (countryId) {
    sql += " AND country_id = ?";
    params.push(countryId);
  }

  if (search) {
    sql += " AND name LIKE ?";
    params.push(`%${search}%`);
  }

  if (popular) {
    sql += " AND popular = 1";
  }

  sql += " ORDER BY coverage_type ASC, price_cents ASC";

  if (limit) {
    sql += " LIMIT ?";
    params.push(limit);
  }

  const result = await query<Record<string, unknown>>(sql, params);
  return hydratePlans(result.results);
}

// ---- Hydration helpers ----

async function hydratePlans(
  rows: Record<string, unknown>[]
): Promise<PlanWithCountry[]> {
  if (rows.length === 0) return [];

  const countryIds = [...new Set(rows.map((r) => r.country_id as string))];
  const countries = await getCountriesByIds(countryIds);
  const countryMap = new Map(countries.map((c) => [c.id, c]));

  return rows.map((row) => {
    const country = countryMap.get(row.country_id as string);
    return {
      id: row.id as string,
      country_id: row.country_id as string,
      name: row.name as string,
      description: (row.description as string) || null,
      data_amount_gb: row.data_amount_gb as number,
      validity_days: row.validity_days as number,
      price_cents: row.price_cents as number,
      coverage_type: row.coverage_type as "country" | "regional",
      coverage_region: (row.coverage_region as string) || null,
      apn: (row.apn as string) || null,
      is_active: !!row.is_active,
      stripe_price_id: (row.stripe_price_id as string) || null,
      popular: !!row.popular,
      created_at: row.created_at as string,
      updated_at: row.updated_at as string,
      country: country || {
        id: "",
        name: "Unknown",
        code: "XX",
        flag_emoji: "🌍",
        region: "Unknown",
        created_at: "",
      },
    };
  });
}

async function hydratePlan(
  row: Record<string, unknown>
): Promise<PlanWithCountry> {
  const plans = await hydratePlans([row]);
  return plans[0];
}

async function getCountriesByIds(ids: string[]): Promise<Country[]> {
  if (ids.length === 0) return [];
  const placeholders = ids.map(() => "?").join(", ");
  const result = await query<Country>(
    `SELECT * FROM countries WHERE id IN (${placeholders})`,
    ids
  );
  return result.results;
}

// ---- Orders ----

export async function getOrderBySessionId(
  sessionId: string
): Promise<OrderWithItems | null> {
  const order = await queryOne<Record<string, unknown>>(
    "SELECT * FROM orders WHERE stripe_session_id = ?",
    [sessionId]
  );
  if (!order) return null;
  return hydrateOrder(order);
}

export async function getOrderByNumberAndEmail(
  orderNumber: string,
  email: string
): Promise<OrderWithItems | null> {
  const order = await queryOne<Record<string, unknown>>(
    "SELECT * FROM orders WHERE order_number = ? AND customer_email = ?",
    [orderNumber, email.toLowerCase().trim()]
  );
  if (!order) return null;
  return hydrateOrder(order);
}

async function hydrateOrder(
  row: Record<string, unknown>
): Promise<OrderWithItems> {
  const items = await query<Record<string, unknown>>(
    "SELECT * FROM order_items WHERE order_id = ?",
    [row.id as string]
  );

  const planIds = items.results.map((i) => i.plan_id as string);
  const plans = await getPlansByIds(planIds);
  const planMap = new Map(plans.map((p) => [p.id, p]));

  return {
    id: row.id as string,
    order_number: row.order_number as string,
    customer_email: row.customer_email as string,
    stripe_session_id: (row.stripe_session_id as string) || null,
    stripe_payment_intent_id:
      (row.stripe_payment_intent_id as string) || null,
    status: row.status as "pending" | "completed" | "failed" | "refunded",
    total_cents: row.total_cents as number,
    currency: (row.currency as string) || "usd",
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
    items: items.results.map((item) => ({
      id: item.id as string,
      order_id: item.order_id as string,
      plan_id: item.plan_id as string,
      quantity: item.quantity as number,
      unit_price_cents: item.unit_price_cents as number,
      subtotal_cents: item.subtotal_cents as number,
      esim_activation_code: (item.esim_activation_code as string) || null,
      created_at: item.created_at as string,
      plan: planMap.get(item.plan_id as string)!,
    })),
  };
}

async function getPlansByIds(ids: string[]): Promise<PlanWithCountry[]> {
  if (ids.length === 0) return [];
  const placeholders = ids.map(() => "?").join(", ");
  const result = await query<Record<string, unknown>>(
    `SELECT * FROM plans WHERE id IN (${placeholders})`,
    ids
  );
  return hydratePlans(result.results);
}

// ---- Mutations ----

export async function createPendingOrder(
  orderNumber: string,
  email: string,
  totalCents: number
): Promise<string> {
  const id = generateId();
  await query(
    "INSERT INTO orders (id, order_number, customer_email, status, total_cents) VALUES (?, ?, ?, 'pending', ?)",
    [id, orderNumber, email, totalCents]
  );
  return id;
}

export async function createOrderItems(
  orderId: string,
  items: { planId: string; quantity: number; unitPriceCents: number; subtotalCents: number }[]
): Promise<void> {
  for (const item of items) {
    await query(
      "INSERT INTO order_items (id, order_id, plan_id, quantity, unit_price_cents, subtotal_cents) VALUES (?, ?, ?, ?, ?, ?)",
      [generateId(), orderId, item.planId, item.quantity, item.unitPriceCents, item.subtotalCents]
    );
  }
}

export async function updateOrderStripeSession(
  orderId: string,
  sessionId: string
): Promise<void> {
  await query(
    "UPDATE orders SET stripe_session_id = ?, updated_at = datetime('now') WHERE id = ?",
    [sessionId, orderId]
  );
}

export async function updateOrderCompleted(
  orderId: string,
  paymentIntentId: string | null
): Promise<number> {
  const result = await query(
    "UPDATE orders SET status = 'completed', stripe_payment_intent_id = ?, updated_at = datetime('now') WHERE id = ? AND status = 'pending'",
    [paymentIntentId, orderId]
  );
  return result.results?.length || 0;
}

export async function updateOrderFailedBySession(
  sessionId: string
): Promise<void> {
  await query(
    "UPDATE orders SET status = 'failed', updated_at = datetime('now') WHERE stripe_session_id = ?",
    [sessionId]
  );
}

export async function isOrderNumberUnique(orderNumber: string): Promise<boolean> {
  const result = await query(
    "SELECT id FROM orders WHERE order_number = ?",
    [orderNumber]
  );
  return result.results.length === 0;
}
