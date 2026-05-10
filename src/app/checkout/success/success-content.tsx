"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Copy, Loader2 } from "lucide-react";

export function SuccessContent() {
  const searchParams = useSearchParams();
  const paymentIntent = searchParams.get("payment_intent");
  const planId = searchParams.get("plan");
  const [status, setStatus] = useState<"loading" | "done" | "error">("loading");
  const [esim, setEsim] = useState<{
    orderNo: string;
    iccid?: string;
    qrCodeUrl?: string;
    ac?: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!paymentIntent) {
      setStatus("error");
      return;
    }

    let attempts = 0;
    const maxAttempts = 20;

    const poll = async () => {
      try {
        const res = await fetch(
          `/api/orders/by-payment?payment_intent=${paymentIntent}`
        );
        const data = await res.json();

        if (res.ok && data.order && data.order.status === "fulfilled") {
          setEsim(data.order);
          setStatus("done");
          return;
        }
      } catch {
        // continue polling
      }

      attempts++;
      if (attempts >= maxAttempts) {
        setStatus("error");
        return;
      }
      setTimeout(poll, 2000);
    };

    poll();
  }, [paymentIntent]);

  if (status === "loading") {
    return (
      <div className="space-y-4">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
        <h1 className="text-xl font-bold">Activating your eSIM…</h1>
        <p className="text-muted-foreground text-sm">
          We&apos;re provisioning your eSIM. This takes just a moment.
        </p>
      </div>
    );
  }

  if (status === "error" || !esim) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-bold">Almost there</h1>
        <p className="text-muted-foreground text-sm">
          Your payment went through, but we&apos;re still provisioning your eSIM.
          You&apos;ll receive an email shortly with activation details.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-[#d4e8d4]">
        <CheckCircle className="h-7 w-7 text-[#2d5a2d]" />
      </div>
      <h1 className="text-2xl font-bold">eSIM Ready</h1>
      <p className="text-muted-foreground text-sm">
        Your eSIM has been activated. Scan the QR code below or enter the
        activation code manually.
      </p>

      {esim.qrCodeUrl && (
        <div className="bg-white rounded-2xl border border-border p-4 inline-block mx-auto">
          <img
            src={esim.qrCodeUrl}
            alt="eSIM QR Code"
            className="w-48 h-48"
          />
        </div>
      )}

      <div className="space-y-3 bg-card rounded-2xl border border-border p-5 text-left max-w-sm mx-auto">
        {esim.ac && (
          <div>
            <p className="text-xs text-muted-foreground mb-1">
              Activation Code
            </p>
            <div className="flex items-center justify-between gap-2">
              <code className="text-lg font-mono font-bold tracking-wider">
                {esim.ac}
              </code>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(esim.ac || "");
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
            {copied && (
              <p className="text-xs text-[#7ecb8a] mt-1">Copied!</p>
            )}
          </div>
        )}

        {esim.iccid && (
          <div>
            <p className="text-xs text-muted-foreground mb-1">ICCID</p>
            <code className="text-sm font-mono">{esim.iccid}</code>
          </div>
        )}

        {esim.orderNo && (
          <div>
            <p className="text-xs text-muted-foreground mb-1">Order Ref</p>
            <code className="text-sm font-mono">{esim.orderNo}</code>
          </div>
        )}
      </div>

      <div className="pt-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          Get another eSIM
        </Link>
      </div>
    </div>
  );
}
