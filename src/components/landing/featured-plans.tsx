import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { PlanCard } from "@/components/plans/plan-card";
import { getPlans } from "@/lib/d1/data";
import { cn } from "@/lib/utils";
import type { PlanWithCountry } from "@/lib/types";

export async function FeaturedPlans() {
  let plans: PlanWithCountry[] = [];
  let error = false;

  try {
    plans = await getPlans({ popular: true, limit: 3 });
  } catch {
    error = true;
  }

  return (
    <section className="border-t py-16">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Popular eSIMs
            </h2>
            <p className="mt-1 text-muted-foreground">
              The plans everyone&apos;s buying right now.
            </p>
          </div>
          <Link
            href="/plans"
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "no-underline hidden sm:inline-flex"
            )}
          >
            View all <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>

        {error ? (
          <p className="text-muted-foreground text-sm">
            Could not load plans. Please check your configuration.
          </p>
        ) : plans.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No featured plans yet.{" "}
            <Link href="/plans" className="underline">
              Browse all plans
            </Link>
            .
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
          </div>
        )}

        <div className="mt-6 text-center sm:hidden">
          <Link
            href="/plans"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "no-underline"
            )}
          >
            View all plans <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
