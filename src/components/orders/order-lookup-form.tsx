"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function OrderLookupForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !orderNumber.trim()) {
      setError("Please fill in both fields.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/orders/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          orderNumber: orderNumber.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Order not found.");
        setLoading(false);
        return;
      }

      router.push(
        `/order-lookup/${data.order_number}?email=${encodeURIComponent(data.customer_email)}`
      );
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-sm mx-auto">
      <div className="space-y-2">
        <label htmlFor="lookup-email" className="text-sm font-medium">
          Email address
        </label>
        <Input
          id="lookup-email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="lookup-order" className="text-sm font-medium">
          Order number
        </label>
        <Input
          id="lookup-order"
          placeholder="ORD-XXXXXXXX"
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          "Searching..."
        ) : (
          <>
            <Search className="mr-2 h-4 w-4" />
            Look Up Order
          </>
        )}
      </Button>
    </form>
  );
}
