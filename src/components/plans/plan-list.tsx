import { PlanCard } from "./plan-card";
import type { PlanWithCountry } from "@/lib/types";

type Props = {
  plans: PlanWithCountry[];
};

export function PlanList({ plans }: Props) {
  if (plans.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">No plans found.</p>
        <p className="text-sm text-muted-foreground mt-1">
          Try a different country or search term.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {plans.map((plan) => (
        <PlanCard key={plan.id} plan={plan} />
      ))}
    </div>
  );
}
