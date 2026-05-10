export type Country = {
  id: string;
  name: string;
  code: string;
  flag_emoji: string | null;
  region: string;
  created_at: string;
};

export type Plan = {
  id: string;
  country_id: string;
  name: string;
  description: string | null;
  data_amount_gb: number;
  validity_days: number;
  price_cents: number;
  coverage_type: "country" | "regional";
  coverage_region: string | null;
  apn: string | null;
  is_active: boolean;
  stripe_price_id: string | null;
  popular: boolean;
  created_at: string;
  updated_at: string;
};

export type PlanWithCountry = Plan & { country: Country };

export type CartItem = {
  planId: string;
  planName: string;
  countryName: string;
  countryFlag: string;
  dataAmountGb: number;
  validityDays: number;
  priceCents: number;
  quantity: number;
};

export type OrderStatus = "pending" | "completed" | "failed" | "refunded";

export type Order = {
  id: string;
  order_number: string;
  customer_email: string;
  stripe_session_id: string | null;
  stripe_payment_intent_id: string | null;
  status: OrderStatus;
  total_cents: number;
  currency: string;
  created_at: string;
  updated_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  plan_id: string;
  quantity: number;
  unit_price_cents: number;
  subtotal_cents: number;
  esim_activation_code: string | null;
  created_at: string;
};

export type OrderItemWithPlan = OrderItem & {
  plan: PlanWithCountry;
};

export type OrderWithItems = Order & {
  items: OrderItemWithPlan[];
};
