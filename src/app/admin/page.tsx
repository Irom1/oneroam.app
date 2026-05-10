"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Shield, Loader2, ExternalLink, LogOut, X,
  Mail, RefreshCw, CreditCard, Globe,
} from "lucide-react";

interface Order {
  id: string;
  orderNumber: string;
  email: string;
  packageName: string;
  amountCents: number;
  status: string;
  esimOrderNo?: string;
  stripePaymentIntentId?: string;
  createdAt: string;
}

const LINKS = [
  { label: "Stripe", url: "https://dashboard.stripe.com" },
  { label: "eSIM Access", url: "https://console.esimaccess.com" },
  { label: "Resend", url: "https://resend.com/emails" },
  { label: "Cloudflare", url: "https://dash.cloudflare.com/eb4087cec8ac5f5b3e8a8e6560160dcc/workers/services/view/oneroam/production" },
];

const PAGE_SIZE = 10;

export default function AdminPage() {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);
  const [authing, setAuthing] = useState(true);
  const [data, setData] = useState<{
    orders: Order[];
    totalRevenue: number;
    totalOrders: number;
    balance?: { usd: string };
    stripeBalance?: { available: { amount: string; currency: string }[] };
  } | null>(null);
  const [error, setError] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const authenticate = useCallback(async () => {
    try {
      // Empty allowCredentials — OS finds passkey from iCloud Keychain
      const credential = (await navigator.credentials.get({
        publicKey: {
          challenge: new Uint8Array(32),
          rpId: "oneroam.app",
          timeout: 60000,
          userVerification: "preferred",
        },
      })) as PublicKeyCredential;
      if (credential) {
        const res = await fetch("/api/admin/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ credentialId: credential.id }),
        });
        const d = await res.json();
        if (d.ok) setAuthed(true);
        else setError("Authentication failed - set one up first.");
      }
    } catch { setError("Passkey required to access dashboard"); }
    setAuthing(false);
  }, []);

  const fetchData = useCallback(() => {
    fetch("/api/admin/dashboard").then(r => r.json()).then(setData).catch(() => {});
  }, []);

  useEffect(() => { authenticate(); }, [authenticate]);
  useEffect(() => { if (authed) fetchData(); }, [authed, fetchData]);

  const logout = () => {
    localStorage.removeItem("oneroam_admin_credential");
    setAuthed(false); setAuthing(true); authenticate();
  };

  if (authing) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  if (!authed) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center space-y-4">
        <Shield className="mx-auto h-10 w-10 text-muted-foreground" />
        <h1 className="text-xl font-bold">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground">{error}</p>
        <button onClick={authenticate} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-foreground text-background text-sm font-medium hover:opacity-80">
          <Shield className="h-4 w-4" /> Authenticate
        </button>
        <p className="text-xs text-muted-foreground">
          No passkey?{" "}
          <button onClick={() => router.push("/admin/setup")} className="text-primary hover:underline">Set up admin access</button>
        </p>
      </div>
    );
  }

  const visibleOrders = data?.orders?.slice(0, visibleCount) || [];
  const hasMore = data?.orders && visibleCount < data.orders.length;

  return (
    <div className="mx-auto max-w-4xl px-3 sm:px-6 py-6 sm:py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-3">
          <button onClick={fetchData} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            <RefreshCw className="h-3 w-3" /> Refresh
          </button>
          <button onClick={logout} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            <LogOut className="h-3 w-3" /> Lock
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-6">
        <Stat label="Orders" value={String(data?.totalOrders || 0)} />
        <Stat label="Revenue" value={`$${((data?.totalRevenue || 0) / 100).toFixed(0)}`} />
        <Stat label="Balance" value={`$${data?.balance?.usd || "—"}`} />
        <Stat label="Stripe" value={`$${data?.stripeBalance?.available?.[0]?.amount || "—"}`} />
      </div>

      <div className="flex flex-wrap gap-1.5 mb-6">
        {LINKS.map((link) => (
          <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-border text-[11px] text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors">
            {link.label} <ExternalLink className="h-3 w-3" />
          </a>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <p className="text-sm font-medium">Recent Orders</p>
          <span className="text-xs text-muted-foreground">{data?.totalOrders || 0} total</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/30">
              <tr>
                <th className="text-left px-3 sm:px-4 py-2 text-[11px] font-medium text-muted-foreground">Order</th>
                <th className="text-left px-3 sm:px-4 py-2 text-[11px] font-medium text-muted-foreground">Plan</th>
                <th className="hidden sm:table-cell text-left px-3 sm:px-4 py-2 text-[11px] font-medium text-muted-foreground">Email</th>
                <th className="text-right px-3 sm:px-4 py-2 text-[11px] font-medium text-muted-foreground">Amount</th>
                <th className="text-center px-3 sm:px-4 py-2 text-[11px] font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {visibleOrders.map((order) => (
                <tr key={order.id} onClick={() => setSelectedOrder(order)} className="border-t border-border/50 hover:bg-muted/20 cursor-pointer transition-colors">
                  <td className="px-3 sm:px-4 py-2.5 font-mono text-[11px] sm:text-xs">{order.orderNumber}</td>
                  <td className="px-3 sm:px-4 py-2.5 text-[11px] sm:text-xs truncate max-w-[120px] sm:max-w-[200px]">{order.packageName}</td>
                  <td className="hidden sm:table-cell px-3 sm:px-4 py-2.5 text-[11px] text-muted-foreground truncate max-w-[140px]">{order.email}</td>
                  <td className="px-3 sm:px-4 py-2.5 text-[11px] sm:text-xs text-right tabular-nums">${((order.amountCents || 0) / 100).toFixed(2)}</td>
                  <td className="px-3 sm:px-4 py-2.5 text-center">
                    <span className={`text-[10px] sm:text-[11px] px-1.5 py-0.5 rounded-full ${order.status === "completed" ? "bg-[#d4e8d4] text-[#2d5a2d]" : order.status === "failed" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>{order.status}</span>
                  </td>
                </tr>
              ))}
              {visibleOrders.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-[11px] text-muted-foreground">No orders yet</td></tr>}
            </tbody>
          </table>
        </div>
        {hasMore && (
          <div className="px-4 py-3 border-t border-border text-center">
            <button onClick={() => setVisibleCount(c => c + PAGE_SIZE)} className="text-xs text-primary hover:underline font-medium">
              Load more ({data!.orders.length - visibleCount} remaining)
            </button>
          </div>
        )}
      </div>

      {selectedOrder && <OrderModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return <div className="bg-card border border-border rounded-xl p-3 sm:p-4"><p className="text-[10px] sm:text-xs text-muted-foreground">{label}</p><p className="text-lg sm:text-2xl font-bold mt-0.5 truncate">{value}</p></div>;
}

function OrderModal({ order, onClose }: { order: Order; onClose: () => void }) {
  const [actionMsg, setActionMsg] = useState("");
  const [actionLoading, setActionLoading] = useState("");

  const resendEmail = async () => {
    setActionLoading("resend"); setActionMsg("");
    const res = await fetch("/api/admin/resend-email", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderId: order.id }) });
    const d = await res.json();
    setActionMsg(d.ok ? "Email sent!" : d.error || "Failed");
    setActionLoading("");
    setTimeout(() => setActionMsg(""), 2500);
  };

  const reprovision = async () => {
    setActionLoading("reprovision"); setActionMsg("");
    const res = await fetch("/api/admin/reprovision", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderId: order.id }) });
    const d = await res.json();
    setActionMsg(d.ok ? `Reprovisioned: ${d.orderNo}` : d.error || "Failed");
    setActionLoading("");
    setTimeout(() => setActionMsg(""), 3000);
  };

  const stripePi = order.stripePaymentIntentId;
  const stripeUrl = stripePi?.startsWith("pi_") ? `https://dashboard.stripe.com/payments/${stripePi}` : null;
  const topupUrl = order.email ? `/topup?email=${encodeURIComponent(order.email)}` : null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-md bg-card rounded-t-3xl sm:rounded-3xl border border-border shadow-2xl max-h-[85vh] overflow-y-auto">
        <div className="flex justify-center pt-2 pb-1 sm:hidden">
          <button onClick={onClose} className="w-12 h-7 flex items-center justify-center"><span className="w-8 h-1 rounded-full bg-border" /></button>
        </div>
        <div className="flex items-start justify-between px-5 pt-3 pb-1 sm:pt-5">
          <div><h2 className="text-lg font-bold">{order.orderNumber}</h2><p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleString()}</p></div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-muted transition-colors shrink-0"><X className="h-5 w-5 text-muted-foreground" /></button>
        </div>
        <div className="px-5 py-3 space-y-3">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div><p className="text-[11px] text-muted-foreground">Status</p><span className={`text-xs px-1.5 py-0.5 rounded-full ${order.status === "completed" ? "bg-[#d4e8d4] text-[#2d5a2d]" : order.status === "failed" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>{order.status}</span></div>
            <div><p className="text-[11px] text-muted-foreground">Amount</p><p className="font-medium">${((order.amountCents || 0) / 100).toFixed(2)}</p></div>
          </div>
          <div><p className="text-[11px] text-muted-foreground">Plan</p><p className="text-sm">{order.packageName}</p></div>
          <div><p className="text-[11px] text-muted-foreground">Customer</p><p className="text-sm break-all">{order.email}</p></div>
          {order.esimOrderNo && <div><p className="text-[11px] text-muted-foreground">eSIM Order</p><p className="text-xs font-mono">{order.esimOrderNo}</p></div>}
          {order.stripePaymentIntentId && <div><p className="text-[11px] text-muted-foreground">Stripe Payment</p><p className="text-xs font-mono break-all">{order.stripePaymentIntentId}</p></div>}
        </div>
        <div className="px-5 py-3 border-t border-border space-y-2">
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Actions</p>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={resendEmail} disabled={actionLoading === "resend"} className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-border text-xs hover:bg-muted transition-colors disabled:opacity-40">
              {actionLoading === "resend" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Mail className="h-3.5 w-3.5" />} Resend email
            </button>
            <button onClick={reprovision} disabled={actionLoading === "reprovision"} className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-border text-xs hover:bg-muted transition-colors disabled:opacity-40">
              {actionLoading === "reprovision" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />} Reprovision
            </button>
            {stripeUrl && <a href={stripeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-border text-xs hover:bg-muted transition-colors col-span-2"><CreditCard className="h-3.5 w-3.5" /> View on Stripe <ExternalLink className="h-3 w-3" /></a>}
            {topupUrl && <a href={topupUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-border text-xs hover:bg-muted transition-colors col-span-2"><Globe className="h-3.5 w-3.5" /> Open topup page <ExternalLink className="h-3 w-3" /></a>}
          </div>
          {actionMsg && <p className="text-xs text-center text-[#7ecb8a] font-medium pt-1">{actionMsg}</p>}
        </div>
        <div className="h-4 sm:hidden" />
      </div>
    </div>
  );
}
