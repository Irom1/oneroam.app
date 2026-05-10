"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { CartItem as CartItemType } from "@/lib/types";
import { formatPrice, formatDataAmount } from "@/lib/utils";

type Props = {
  item: CartItemType;
  onUpdateQuantity: (planId: string, quantity: number) => void;
  onRemove: (planId: string) => void;
};

export function CartItemRow({ item, onUpdateQuantity, onRemove }: Props) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-lg">{item.countryFlag}</span>
            <p className="font-semibold truncate">
              {item.countryName} &mdash; {item.planName}
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            {formatDataAmount(item.dataAmountGb)} &middot; {item.validityDays}{" "}
            days
          </p>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() =>
              onUpdateQuantity(item.planId, item.quantity - 1)
            }
          >
            <Minus className="h-3 w-3" />
          </Button>
          <span className="w-8 text-center text-sm font-medium tabular-nums">
            {item.quantity}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() =>
              onUpdateQuantity(item.planId, item.quantity + 1)
            }
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>

        <p className="w-20 text-right font-semibold tabular-nums text-sm">
          {formatPrice(item.priceCents * item.quantity)}
        </p>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          onClick={() => onRemove(item.planId)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
