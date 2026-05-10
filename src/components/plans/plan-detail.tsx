"use client";

import { useState } from "react";
import { Globe, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/components/cart/cart-context";
import type { PlanWithCountry } from "@/lib/types";
import { formatPrice, formatDataAmount } from "@/lib/utils";

type Props = {
  plan: PlanWithCountry;
};

export function PlanDetail({ plan }: Props) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const isRegional = plan.coverage_type === "regional";

  const handleAdd = () => {
    addItem({
      planId: plan.id,
      planName: plan.name,
      countryName: isRegional ? plan.coverage_region || "Global" : plan.country.name,
      countryFlag: plan.country.flag_emoji || "🌍",
      dataAmountGb: plan.data_amount_gb,
      validityDays: plan.validity_days,
      priceCents: plan.price_cents,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      {/* Left: Plan info */}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex items-center gap-3">
          {isRegional ? (
            <Globe className="h-8 w-8 text-muted-foreground" />
          ) : (
            <span className="text-3xl">{plan.country.flag_emoji}</span>
          )}
          <div>
            <p className="text-sm text-muted-foreground">
              {isRegional ? "Regional Plan" : plan.country.name}
            </p>
            <h1 className="text-2xl font-bold">{plan.name}</h1>
          </div>
        </div>

        {plan.description && (
          <p className="text-muted-foreground leading-relaxed">
            {plan.description}
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="text-sm px-3 py-1">
            {formatDataAmount(plan.data_amount_gb)}
          </Badge>
          <Badge variant="secondary" className="text-sm px-3 py-1">
            {plan.validity_days} days validity
          </Badge>
          {isRegional && (
            <Badge variant="outline" className="text-sm px-3 py-1">
              Coverage: {plan.coverage_region}
            </Badge>
          )}
        </div>

        {plan.apn && (
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">APN:</span> {plan.apn}
          </div>
        )}

        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
          {[
            "Instant delivery via email",
            "No roaming charges",
            "Keep your primary SIM for calls",
            "Works on all eSIM-compatible devices",
          ].map((feature) => (
            <div key={feature} className="flex items-center gap-1.5">
              <Check className="h-4 w-4 text-green-600" />
              {feature}
            </div>
          ))}
        </div>
      </div>

      {/* Right: Purchase box */}
      <div className="lg:col-span-1">
        <div className="sticky top-20 border rounded-xl p-6 space-y-4 bg-card">
          <p className="text-3xl font-bold tabular-nums">
            {formatPrice(plan.price_cents)}
          </p>

          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Quantity</span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                -
              </Button>
              <span className="w-8 text-center font-medium tabular-nums">
                {quantity}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setQuantity(Math.min(10, quantity + 1))}
              >
                +
              </Button>
            </div>
          </div>

          <Button
            className="w-full"
            size="lg"
            onClick={() => {
              for (let i = 0; i < quantity; i++) handleAdd();
            }}
          >
            {added ? "Added!" : "Add to Cart"}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            No account needed. Pay with card.
          </p>
        </div>
      </div>
    </div>
  );
}
