"use client";

import { useState } from "react";
import { X, Globe, Signal, Shield, ChevronDown, ChevronUp } from "lucide-react";
import {
  PaymentRequestButtonElement,
  useStripe,
} from "@stripe/react-stripe-js";
import type { PaymentRequest } from "@stripe/stripe-js";
import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { DisplayPlan, CountryCoverage } from "@/lib/esimaccess/catalog";
import { formatPrice, formatDataAmount } from "@/lib/utils";

type Props = {
  plan: DisplayPlan;
  onClose: () => void;
  onBuy: () => void;
};

export function PlanDetailModal({ plan, onClose, onBuy }: Props) {
  const [showCoverage, setShowCoverage] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full sm:max-w-lg bg-card rounded-t-3xl sm:rounded-3xl border border-border shadow-2xl max-h-[85vh] overflow-y-auto">
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between p-5 pb-2">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-3xl shrink-0">{plan.flagEmoji}</span>
            <div className="min-w-0">
              <h2 className="text-lg font-bold truncate">{plan.name}</h2>
              <p className="text-sm text-muted-foreground truncate">
                {plan.locationName}
                {plan.isRegional && <span> &middot; {plan.countryCount} countries</span>}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-muted transition-colors shrink-0">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Price */}
        <div className="px-5 pb-3">
          <p className="text-3xl font-bold tracking-tight">{formatPrice(plan.priceCents)}</p>
          <p className="text-xs text-muted-foreground mt-0.5">tax included</p>
        </div>

        {/* Specs */}
        <div className="px-5 space-y-4">
          <div className="grid grid-cols-3 gap-2.5">
            <div className="bg-[#a8d8ea]/20 rounded-xl p-3 text-center">
              <p className="text-lg font-bold">{formatDataAmount(plan.dataAmountGb)}</p>
              <p className="text-[11px] text-muted-foreground">Data</p>
            </div>
            <div className="bg-[#f8e8d0]/40 rounded-xl p-3 text-center">
              <p className="text-lg font-bold">{plan.validityDays}d</p>
              <p className="text-[11px] text-muted-foreground">Validity</p>
            </div>
            <div className="bg-[#d4e8d4]/40 rounded-xl p-3 text-center">
              <p className="text-lg font-bold">{plan.speed}</p>
              <p className="text-[11px] text-muted-foreground">Speed</p>
            </div>
          </div>

          {/* Country coverage — expandable for regional plans */}
          {plan.coverage.length > 0 && (
            <div>
              <button
                onClick={() => setShowCoverage(!showCoverage)}
                className="w-full flex items-center justify-between text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 hover:text-foreground transition-colors"
              >
                {plan.isRegional
                  ? `Coverage (${plan.coverage.length} countries)`
                  : "Network Operators"}
                {plan.coverage.length > 1 && (
                  showCoverage
                    ? <ChevronUp className="h-3.5 w-3.5" />
                    : <ChevronDown className="h-3.5 w-3.5" />
                )}
              </button>

              <div className={`space-y-1 ${!showCoverage && plan.isRegional ? "max-h-24 overflow-hidden" : ""}`}>
                {plan.coverage.map((country) => (
                  <div key={country.locationCode} className="bg-muted/40 rounded-lg px-3 py-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium">{country.locationName}</span>
                      <span className="text-[11px] text-muted-foreground">
                        {country.operators.map((o) => `${o.name} ${o.networkType}`).join(", ")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {plan.isRegional && plan.coverage.length > 3 && !showCoverage && (
                <button
                  onClick={() => setShowCoverage(true)}
                  className="text-xs text-primary hover:underline mt-1"
                >
                  Show all {plan.coverage.length} countries
                </button>
              )}
            </div>
          )}

          {/* Features */}
          <div className="space-y-2">
            <div className="flex items-start gap-2 text-sm">
              <Shield className="h-4 w-4 text-[#7ecb8a] mt-0.5 shrink-0" />
              <span className="text-muted-foreground text-xs">
                Instant delivery — QR code sent immediately after payment
              </span>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <Globe className="h-4 w-4 text-[#7ecb8a] mt-0.5 shrink-0" />
              <span className="text-muted-foreground text-xs">
                Works on iPhone XS+, Pixel 3+, Galaxy S20+
              </span>
            </div>
          </div>

          {/* Payment button with padding below */}
          <div className="pb-6 pt-1">
            <ModalPaymentButton plan={plan} onClose={onClose} />
          </div>
        </div>
      </div>
    </div>
  );
}

function ModalPaymentButton({
  plan,
  onClose,
}: {
  plan: DisplayPlan;
  onClose: () => void;
}) {
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
      total: { label: `${plan.name} (tax incl.)`, amount: plan.priceCents },
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
          router.push(`/checkout/success?payment_intent=${paymentIntentId}`);
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
      <div className="h-12 rounded-xl bg-muted animate-pulse flex items-center justify-center">
        <span className="text-sm text-muted-foreground">Loading…</span>
      </div>
    );
  }

  if (!paymentRequest) {
    return (
      <p className="text-xs text-center text-muted-foreground py-2">
        Apple Pay / Google Pay not available on this device
      </p>
    );
  }

  return (
    <div>
      {error && <p className="text-sm text-destructive text-center mb-2">{error}</p>}
      <PaymentRequestButtonElement
        options={{
          paymentRequest,
          style: {
            paymentRequestButton: { type: "buy", theme: "dark", height: "48px" },
          },
        }}
      />
    </div>
  );
}
