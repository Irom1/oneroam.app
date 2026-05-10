import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { PlanDetail } from "@/components/plans/plan-detail";
import type { PlanWithCountry } from "@/lib/types";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: plan } = await supabase
    .from("plans")
    .select("*, country:countries(*)")
    .eq("id", id)
    .single();

  if (!plan) return { title: "Plan Not Found" };

  const p = plan as PlanWithCountry;
  return {
    title: `${p.name} — ${p.country.name}`,
    description: p.description,
  };
}

export default async function PlanDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: plan } = await supabase
    .from("plans")
    .select("*, country:countries(*)")
    .eq("id", id)
    .single();

  if (!plan) notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <PlanDetail plan={plan as PlanWithCountry} />
    </div>
  );
}
