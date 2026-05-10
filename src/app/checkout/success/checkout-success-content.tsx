"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Loader2 } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { useCart } from "@/components/cart/cart-context";
import { OrderDetail } from "@/components/orders/order-detail";
import { cn } from "@/lib/utils";
import type { OrderWithItems } from "@/lib/types";

export function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { clearCart } = useCart();
  const [order, setOrder] = useState<OrderWithItems | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const clearedRef = useRef(false);

  const fetchOrder = useCallback(async () => {
    if (!sessionId) {
      setError("No session ID found.");
      setLoading(false);
      return null;
    }

    const res = await fetch(`/api/orders/by-session?session_id=${sessionId}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data as OrderWithItems;
  }, [sessionId]);

  useEffect(() => {
    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 15;

    const poll = async () => {
      const data = await fetchOrder();

      if (cancelled) return;

      if (data) {
        setOrder(data);
        if (data.status === "completed") {
          setLoading(false);
          if (!clearedRef.current) {
            clearCart();
            clearedRef.current = true;
          }
          return;
        }
        if (data.status === "failed") {
          setLoading(false);
          return;
        }
      }

      attempts++;
      if (attempts >= maxAttempts) {
        setLoading(false);
        return;
      }

      setTimeout(poll, 2000);
    };

    poll();
    return () => {
      cancelled = true;
    };
  }, [fetchOrder, clearCart]);

  if (!sessionId) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <p className="text-muted-foreground">Invalid session.</p>
        <Link
          href="/"
          className={cn(buttonVariants(), "mt-4 no-underline inline-flex")}
        >
          Go Home
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
        <h1 className="mt-4 text-xl font-bold">Verifying your payment...</h1>
        <p className="mt-2 text-muted-foreground">
          This should only take a moment.
        </p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="text-xl font-bold">Something went wrong</h1>
        <p className="mt-2 text-muted-foreground">
          We could not find your order. Contact support if you believe this is
          an error.
        </p>
        <Link
          href="/"
          className={cn(buttonVariants(), "mt-4 no-underline inline-flex")}
        >
          Go Home
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      {order.status === "completed" && (
        <div className="flex items-center gap-2 mb-6">
          <CheckCircle className="h-6 w-6 text-green-600" />
          <span className="text-lg font-semibold text-green-700">
            Order Confirmed
          </span>
        </div>
      )}

      <OrderDetail order={order} />

      <div className="mt-8 flex gap-3 justify-center">
        <Link
          href="/plans"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "no-underline"
          )}
        >
          Browse More Plans
        </Link>
        <Link href="/" className={cn(buttonVariants(), "no-underline")}>
          Go Home
        </Link>
      </div>
    </div>
  );
}
