"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
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

const STRIPE_KEY =
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
  "pk_live_51TVNdhCHYA58HEMJhvqk25WmnU1Wcj09Y1n2yMVZwo3jGyTeuvbiQZY6tHKMur8J4x0t7LxQVShtiuL1AjgUg0bM00Ph4nPLfM";
const stripePromise = loadStripe(STRIPE_KEY);

export function PlanPageContent({
  initialPlan,
}: {
  initialPlan: DisplayPlan | null;
}) {
  const router = useRouter();

  const [plans, setPlans] = useState<DisplayPlan[]>([]);
  const [detailPlan, setDetailPlan] = useState<DisplayPlan | null>(initialPlan);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/plans")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setPlans(
            data
              .filter(
                (p: DisplayPlan) =>
                  p.dataAmountGb >= MIN_GB &&
                  p.dataAmountGb <= MAX_GB &&
                  p.validityDays >= MIN_DAYS
              )
              .sort((a, b) => a.priceCents - b.priceCents)
          );
        } else {
          setError(data.error || "Failed to load plans");
        }
      })
      .catch(() => setError("Could not load plans"))
      .finally(() => setLoading(false));
  }, []);

  const selectPlan = useCallback(
    (plan: DisplayPlan) => {
      setDetailPlan(plan);
      router.replace(`/plan/${plan.id}`, { scroll: false });
    },
    [router]
  );

  const closePlan = useCallback(() => {
    setDetailPlan(null);
    router.replace("/", { scroll: false });
  }, [router]);

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

      <section className="pb-24">
        <div className="mx-auto max-w-3xl px-3 sm:px-6">
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-border bg-card p-4 h-24 animate-pulse"
                >
                  <div className="h-4 w-20 bg-muted rounded mb-2" />
                  <div className="h-5 w-40 bg-muted rounded" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground">{error}</p>
            </div>
          ) : (
            <>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search country or region…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-11 pl-9 pr-4 rounded-xl border border-border bg-card text-base placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
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
                  <p className="text-xs text-muted-foreground mb-3 px-1">
                    {filtered.length} plans &middot; {MIN_GB}–{MAX_GB}GB &middot; {MIN_DAYS}+ days
                  </p>
                  <div className="space-y-2">
                    {filtered.map((plan) => (
                      <PlanCard
                        key={plan.id}
                        plan={plan}
                        onSelect={selectPlan}
                        selected={detailPlan?.id === plan.id}
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
          onClose={closePlan}
          onBuy={closePlan}
        />
      )}
    </Elements>
  );
}
