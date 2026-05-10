"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  PaymentRequestButtonElement,
  useStripe,
} from "@stripe/react-stripe-js";
import type { PaymentRequest } from "@stripe/stripe-js";
import { formatPrice } from "@/lib/utils";
import type { DisplayPlan } from "@/lib/esimaccess/catalog";

type Props = {
  plan: DisplayPlan | null;
  onClear: () => void;
};

export function PaymentBar({ plan, onClear }: Props) {
  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-[60] transition-transform duration-300 ${
        plan ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="bg-[#1a1a1a] border-t border-white/10 px-4 py-3 sm:px-6">
        <div className="mx-auto max-w-5xl flex items-center justify-between gap-4">
          <button
            onClick={onClear}
            className="text-sm text-white/50 hover:text-white/80 transition-colors shrink-0"
          >
            Cancel
          </button>
          <div className="flex-1 text-center min-w-0">
            <p className="text-sm font-medium text-white truncate">{plan?.name}</p>
            <p className="text-xs text-white/40">
              {plan?.locationName} &middot; {plan?.dataAmountGb}GB &middot;{" "}
              {plan?.validityDays} days
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-lg font-bold tracking-tight tabular-nums text-white">
              {plan ? formatPrice(plan.priceCents) : ""}
            </p>
            <p className="text-[10px] text-white/40">tax incl.</p>
          </div>
        </div>

        {plan && (
          <div className="mx-auto max-w-5xl mt-3">
            <StripePaymentButton plan={plan} />
          </div>
        )}
      </div>
    </div>
  );
}

function StripePaymentButton({ plan }: { plan: DisplayPlan }) {
  const stripe = useStripe();
  const router = useRouter();
  const [paymentRequest, setPaymentRequest] = useState<PaymentRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const createPaymentIntent = useCallback(async (email: string) => {
    const res = await fetch("/api/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ packageCode: plan.id, email }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to create payment");
    }
    return res.json();
  }, [plan.id]);

  useEffect(() => {
    if (!stripe) return;

    const pr = stripe.paymentRequest({
      country: "US",
      currency: "usd",
      total: {
        label: `${plan.name} (tax incl.)`,
        amount: plan.priceCents,
      },
      requestPayerName: false,
      requestPayerEmail: true,
    });

    pr.canMakePayment().then((result) => {
      if (result) setPaymentRequest(pr);
      setLoading(false);
    });

    pr.on("paymentmethod", async (ev) => {
      try {
        const email = ev.payerEmail || "";
        const { clientSecret, paymentIntentId } = await createPaymentIntent(email);
        const { error: confirmError } = await stripe.confirmCardPayment(
          clientSecret,
          { payment_method: ev.paymentMethod.id },
          { handleActions: false }
        );
        if (confirmError) {
          ev.complete("fail");
          setError(confirmError.message || "Payment failed");
        } else {
          ev.complete("success");
          router.push(
            `/checkout/success?payment_intent=${paymentIntentId}`
          );
        }
      } catch (err) {
        ev.complete("fail");
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    });

    return () => {};
  }, [stripe, plan, createPaymentIntent, router]);

  if (loading) {
    return (
      <div className="h-12 rounded-xl bg-white/10 animate-pulse flex items-center justify-center">
        <span className="text-sm text-white/40">Loading…</span>
      </div>
    );
  }

  if (!paymentRequest) {
    return (
      <div className="text-center py-2">
        <p className="text-sm text-white/50">
          Apple Pay / Google Pay not available on this device.
        </p>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <p className="text-sm text-red-400 text-center mb-2">{error}</p>
      )}
      <PaymentRequestButtonElement
        options={{
          paymentRequest,
          style: {
            paymentRequestButton: {
              type: "buy",
              theme: "dark",
              height: "48px",
            },
          },
        }}
      />
    </div>
  );
}
