"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Signal, Wifi, WifiOff } from "lucide-react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { PlanCard } from "@/components/plans/plan-card";
import { PlanDetailModal } from "@/components/plans/plan-detail-modal";
import type { DisplayPlan } from "@/lib/esimaccess/catalog";

const STRIPE_KEY =
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
  "pk_live_51TVNdhCHYA58HEMJhvqk25WmnU1Wcj09Y1n2yMVZwo3jGyTeuvbiQZY6tHKMur8J4x0t7LxQVShtiuL1AjgUg0bM00Ph4nPLfM";
const stripePromise = loadStripe(STRIPE_KEY);

interface UsageData {
  totalVolume?: number;
  usedVolume?: number;
  status?: string;
}

export function TopupContent() {
  const searchParams = useSearchParams();
  const iccidParam = searchParams.get("iccid") || "";
  const orderParam = searchParams.get("order") || "";

  const [iccid, setIccid] = useState(iccidParam);
  const [plans, setPlans] = useState<DisplayPlan[]>([]);
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [detailPlan, setDetailPlan] = useState<DisplayPlan | null>(null);

  // Auto-load if ICCID or order from link
  useEffect(() => {
    if (iccidParam.trim()) {
      setIccid(iccidParam.trim());
      lookup(iccidParam.trim());
    } else if (orderParam.trim()) {
      setLoading(true);
      fetch("/api/esim-details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNo: orderParam.trim() }),
      }).then(r => r.json()).then(d => {
        if (d.iccid) {
          setIccid(d.iccid);
          lookup(d.iccid);
        } else {
          setError("Could not find eSIM for this order.");
          setLoading(false);
        }
      }).catch(() => { setError("Failed to look up order."); setLoading(false); });
    }
  }, [iccidParam, orderParam]);

  const lookup = async (iccidToUse?: string) => {
    const iccidVal = (iccidToUse || iccid).trim();
    if (!iccidVal) return;
    setLoading(true);
    setError("");
    setPlans([]);
    setUsage(null);

    try {
      const [usageRes, plansRes] = await Promise.all([
        fetch("/api/usage", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ iccid: iccidVal }) }),
        fetch("/api/topup/options", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ iccid: iccidVal }) }),
      ]);
      const usageData = await usageRes.json();
      const plansData = await plansRes.json();
      if (usageRes.ok) setUsage(usageData.usage || null);
      if (plansRes.ok && Array.isArray(plansData.plans)) {
        setPlans(plansData.plans.filter((p: DisplayPlan) => p.dataAmountGb >= 1));
      } else if (!usageRes.ok) {
        setError("eSIM not found. Check your ICCID.");
      }
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const usagePercent =
    usage?.totalVolume && usage?.usedVolume
      ? Math.round((usage.usedVolume / usage.totalVolume) * 100)
      : 0;

  return (
    <Elements stripe={stripePromise}>
      <div className="mx-auto max-w-lg px-4 py-12 pb-24">
        <h1 className="text-2xl font-bold tracking-tight text-center">eSIM Top-up</h1>
        <p className="mt-2 text-sm text-muted-foreground text-center">Check your data usage and add more if needed</p>

        {/* ICCID input */}
        {!iccidParam && (
          <div className="mt-8">
            <div className="flex gap-2">
              <input
                type="text"
                inputMode="numeric"
                autoCapitalize="off"
                placeholder="ICCID from your order email"
                value={iccid}
                onChange={(e) => setIccid(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && lookup()}
                className="flex-1 h-12 px-4 rounded-xl border border-border bg-card text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button
                onClick={() => lookup()}
                disabled={loading || !iccid.trim()}
                className="h-12 px-5 rounded-xl bg-foreground text-background font-medium text-sm hover:opacity-80 transition-opacity disabled:opacity-40 shrink-0"
              >
                {loading ? "…" : "Look up"}
              </button>
            </div>
            {error && <p className="mt-2 text-sm text-destructive">{error}</p>}

            <EmailRecovery />
          </div>
        )}

        {/* Usage bar */}
        {usage && (
          <div className="mt-6 bg-card rounded-2xl border border-border p-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Data Usage</p>
            <div className="flex items-center gap-3 mb-2">
              {usagePercent > 90 ? <WifiOff className="h-5 w-5 text-destructive" />
                : usagePercent > 50 ? <Signal className="h-5 w-5 text-amber-500" />
                : <Wifi className="h-5 w-5 text-[#7ecb8a]" />}
              <span className="text-sm font-medium">
                {usage.totalVolume && usage.usedVolume
                  ? `${formatBytes(usage.usedVolume)} / ${formatBytes(usage.totalVolume)} used`
                  : usage.status || "Active"}
              </span>
            </div>
            {usage.totalVolume && usage.usedVolume ? (
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className={`h-full rounded-full transition-all ${usagePercent > 90 ? "bg-destructive" : usagePercent > 50 ? "bg-amber-500" : "bg-[#7ecb8a]"}`}
                  style={{ width: `${Math.min(usagePercent, 100)}%` }} />
              </div>
            ) : null}
          </div>
        )}

        {/* Loading state for auto-load */}
        {loading && iccidParam && (
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">Loading usage data…</p>
          </div>
        )}

        {/* Topup plans */}
        {plans.length > 0 && (
          <div className="mt-6">
            <p className="text-sm font-medium text-muted-foreground mb-3">Available top-up plans</p>
            <div className="space-y-2">
              {plans.map((plan) => (
                <PlanCard key={plan.id} plan={plan} onSelect={(p) => setDetailPlan(p)} />
              ))}
            </div>
          </div>
        )}

        {!loading && plans.length === 0 && !error && (iccidParam || iccid) && (
          <p className="mt-6 text-center text-sm text-muted-foreground">No top-up plans available for this eSIM.</p>
        )}
      </div>

      {detailPlan && <PlanDetailModal plan={detailPlan} onClose={() => setDetailPlan(null)} onBuy={() => setDetailPlan(null)} />}
    </Elements>
  );
}

function EmailRecovery() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");

  const sendEmail = async () => {
    if (!email.trim()) return;
    setSending(true); setErr("");
    const res = await fetch("/api/topup/email-iccids", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim() }),
    });
    const d = await res.json();
    if (d.ok) setSent(true);
    else setErr(d.error || "No orders found");
    setSending(false);
  };

  return (
    <div className="mt-6 pt-4 border-t border-border">
      <p className="text-xs text-muted-foreground mb-2">Don&apos;t have your ICCID? Enter your order email and we&apos;ll send your details.</p>
      <div className="flex gap-2">
        <input
          type="email"
          placeholder="Order email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 h-10 px-3 rounded-lg border border-border bg-card text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <button
          onClick={sendEmail}
          disabled={sending || sent || !email.trim()}
          className="h-10 px-4 rounded-lg border border-border text-xs hover:bg-muted transition-colors disabled:opacity-40 shrink-0"
        >
          {sent ? "Sent!" : sending ? "…" : "Send"}
        </button>
      </div>
      {err && <p className="mt-1 text-[11px] text-destructive">{err}</p>}
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  return `${(bytes / (1024 * 1024)).toFixed(0)} MB`;
}
