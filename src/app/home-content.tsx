"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, X, ArrowRight } from "lucide-react";
import { Elements } from "@stripe/react-stripe-js";
import { HeroSection } from "@/components/landing/hero-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { PlanCard } from "@/components/plans/plan-card";
import { PlanDetailModal } from "@/components/plans/plan-detail-modal";
import type { DisplayPlan } from "@/lib/esimaccess/catalog";
import { getStripe } from "@/lib/stripe/client";

const MIN_GB = 10;
const MAX_GB = 30;
const MIN_DAYS = 30;

const stripePromise = getStripe();

export function HomeContent() {
  const router = useRouter();

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
      window.history.replaceState(null, "", `/plan/${plan.id}`);
    },
    []
  );

  const closePlan = useCallback(() => {
    setDetailPlan(null);
    window.history.replaceState(null, "", "/");
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

      <HowItWorksSection />

      {/* Plans section */}
      <section id="plans" className="pb-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-center text-foreground mb-2">
            Browse eSIM plans
          </h2>
          <p className="text-sm text-muted-foreground text-center mb-8">
            10–30GB &middot; 30+ day validity &middot; 100+ countries
          </p>

          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-border/60 bg-card p-4 h-24 animate-pulse"
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
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search country or region…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-12 pl-10 pr-10 rounded-2xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#f84f5a]/20 focus:border-[#f84f5a] transition-all shadow-sm"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
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

      {/* Pre-footer CTA */}
      <section className="pb-16 sm:pb-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div
            className="rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #f84f5a, #e8454f)",
              boxShadow: "0 20px 60px rgba(248, 79, 90, 0.3)",
            }}
          >
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Ready to roam?
            </h2>
            <p className="mt-3 text-white/80 text-sm sm:text-base max-w-sm mx-auto">
              Buy an eSIM now and land connected. No account, no hassle — just
              data that works.
            </p>
            <a
              href="#plans"
              className="mt-6 inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white text-[#f84f5a] font-semibold text-sm hover:bg-white/95 transition-colors"
            >
              View plans
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
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
