"use client";

import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

type Props = {
  totalCents: number;
  onCheckout: () => void;
  loading: boolean;
  disabled: boolean;
};

export function CartSummary({
  totalCents,
  onCheckout,
  loading,
  disabled,
}: Props) {
  return (
    <div className="border-t pt-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-lg font-semibold">Total</span>
        <span className="text-lg font-bold tabular-nums">
          {formatPrice(totalCents)}
        </span>
      </div>
      <Button
        className="w-full"
        size="lg"
        onClick={onCheckout}
        disabled={disabled || loading}
      >
        {loading ? "Redirecting to checkout..." : "Proceed to Checkout"}
      </Button>
    </div>
  );
}
