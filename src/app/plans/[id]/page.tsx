import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PlanDetail } from "@/components/plans/plan-detail";
import { getPlanById } from "@/lib/d1/data";
import type { PlanWithCountry } from "@/lib/types";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const plan = await getPlanById(id);
  if (!plan) return { title: "Plan Not Found" };
  return {
    title: `${plan.name} — ${plan.country.name}`,
    description: plan.description,
  };
}

export default async function PlanDetailPage({ params }: Props) {
  const { id } = await params;
  const plan = await getPlanById(id);
  if (!plan) notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <PlanDetail plan={plan as PlanWithCountry} />
    </div>
  );
}
