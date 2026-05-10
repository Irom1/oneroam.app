"use client";

import { X, Globe, Signal, Shield, CreditCard } from "lucide-react";
import type { DisplayPlan } from "@/lib/esimaccess/catalog";
import { formatPrice, formatDataAmount } from "@/lib/utils";

type Props = {
  plan: DisplayPlan;
  onClose: () => void;
  onBuy: () => void;
};

export function PlanDetailModal({ plan, onClose, onBuy }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="relative w-full sm:max-w-lg bg-card rounded-t-3xl sm:rounded-3xl border border-border shadow-2xl max-h-[85vh] overflow-y-auto">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between p-5 pb-2">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-3xl shrink-0">{plan.flagEmoji}</span>
            <div className="min-w-0">
              <h2 className="text-lg font-bold truncate">{plan.name}</h2>
              <p className="text-sm text-muted-foreground truncate">
                {plan.locationName}
                {plan.isRegional && (
                  <span> &middot; {plan.countryCount} countries</span>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-muted transition-colors shrink-0"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Price */}
        <div className="px-5 pb-3">
          <p className="text-3xl font-bold tracking-tight">
            {formatPrice(plan.priceCents)}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">tax included</p>
        </div>

        {/* Specs */}
        <div className="px-5 space-y-4">
          <div className="grid grid-cols-3 gap-2.5">
            <div className="bg-[#a8d8ea]/20 rounded-xl p-3 text-center">
              <p className="text-lg font-bold">{formatDataAmount(plan.dataAmountGb)}</p>
              <p className="text-[11px] text-muted-foreground">Data</p>
            </div>
            <div className="bg-[#f8e8d0]/40 rounded-xl p-3 text-center">
              <p className="text-lg font-bold">{plan.validityDays}d</p>
              <p className="text-[11px] text-muted-foreground">Validity</p>
            </div>
            <div className="bg-[#d4e8d4]/40 rounded-xl p-3 text-center">
              <p className="text-lg font-bold">{plan.speed}</p>
              <p className="text-[11px] text-muted-foreground">Speed</p>
            </div>
          </div>

          {plan.operators.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                Network Operators
              </p>
              <div className="flex flex-wrap gap-2">
                {plan.operators.map((op) => (
                  <span
                    key={op.name}
                    className="inline-flex items-center gap-1.5 bg-card border border-border rounded-lg px-3 py-1.5 text-xs"
                  >
                    <Signal className="h-3 w-3 text-muted-foreground" />
                    {op.name}
                    <span className="text-muted-foreground">{op.networkType}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-start gap-2 text-sm">
              <Shield className="h-4 w-4 text-[#7ecb8a] mt-0.5 shrink-0" />
              <span className="text-muted-foreground text-xs">
                Instant delivery — QR code sent immediately after payment
              </span>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <Globe className="h-4 w-4 text-[#7ecb8a] mt-0.5 shrink-0" />
              <span className="text-muted-foreground text-xs">
                Works on iPhone XS+, Pixel 3+, Galaxy S20+
              </span>
            </div>
          </div>

          {/* Buy button inside modal — payment bar is at z-[60] above this z-50 */}
          <button
            onClick={onBuy}
            className="w-full flex items-center justify-center gap-2 bg-[#1a1a1a] text-white rounded-xl py-3 font-medium text-sm hover:bg-[#333] transition-colors"
          >
            <CreditCard className="h-4 w-4" />
            Buy with Apple Pay / Google Pay
          </button>
        </div>

        <div className="h-4" />
      </div>
    </div>
  );
}
