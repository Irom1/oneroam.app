"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import { Shield, Mail, Loader2, CheckCircle } from "lucide-react";

function base64ToArrayBuffer(base64: string) {
  const binary = atob(base64.replace(/-/g, "+").replace(/_/g, "/"));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

function arrayBufferToBase64(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

export default function SetupPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-lg px-4 py-20 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></div>}>
      <SetupContent />
    </Suspense>
  );
}

function SetupContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [step, setStep] = useState<"email" | "verify" | "create" | "done">(
    token ? "create" : "email"
  );
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [validToken, setValidToken] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");

  // Verify token if present
  useEffect(() => {
    if (token) {
      fetch("/api/admin/verify-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      })
        .then((r) => r.json())
        .then((d) => {
          setValidToken(d.valid);
          setChecking(false);
        })
        .catch(() => setChecking(false));
    } else {
      setChecking(false);
    }
  }, [token]);

  const sendEmail = async () => {
    setSending(true);
    await fetch("/api/admin/send-setup", { method: "POST" });
    setSending(false);
    setSent(true);
  };

  const createPasskey = async () => {
    if (!token || !validToken) return;
    setError("");

    try {
      const credential = (await navigator.credentials.create({
        publicKey: {
          challenge: new Uint8Array(32),
          rp: { name: "oneroam", id: "oneroam.app" },
          user: {
            id: new Uint8Array(16),
            name: "admin@oneroam.app",
            displayName: "oneroam Admin",
          },
          pubKeyCredParams: [{ type: "public-key", alg: -7 }],
          timeout: 60000,
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required",
          },
        },
      })) as PublicKeyCredential;

      const credentialId = credential.id;

      // Store raw credential ID for later auth
      localStorage.setItem("oneroam_admin_credential", credentialId);

      // Convert rawId to base64url for server storage
      const rawId = new Uint8Array(credential.getClientExtensionResults() ? 0 : 0);
      const serverCredId = credential.id; // already base64url

      const res = await fetch("/api/admin/register-passkey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, credentialId: serverCredId, publicKey: "ok" }),
      });

      const data = await res.json();
      if (data.ok) {
        setStep("done");
      } else {
        setError(data.error || "Registration failed");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Passkey creation failed");
    }
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-20">
      <div className="text-center space-y-6">
        <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-[#a8d8ea]/30">
          <Shield className="h-7 w-7 text-primary" />
        </div>
        <h1 className="text-2xl font-bold">Admin Setup</h1>

        {step === "email" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Send a one-time setup link to your email to create an admin passkey.
            </p>
            <button
              onClick={sendEmail}
              disabled={sending || sent}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-foreground text-background font-medium text-sm hover:opacity-80 transition-opacity disabled:opacity-40"
            >
              {sent ? (
                <>
                  <CheckCircle className="h-4 w-4" /> Email sent
                </>
              ) : sending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Sending…
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4" /> Send setup email
                </>
              )}
            </button>
            {sent && (
              <p className="text-xs text-muted-foreground">
                Check your inbox. The link expires after one use.
              </p>
            )}
          </div>
        )}

        {checking && token && (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Verifying…
          </div>
        )}

        {!checking && token && !validToken && (
          <div className="space-y-3">
            <p className="text-sm text-destructive">Invalid or expired setup link.</p>
            <button
              onClick={() => { router.replace("/admin/setup"); setStep("email"); }}
              className="text-sm text-primary hover:underline"
            >
              Request a new one
            </button>
          </div>
        )}

        {validToken && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Create a passkey (Face ID / Touch ID) to secure the admin dashboard.
            </p>
            <button
              onClick={createPasskey}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-foreground text-background font-medium text-sm hover:opacity-80 transition-opacity"
            >
              <Shield className="h-4 w-4" /> Create Passkey
            </button>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        )}

        {step === "done" && (
          <div className="space-y-4">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-[#d4e8d4]">
              <CheckCircle className="h-6 w-6 text-[#2d5a2d]" />
            </div>
            <p className="font-medium">Passkey created</p>
            <button
              onClick={() => router.push("/admin")}
              className="text-sm text-primary hover:underline"
            >
              Go to dashboard →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
