"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Copy, Loader2, Smartphone, QrCode } from "lucide-react";

export function SuccessContent() {
  const searchParams = useSearchParams();
  const paymentIntentId = searchParams.get("payment_intent");
  const [status, setStatus] = useState<"loading" | "done" | "error">("loading");
  const [esim, setEsim] = useState<{
    orderNo: string;
    iccid?: string;
    qrCodeUrl?: string;
    ac?: string;
    shortUrl?: string;
  } | null>(null);
  const [copied, setCopied] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!paymentIntentId) {
      setStatus("error");
      setErrorMsg("No payment reference found.");
      return;
    }

    fetch("/api/provision-esim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentIntentId }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.esim) {
          setEsim(data.esim);
          setStatus("done");
        } else {
          setStatus("error");
          setErrorMsg(data.error || "Could not provision eSIM.");
        }
      })
      .catch(() => {
        setStatus("error");
        setErrorMsg("Network error. Please contact support.");
      });
  }, [paymentIntentId]);

  const copyToClip = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(""), 2000);
  };

  if (status === "loading") {
    return (
      <div className="space-y-4">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
        <h1 className="text-xl font-bold">Activating your eSIM…</h1>
        <p className="text-muted-foreground text-sm">We're provisioning your eSIM. This takes just a few seconds.</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-bold">Almost there</h1>
        <p className="text-muted-foreground text-sm">{errorMsg || "Your payment went through. Your eSIM is being provisioned."}</p>
        <p className="text-xs text-muted-foreground">Ref: {paymentIntentId?.slice(-12)}</p>
        <Link href="/" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">Back to home</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-[#d4e8d4]">
        <CheckCircle className="h-7 w-7 text-[#2d5a2d]" />
      </div>
      <h1 className="text-2xl font-bold">eSIM Ready</h1>
      <p className="text-muted-foreground text-sm">Tap the QR code or use the activation code below to install.</p>

      {/* QR code — long press to add eSIM on iOS 17+ */}
      {esim?.qrCodeUrl && (
        <div className="space-y-1">
          <div className="bg-white rounded-2xl border-2 border-[#7ecb8a]/30 p-4 mx-auto max-w-[220px]">
            <img src={esim.qrCodeUrl} alt="eSIM QR Code — long press to install" className="w-full h-auto" />
          </div>
          <p className="text-[11px] text-muted-foreground">
            Long press the QR code to install eSIM
          </p>
        </div>
      )}

      {/* Activation code — LPA string */}
      {esim?.ac && (
        <div className="bg-card rounded-2xl border border-border p-4 text-left max-w-sm mx-auto">
          <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
            <QrCode className="h-3.5 w-3.5" /> Activation Code
          </p>
          <div className="flex items-start gap-2">
            <code className="text-xs font-mono break-all leading-relaxed flex-1">{esim.ac}</code>
            <button
              onClick={() => copyToClip(esim.ac || "", "ac")}
              className="text-muted-foreground hover:text-foreground transition-colors shrink-0 mt-0.5"
            >
              {copied === "ac" ? (
                <span className="text-[11px] text-[#7ecb8a] font-medium">Copied!</span>
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          </div>
          <p className="text-[11px] text-muted-foreground mt-2">
            Go to <strong>Settings → Cellular → Add eSIM</strong> and paste this code.
          </p>
        </div>
      )}

      {/* Install instructions */}
      <div className="bg-card rounded-2xl border border-border p-4 text-left max-w-sm mx-auto space-y-3">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
          <Smartphone className="h-3.5 w-3.5" /> How to install
        </p>
        <div className="space-y-2 text-xs text-muted-foreground">
          <div>
            <p className="font-medium text-foreground">iPhone</p>
            <p>Long press the QR code above → Add eSIM, or go to Settings → Cellular → Add eSIM → Use QR Code</p>
          </div>
          <div>
            <p className="font-medium text-foreground">Android</p>
            <p>Settings → Connections → SIM Manager → Add eSIM → Scan QR code from the email</p>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-2 bg-card rounded-2xl border border-border p-4 text-left max-w-sm mx-auto">
        {esim?.iccid && (
          <div>
            <p className="text-[11px] text-muted-foreground">ICCID</p>
            <div className="flex items-center justify-between gap-2">
              <code className="text-xs font-mono break-all">{esim.iccid}</code>
              <button onClick={() => copyToClip(esim?.iccid || "", "iccid")} className="text-muted-foreground hover:text-foreground shrink-0">
                <Copy className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
        {esim?.orderNo && (
          <div>
            <p className="text-[11px] text-muted-foreground">Order Ref</p>
            <code className="text-xs font-mono">{esim.orderNo}</code>
          </div>
        )}
      </div>

      <div className="pt-4 space-y-3">
        <p className="text-xs text-muted-foreground">Activation details also sent to your email.</p>
        <Link href="/" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
          Get another eSIM
        </Link>
      </div>
    </div>
  );
}
