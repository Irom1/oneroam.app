import type { Metadata } from "next";
import { OrderLookupForm } from "@/components/orders/order-lookup-form";

export const metadata: Metadata = {
  title: "Track Your Order",
  description: "Look up your eSIM order by email and order number.",
};

export default function OrderLookupPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Track Your Order</h1>
        <p className="mt-2 text-muted-foreground">
          Enter the email and order number from your confirmation.
        </p>
      </div>
      <OrderLookupForm />
    </div>
  );
}
