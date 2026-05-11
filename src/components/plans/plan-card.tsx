"use client";

import type { DisplayPlan } from "@/lib/esimaccess/catalog";
import { formatPrice, formatDataAmount } from "@/lib/utils";

type Props = {
  plan: DisplayPlan;
  onSelect: (plan: DisplayPlan) => void;
  selected?: boolean;
};

export function PlanCard({ plan, onSelect, selected }: Props) {
  return (
    <button
      onClick={() => onSelect(plan)}
      className={`w-full text-left rounded-2xl bg-card px-4 py-3.5 transition-all duration-150 border ${
        selected
          ? "border-[#f84f5a] ring-2 ring-[#f84f5a]/20 shadow-md"
          : "border-border/60 shadow-sm hover:shadow-md"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-lg shrink-0">{plan.flagEmoji}</span>
            <span className="text-xs text-muted-foreground font-medium truncate">
              {plan.locationName}
            </span>
          </div>
          <h3 className="font-semibold text-sm text-foreground truncate">
            {plan.name}
          </h3>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-[11px] text-muted-foreground">
              {formatDataAmount(plan.dataAmountGb)}
            </span>
            <span className="text-muted-foreground/30">&middot;</span>
            <span className="text-[11px] text-muted-foreground">
              {plan.validityDays} days
            </span>
            <span className="text-muted-foreground/30">&middot;</span>
            <span className="text-[11px] text-muted-foreground">
              {plan.speed}
            </span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-base font-bold tracking-tight tabular-nums text-foreground">
            {formatPrice(plan.priceCents)}
          </p>
          <p className="text-[10px] text-muted-foreground">
            tax incl.
          </p>
        </div>
      </div>
    </button>
  );
}
