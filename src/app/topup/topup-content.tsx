"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Signal, Wifi, WifiOff } from "lucide-react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { PlanCard } from "@/components/plans/plan-card";
import { PlanDetailModal } from "@/components/plans/plan-detail-modal";
import type { DisplayPlan } from "@/lib/esimaccess/catalog";

const STRIPE_KEY =
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
  "pk_live_51TVNdhCHYA58HEMJhvqk25WmnU1Wcj09Y1n2yMVZwo3jGyTeuvbiQZY6tHKMur8J4x0t7LxQVShtiuL1AjgUg0bM00Ph4nPLfM";
const stripePromise = loadStripe(STRIPE_KEY);

interface OrderSummary {
  id: string;
  order_number: string;
  package_name: string;
  amount_cents: number;
  esimaccess_order_no: string;
  created_at: string;
}

interface UsageData {
  totalVolume?: number;
  usedVolume?: number;
  status?: string;
}

export function TopupContent() {
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";

  const [email, setEmail] = useState(emailParam);
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OrderSummary | null>(null);
  const [iccid, setIccid] = useState("");
  const [plans, setPlans] = useState<DisplayPlan[]>([]);
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [detailPlan, setDetailPlan] = useState<DisplayPlan | null>(null);

  // Auto-lookup if email is in URL
  useEffect(() => {
    if (emailParam.trim()) {
      lookupEmail(emailParam.trim());
    }
  }, [emailParam]);

  const lookupEmail = async (emailToUse?: string) => {
    const e = (emailToUse || email).trim();
    if (!e) return;
    setLoading(true);
    setError("");
    setOrders([]);
    setSelectedOrder(null);
    setPlans([]);
    setUsage(null);

    try {
      const res = await fetch("/api/orders/by-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: e }),
      });
      const data = await res.json();

      if (!res.ok || !data.orders?.length) {
        setError("No orders found for this email.");
      } else if (data.orders.length === 1) {
        selectOrder(data.orders[0]);
      } else {
        setOrders(data.orders);
      }
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const selectOrder = async (order: OrderSummary) => {
    setSelectedOrder(order);
    setOrders([]);
    setError("");
    setLoading(true);
    setPlans([]);
    setUsage(null);

    try {
      const iccidRes = await fetch("/api/esim-details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNo: order.esimaccess_order_no }),
      });
      const iccidData = await iccidRes.json();
      const iccidVal = iccidData.iccid || "";

      if (!iccidVal) {
        setError("Could not retrieve eSIM details. It may not be active yet.");
        setLoading(false);
        return;
      }
      setIccid(iccidVal);

      const [usageRes, plansRes] = await Promise.all([
        fetch("/api/usage", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ iccid: iccidVal }) }),
        fetch("/api/topup/options", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ iccid: iccidVal }) }),
      ]);

      const usageData = await usageRes.json();
      const plansData = await plansRes.json();

      if (usageRes.ok) setUsage(usageData.usage || null);
      if (plansRes.ok && Array.isArray(plansData.plans)) {
        setPlans(plansData.plans.filter((p: DisplayPlan) => p.dataAmountGb >= 1));
      }
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    setSelectedOrder(null);
    setOrders([]);
    setPlans([]);
    setUsage(null);
    setError("");
  };

  const usagePercent =
    usage?.totalVolume && usage?.usedVolume
      ? Math.round((usage.usedVolume / usage.totalVolume) * 100)
      : 0;

  return (
    <Elements stripe={stripePromise}>
      <div className="mx-auto max-w-lg px-4 py-12 pb-24">
        <h1 className="text-2xl font-bold tracking-tight text-center">eSIM Top-up</h1>
        <p className="mt-2 text-sm text-muted-foreground text-center">
          Check your data usage and add more if needed
        </p>

        {/* Email input */}
        {!selectedOrder && orders.length === 0 && (
          <div className="mt-8">
            <div className="flex gap-2">
              <input
                type="email"
                inputMode="email"
                autoCapitalize="off"
                autoCorrect="off"
                placeholder="Order email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && lookupEmail()}
                className="flex-1 h-12 px-4 rounded-xl border border-border bg-card text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button
                onClick={() => lookupEmail()}
                disabled={loading || !email.trim()}
                className="h-12 px-5 rounded-xl bg-foreground text-background font-medium text-sm hover:opacity-80 transition-opacity disabled:opacity-40 shrink-0"
              >
                {loading ? "…" : "Look up"}
              </button>
            </div>
            {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
          </div>
        )}

        {/* Multiple orders */}
        {orders.length > 1 && (
          <div className="mt-6 space-y-2">
            <button onClick={goBack} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-3 w-3" /> Back
            </button>
            <p className="text-sm font-medium text-muted-foreground">Select an order:</p>
            {orders.map((o) => (
              <button
                key={o.id}
                onClick={() => selectOrder(o)}
                className="w-full text-left bg-card border border-border rounded-xl px-4 py-3 hover:border-primary/30 transition-colors"
              >
                <p className="font-medium text-sm">{o.package_name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {o.order_number} &middot; {new Date(o.created_at).toLocaleDateString()}
                </p>
              </button>
            ))}
          </div>
        )}

        {/* Selected order */}
        {selectedOrder && (
          <>
            <button onClick={goBack} className="mt-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-3 w-3" /> {email}
            </button>
            <p className="mt-2 text-xs text-muted-foreground">
              {selectedOrder.package_name} &middot; {selectedOrder.order_number}
            </p>
          </>
        )}

        {/* Usage bar */}
        {usage && (
          <div className="mt-6 bg-card rounded-2xl border border-border p-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Data Usage</p>
            <div className="flex items-center gap-3 mb-2">
              {usagePercent > 90 ? <WifiOff className="h-5 w-5 text-destructive" />
                : usagePercent > 50 ? <Signal className="h-5 w-5 text-amber-500" />
                : <Wifi className="h-5 w-5 text-[#7ecb8a]" />}
              <span className="text-sm font-medium">
                {usage.totalVolume && usage.usedVolume
                  ? `${formatBytes(usage.usedVolume)} / ${formatBytes(usage.totalVolume)} used`
                  : usage.status || "Active"}
              </span>
            </div>
            {usage.totalVolume && usage.usedVolume ? (
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className={`h-full rounded-full transition-all ${usagePercent > 90 ? "bg-destructive" : usagePercent > 50 ? "bg-amber-500" : "bg-[#7ecb8a]"}`}
                  style={{ width: `${Math.min(usagePercent, 100)}%` }} />
              </div>
            ) : null}
          </div>
        )}

        {/* Topup plans */}
        {plans.length > 0 && (
          <div className="mt-6">
            <p className="text-sm font-medium text-muted-foreground mb-3">Available top-up plans</p>
            <div className="space-y-2">
              {plans.map((plan) => (
                <PlanCard key={plan.id} plan={plan} onSelect={(p) => setDetailPlan(p)} />
              ))}
            </div>
          </div>
        )}

        {selectedOrder && !loading && plans.length === 0 && !error && (
          <p className="mt-6 text-center text-sm text-muted-foreground">No top-up plans available for this eSIM.</p>
        )}
      </div>

      {detailPlan && <PlanDetailModal plan={detailPlan} onClose={() => setDetailPlan(null)} onBuy={() => setDetailPlan(null)} />}
    </Elements>
  );
}

function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  return `${(bytes / (1024 * 1024)).toFixed(0)} MB`;
}
