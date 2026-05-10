import { Suspense } from "react";
import { HomeContent } from "./home-content";

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-3xl px-3 sm:px-6 pt-20 pb-24">
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-border bg-card p-4 h-24 animate-pulse"
              />
            ))}
          </div>
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
