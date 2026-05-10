import { Suspense } from "react";
import { TopupContent } from "./topup-content";

export default function TopupPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-lg px-4 py-12 pb-24 text-center text-sm text-muted-foreground">Loading…</div>}>
      <TopupContent />
    </Suspense>
  );
}
