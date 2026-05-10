"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/components/cart/cart-context";
import { CartItemRow } from "@/components/cart/cart-item";
import { CartSummary } from "@/components/cart/cart-summary";
import { cn } from "@/lib/utils";

export default function CartPage() {
  const { items, totalCents, updateQuantity, removeItem, clearCart } =
    useCart();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCheckout = async () => {
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            planId: i.planId,
            quantity: i.quantity,
          })),
          email: email.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.url) {
        setError(data.error || "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      window.location.href = data.url;
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground" />
        <h1 className="mt-4 text-2xl font-bold">Your cart is empty</h1>
        <p className="mt-2 text-muted-foreground">
          Browse our plans and find the perfect eSIM for your trip.
        </p>
        <Link
          href="/plans"
          className={cn(buttonVariants(), "mt-6 no-underline inline-flex")}
        >
          Browse Plans
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold tracking-tight">Your Cart</h1>

      <div className="mt-6 space-y-3">
        {items.map((item) => (
          <CartItemRow
            key={item.planId}
            item={item}
            onUpdateQuantity={updateQuantity}
            onRemove={removeItem}
          />
        ))}
      </div>

      {/* Email input */}
      <div className="mt-8 space-y-2">
        <label htmlFor="email" className="text-sm font-medium">
          Email for order confirmation
        </label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

      {/* Summary + Checkout */}
      <div className="mt-6">
        <CartSummary
          totalCents={totalCents}
          onCheckout={handleCheckout}
          loading={loading}
          disabled={items.length === 0}
        />
      </div>
    </div>
  );
}
