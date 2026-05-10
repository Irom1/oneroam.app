import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:py-28 lg:py-36">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Travel eSIM for{" "}
            <span className="text-primary">$13.99</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground sm:text-xl max-w-lg">
            No signup. Low ping. Lots of data. Buy an eSIM before you land and
            stay connected in 100+ countries.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Link
              href="/plans"
              className={cn(buttonVariants({ size: "lg" }), "no-underline")}
            >
              Browse Plans <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              href="/order-lookup"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "no-underline"
              )}
            >
              Track Order
            </Link>
          </div>
        </div>
      </div>
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_40%_at_80%_60%,var(--color-primary)_0%,transparent_100%)] opacity-[0.07]" />
    </section>
  );
}
