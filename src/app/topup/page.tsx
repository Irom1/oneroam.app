"use client";

import { useState } from "react";
import { Signal, Wifi, WifiOff } from "lucide-react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { PlanCard } from "@/components/plans/plan-card";
import { PlanDetailModal } from "@/components/plans/plan-detail-modal";
import type { DisplayPlan } from "@/lib/esimaccess/catalog";

const STRIPE_KEY =
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
  "pk_live_51TVNdhCHYA58HEMJhvqk25WmnU1Wcj09Y1n2yMVZwo3jGyTeuvbiQZY6tHKMur8J4x0t7LxQVShtiuL1AjgUg0bM00Ph4nPLfM";
const stripePromise = loadStripe(STRIPE_KEY);

interface UsageData {
  totalVolume?: number;
  usedVolume?: number;
  status?: string;
}

export default function TopupPage() {
  const [iccid, setIccid] = useState("");
  const [plans, setPlans] = useState<DisplayPlan[]>([]);
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);
  const [detailPlan, setDetailPlan] = useState<DisplayPlan | null>(null);

  const lookup = async () => {
    if (!iccid.trim()) return;
    setLoading(true);
    setError("");
    setSearched(true);

    try {
      // Fetch usage + topup options in parallel
      const [usageRes, plansRes] = await Promise.all([
        fetch("/api/usage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ iccid: iccid.trim() }),
        }),
        fetch("/api/topup/options", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ iccid: iccid.trim() }),
        }),
      ]);

      const usageData = await usageRes.json();
      const plansData = await plansRes.json();

      if (usageRes.ok) setUsage(usageData.usage || null);
      if (plansRes.ok && Array.isArray(plansData.plans)) {
        setPlans(plansData.plans.filter((p: DisplayPlan) => p.dataAmountGb >= 1));
      } else {
        setPlans([]);
      }

      if (!usageRes.ok && !plansRes.ok) {
        setError("Could not find this eSIM. Check your ICCID.");
      }
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const usagePercent =
    usage?.totalVolume && usage?.usedVolume
      ? Math.round((usage.usedVolume / usage.totalVolume) * 100)
      : 0;

  return (
    <Elements stripe={stripePromise}>
      <div className="mx-auto max-w-2xl px-4 py-12 pb-36">
        <h1 className="text-2xl font-bold tracking-tight text-center">
          eSIM Top-up
        </h1>
        <p className="mt-2 text-sm text-muted-foreground text-center">
          Check your data usage and add more if needed
        </p>

        {/* ICCID input */}
        <div className="mt-8">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter your ICCID (from your order email)"
              value={iccid}
              onChange={(e) => setIccid(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && lookup()}
              className="flex-1 h-12 px-4 rounded-xl border border-border bg-card text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <button
              onClick={lookup}
              disabled={loading || !iccid.trim()}
              className="h-12 px-5 rounded-xl bg-foreground text-background font-medium text-sm hover:opacity-80 transition-opacity disabled:opacity-40 shrink-0"
            >
              {loading ? "…" : "Look up"}
            </button>
          </div>
          {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
        </div>

        {/* Usage bar */}
        {usage && (
          <div className="mt-8 bg-card rounded-2xl border border-border p-5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
              Data Usage
            </p>
            <div className="flex items-center gap-3 mb-2">
              {usagePercent > 90 ? (
                <WifiOff className="h-5 w-5 text-destructive" />
              ) : usagePercent > 50 ? (
                <Signal className="h-5 w-5 text-amber-500" />
              ) : (
                <Wifi className="h-5 w-5 text-[#7ecb8a]" />
              )}
              <span className="text-sm font-medium">
                {usage.totalVolume && usage.usedVolume
                  ? `${formatBytes(usage.usedVolume)} / ${formatBytes(usage.totalVolume)} used`
                  : usage.status || "Active"}
              </span>
            </div>
            {usage.totalVolume && usage.usedVolume ? (
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    usagePercent > 90
                      ? "bg-destructive"
                      : usagePercent > 50
                      ? "bg-amber-500"
                      : "bg-[#7ecb8a]"
                  }`}
                  style={{ width: `${Math.min(usagePercent, 100)}%` }}
                />
              </div>
            ) : null}
          </div>
        )}

        {/* Topup plans */}
        {searched && !loading && plans.length > 0 && (
          <div className="mt-6">
            <p className="text-sm font-medium text-muted-foreground mb-3">
              Available top-up plans
            </p>
            <div className="space-y-2">
              {plans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  onSelect={(p) => setDetailPlan(p)}
                />
              ))}
            </div>
          </div>
        )}

        {searched && !loading && plans.length === 0 && !error && (
          <p className="mt-6 text-center text-sm text-muted-foreground">
            No top-up plans available for this eSIM.
          </p>
        )}
      </div>

      {detailPlan && (
        <PlanDetailModal
          plan={detailPlan}
          onClose={() => setDetailPlan(null)}
          onBuy={() => {
            setDetailPlan(null);
          }}
        />
      )}
    </Elements>
  );
}

function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(0)} MB`;
}
