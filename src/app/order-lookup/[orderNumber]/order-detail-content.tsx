"use client";

import { useEffect, useState, use } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OrderDetail } from "@/components/orders/order-detail";
import { cn } from "@/lib/utils";
import type { OrderWithItems } from "@/lib/types";

export function OrderDetailContent({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = use(params);
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";

  const [email, setEmail] = useState(emailParam);
  const [order, setOrder] = useState<OrderWithItems | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (emailParam) {
      fetchOrder(emailParam);
    }
  }, [emailParam]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchOrder = async (emailToUse: string) => {
    setLoading(true);
    setError("");
    setHasSearched(true);

    try {
      const res = await fetch("/api/orders/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailToUse.trim(),
          orderNumber,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Order not found.");
        setOrder(null);
      } else {
        setOrder(data);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) fetchOrder(email);
  };

  if (!emailParam && !hasSearched) {
    return (
      <div className="mx-auto max-w-sm px-4 py-16">
        <h1 className="text-xl font-bold text-center mb-6">
          Order {orderNumber}
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Enter your email to view this order
            </label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <button
            type="submit"
            className={cn(buttonVariants(), "w-full")}
            disabled={loading}
          >
            {loading ? "Loading..." : "View Order"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      {loading && (
        <p className="text-center text-muted-foreground py-8">
          Loading order...
        </p>
      )}

      {!loading && order && <OrderDetail order={order} />}

      {!loading && !order && hasSearched && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">{error || "Order not found."}</p>
          <Link
            href="/order-lookup"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "mt-4 no-underline inline-flex"
            )}
          >
            Try Again
          </Link>
        </div>
      )}

      <div className="mt-8 text-center">
        <Link
          href="/order-lookup"
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "no-underline inline-flex"
          )}
        >
          Look up another order
        </Link>
      </div>
    </div>
  );
}
