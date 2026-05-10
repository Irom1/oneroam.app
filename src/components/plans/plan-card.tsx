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
      className={`w-full text-left rounded-2xl border bg-card p-4 transition-all duration-200 ${
        selected
          ? "border-primary ring-2 ring-primary/20 shadow-md"
          : "border-border hover:border-primary/30 hover:-translate-y-0.5 hover:shadow-lg"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0 overflow-hidden">
          <div className="flex items-center gap-1.5 mb-1 min-w-0">
            <span className="text-xl shrink-0">{plan.flagEmoji}</span>
            <span className="text-xs text-muted-foreground font-medium truncate">
              {plan.locationName}
              {plan.isRegional && plan.countryCount && (
                <span className="ml-1 opacity-60">
                  +{plan.countryCount}
                </span>
              )}
            </span>
          </div>
          <h3 className="font-semibold text-sm text-foreground truncate">
            {plan.name}
          </h3>
          <div className="flex flex-wrap gap-1 mt-1.5">
            <span className="inline-flex items-center rounded-full bg-[#a8d8ea]/30 px-2 py-0.5 text-[11px] font-medium whitespace-nowrap">
              {formatDataAmount(plan.dataAmountGb)}
            </span>
            <span className="inline-flex items-center rounded-full bg-[#f8e8d0]/50 px-2 py-0.5 text-[11px] font-medium whitespace-nowrap">
              {plan.validityDays}d
            </span>
            <span className="inline-flex items-center rounded-full bg-[#d4e8d4]/50 px-2 py-0.5 text-[11px] font-medium whitespace-nowrap">
              {plan.speed}
            </span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-lg font-bold tracking-tight tabular-nums">
            {formatPrice(plan.priceCents)}
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            tax incl.
          </p>
        </div>
      </div>

      {plan.operators.length > 0 && (
        <div className="mt-2.5 pt-2.5 border-t border-border/30 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
          {plan.operators.slice(0, 2).map((op) => (
            <span key={op.name} className="flex items-center gap-1 whitespace-nowrap">
              <span className="w-1 h-1 rounded-full bg-[#7ecb8a] shrink-0" />
              {op.name}
            </span>
          ))}
        </div>
      )}
    </button>
  );
}
