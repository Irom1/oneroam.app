import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { fetchPackages, buildDisplayPlan } from "@/lib/esimaccess/catalog";

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
  redirect(`/?plan=${code}`);
}
