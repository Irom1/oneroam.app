import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { SuccessContent } from "./success-content";

export default function SuccessPage() {
  return (
    <div className="mx-auto max-w-lg px-6 py-20 text-center">
      <Suspense
        fallback={
          <div className="space-y-4">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
            <h1 className="text-xl font-bold">Loading…</h1>
          </div>
        }
      >
        <SuccessContent />
      </Suspense>
    </div>
  );
}
