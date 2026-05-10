"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, X } from "lucide-react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { HeroSection } from "@/components/landing/hero-section";
import { PlanCard } from "@/components/plans/plan-card";
import { PlanDetailModal } from "@/components/plans/plan-detail-modal";
import type { DisplayPlan } from "@/lib/esimaccess/catalog";

const MIN_GB = 10;
const MAX_GB = 30;
const MIN_DAYS = 30;

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

function dedupePlans(plans: DisplayPlan[]): DisplayPlan[] {
  const seen = new Map<string, DisplayPlan>();
  for (const p of plans) {
    const key = `${p.locationCode}_${p.dataAmountGb}`;
    const existing = seen.get(key);
    if (!existing || p.priceCents < existing.priceCents) {
      seen.set(key, p);
    }
  }
  return [...seen.values()].sort((a, b) => a.priceCents - b.priceCents);
}

export default function HomePage() {
  const [plans, setPlans] = useState<DisplayPlan[]>([]);
  const [detailPlan, setDetailPlan] = useState<DisplayPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/plans")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const filtered = data.filter(
            (p: DisplayPlan) =>
              p.dataAmountGb >= MIN_GB &&
              p.dataAmountGb <= MAX_GB &&
              p.validityDays >= MIN_DAYS
          );
          setPlans(dedupePlans(filtered));
        } else {
          setError(data.error || "Failed to load plans");
        }
      })
      .catch(() => setError("Could not load plans"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return plans;
    const q = search.toLowerCase();
    return plans.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.locationName.toLowerCase().includes(q) ||
        p.locationCode.toLowerCase().includes(q)
    );
  }, [plans, search]);

  return (
    <Elements stripe={stripePromise}>
      <HeroSection />

      <section className="pb-36">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          {loading ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-border bg-card p-5 h-40 animate-pulse"
                >
                  <div className="h-4 w-20 bg-muted rounded mb-3" />
                  <div className="h-5 w-32 bg-muted rounded mb-2" />
                  <div className="flex gap-2">
                    <div className="h-5 w-14 bg-muted rounded-full" />
                    <div className="h-5 w-14 bg-muted rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground">{error}</p>
            </div>
          ) : (
            <>
              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search country or region…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-12 pl-10 pr-4 rounded-xl border border-border bg-card text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {filtered.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-muted-foreground">No plans match your search.</p>
                </div>
              ) : (
                <>
                  <p className="text-xs text-muted-foreground mb-4">
                    {filtered.length} plans &middot; {MIN_GB}–{MAX_GB}GB &middot; {MIN_DAYS}+ days
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {filtered.map((plan) => (
                      <PlanCard
                        key={plan.id}
                        plan={plan}
                        onSelect={(p) => setDetailPlan(p)}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </section>

      {detailPlan && (
        <PlanDetailModal
          plan={detailPlan}
          onClose={() => setDetailPlan(null)}
          onBuy={() => setDetailPlan(null)}
        />
      )}
    </Elements>
  );
}
