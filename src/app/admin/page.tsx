"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Shield, Loader2, ExternalLink, LogOut } from "lucide-react";

function arrayBufferToBase64(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

interface Order {
  id: string;
  orderNumber: string;
  email: string;
  packageName: string;
  amountCents: number;
  status: string;
  esimOrderNo?: string;
  createdAt: string;
}

function AdminActions({ order }: { order: Order }) {
  const [actionMsg, setActionMsg] = useState("");

  const resendEmail = async () => {
    setActionMsg("Sending…");
    const res = await fetch("/api/admin/resend-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: order.id }),
    });
    const d = await res.json();
    setActionMsg(d.ok ? "Sent!" : d.error || "Failed");
    setTimeout(() => setActionMsg(""), 2000);
  };

  const reprovision = async () => {
    setActionMsg("Reprovisioning…");
    const res = await fetch("/api/admin/reprovision", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: order.id }),
    });
    const d = await res.json();
    setActionMsg(d.ok ? "Reprovisioned!" : d.error || "Failed");
    setTimeout(() => setActionMsg(""), 2000);
  };

  return (
    <div className="flex items-center gap-2">
      <button onClick={resendEmail} className="text-[11px] text-primary hover:underline">Resend email</button>
      <button onClick={reprovision} className="text-[11px] text-primary hover:underline">Reprovision</button>
      {order.email && (
        <a
          href={`/topup?email=${encodeURIComponent(order.email as string)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] text-muted-foreground hover:text-foreground"
        >
          Topup ↗
        </a>
      )}
      {actionMsg && <span className="text-[10px] text-muted-foreground">{actionMsg}</span>}
    </div>
  );
}

const LINKS = [
  { label: "Stripe Dashboard", url: "https://dashboard.stripe.com" },
  { label: "eSIM Access", url: "https://console.esimaccess.com" },
  { label: "Resend", url: "https://resend.com/emails" },
  { label: "Cloudflare", url: "https://dash.cloudflare.com" },
];

export default function AdminPage() {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);
  const [authing, setAuthing] = useState(true);
  const [data, setData] = useState<{
    orders: Order[];
    totalRevenue: number;
    totalOrders: number;
    balance?: { usd: string };
    stripeBalance?: { available: { amount: string; currency: string }[]; pending: { amount: string; currency: string }[] };
  } | null>(null);
  const [error, setError] = useState("");

  const authenticate = useCallback(async () => {
    try {
      const credId = localStorage.getItem("oneroam_admin_credential");
      if (!credId) throw new Error("No credential");

      const credential = (await navigator.credentials.get({
        publicKey: {
          challenge: new Uint8Array(32),
          rpId: "oneroam.app",
          allowCredentials: [
            {
              id: Uint8Array.from(atob(credId.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0)),
              type: "public-key",
            },
          ],
          timeout: 60000,
          userVerification: "required",
        },
      })) as PublicKeyCredential;

      if (credential) {
        const res = await fetch("/api/admin/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ credentialId: credential.id }),
        });
        const d = await res.json();
        if (d.ok) {
          setAuthed(true);
        } else {
          setError("Authentication failed");
        }
      }
    } catch (e) {
      setError("Passkey required to access dashboard");
    }
    setAuthing(false);
  }, []);

  useEffect(() => { authenticate(); }, [authenticate]);

  useEffect(() => {
    if (!authed) return;
    fetch("/api/admin/dashboard")
      .then((r) => r.json())
      .then(setData)
      .catch(() => setError("Failed to load dashboard data"));
  }, [authed]);

  const logout = () => {
    localStorage.removeItem("oneroam_admin_credential");
    setAuthed(false);
    setAuthing(true);
    authenticate();
  };

  if (authing) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center space-y-4">
        <Shield className="mx-auto h-10 w-10 text-muted-foreground" />
        <h1 className="text-xl font-bold">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground">{error}</p>
        <button
          onClick={authenticate}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-foreground text-background text-sm font-medium hover:opacity-80"
        >
          <Shield className="h-4 w-4" /> Authenticate
        </button>
        <p className="text-xs text-muted-foreground">
          No passkey?{" "}
          <button onClick={() => router.push("/admin/setup")} className="text-primary hover:underline">
            Set up admin access
          </button>
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <div className="flex items-center gap-3">
          <button onClick={logout} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            <LogOut className="h-3 w-3" /> Lock
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1">Orders</p>
          <p className="text-2xl font-bold">{data?.totalOrders || 0}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1">Revenue</p>
          <p className="text-2xl font-bold">${((data?.totalRevenue || 0) / 100).toFixed(2)}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1">eSIM Balance</p>
          <p className="text-2xl font-bold">${data?.balance?.usd || "—"}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1">Stripe</p>
          <p className="text-2xl font-bold">
            ${data?.stripeBalance?.available?.[0]?.amount || "—"}
          </p>
        </div>
      </div>

      {/* External links */}
      <div className="flex flex-wrap gap-2 mb-8">
        {LINKS.map((link) => (
          <a
            key={link.label}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
          >
            {link.label} <ExternalLink className="h-3 w-3" />
          </a>
        ))}
      </div>

      {/* Orders table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <p className="text-sm font-medium">Recent Orders</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/30">
              <tr>
                <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">Order</th>
                <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">Plan</th>
                <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">Email</th>
                <th className="text-right px-4 py-2 text-xs font-medium text-muted-foreground">Amount</th>
                <th className="text-center px-4 py-2 text-xs font-medium text-muted-foreground">Status</th>
                <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.orders?.map((order) => (
                <tr key={order.id} className="border-t border-border/50">
                  <td className="px-4 py-2 font-mono text-xs">{order.orderNumber}</td>
                  <td className="px-4 py-2 text-xs truncate max-w-[200px]">{order.packageName}</td>
                  <td className="px-4 py-2 text-xs text-muted-foreground truncate max-w-[160px]">{order.email}</td>
                  <td className="px-4 py-2 text-xs text-right">${((order.amountCents || 0) / 100).toFixed(2)}</td>
                  <td className="px-4 py-2 text-center">
                    <span className={`text-[11px] px-2 py-0.5 rounded-full ${
                      order.status === "completed" ? "bg-[#d4e8d4] text-[#2d5a2d]" :
                      order.status === "failed" ? "bg-red-100 text-red-700" :
                      "bg-amber-100 text-amber-700"
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <AdminActions order={order} />
                  </td>
                </tr>
              ))}
              {(!data?.orders || data.orders.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-xs text-muted-foreground">
                    No orders yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
