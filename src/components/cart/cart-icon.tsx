"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "./cart-context";
import { cn } from "@/lib/utils";

export function CartIcon() {
  const { totalItems, hydrated } = useCart();

  return (
    <Link
      href="/cart"
      className="relative inline-flex items-center justify-center p-2 rounded-md hover:bg-accent transition-colors"
      aria-label={`Cart with ${totalItems} items`}
    >
      <ShoppingCart className="h-5 w-5" />
      {hydrated && totalItems > 0 && (
        <span
          className={cn(
            "absolute -top-0.5 -right-0.5 inline-flex items-center justify-center",
            "min-w-[18px] h-[18px] rounded-full bg-red-500 text-white",
            "text-[10px] font-bold px-1"
          )}
        >
          {totalItems > 99 ? "99+" : totalItems}
        </span>
      )}
    </Link>
  );
}
