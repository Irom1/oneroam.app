import { Suspense } from "react";
import type { Metadata } from "next";
import { fetchPackages, buildDisplayPlan } from "@/lib/esimaccess/catalog";
import { PlanPageContent } from "./plan-content";

type Props = { params: Promise<{ code: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { code } = await params;
    const pkgs = await fetchPackages();
    const pkg = pkgs.find((p) => p.packageCode === code);
    if (!pkg) return { title: "Plan not found" };

    const plan = buildDisplayPlan(pkg);
    return {
      title: `${plan.name} — ${plan.locationName} | oneroam`,
      description: `${plan.dataAmountGb}GB eSIM for ${plan.locationName}. ${plan.validityDays} days. ${plan.speed}. $${(plan.priceCents / 100).toFixed(2)} tax included. Buy instantly with Apple Pay.`,
      openGraph: {
        title: `${plan.name} — $${(plan.priceCents / 100).toFixed(2)} | oneroam`,
        description: `${plan.dataAmountGb}GB, ${plan.validityDays} days, ${plan.speed}. ${plan.locationName} eSIM — buy with Apple Pay.`,
      },
      twitter: {
        title: `${plan.name} — $${(plan.priceCents / 100).toFixed(2)} | oneroam`,
        description: `${plan.dataAmountGb}GB, ${plan.validityDays} days, ${plan.locationName}. Buy with Apple Pay.`,
      },
    };
  } catch {
    return {
      title: "eSIM Plan | oneroam",
      description: "Travel eSIM plans with Apple Pay. Half the cost of Airalo.",
    };
  }
}

export default async function PlanPage({ params }: Props) {
  const { code } = await params;

  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-3xl px-3 sm:px-6 pt-20 pb-24">
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-4 h-24 animate-pulse" />
            ))}
          </div>
        </div>
      }
    >
      <PlanPageContent initialPlanCode={code} />
    </Suspense>
  );
}
