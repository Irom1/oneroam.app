import { Suspense } from "react";
import type { Metadata } from "next";
import { PlanList } from "@/components/plans/plan-list";
import { SearchBar } from "@/components/search/search-bar";
import { CountrySelector } from "@/components/search/country-selector";
import { Skeleton } from "@/components/ui/skeleton";
import { getPlans, getCountries } from "@/lib/d1/data";
import type { Country, PlanWithCountry } from "@/lib/types";

export const metadata: Metadata = {
  title: "Browse eSIM Plans",
  description: "Find the perfect eSIM plan for your travels.",
};

type Props = {
  searchParams: Promise<{ country_id?: string; search?: string }>;
};

export default async function PlansPage({ searchParams }: Props) {
  const params = await searchParams;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight">Browse Plans</h1>
      <p className="mt-2 text-muted-foreground">
        Find the perfect eSIM for your trip.
      </p>

      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <Suspense fallback={<Skeleton className="h-10 w-full sm:w-64" />}>
          <FilterBar />
        </Suspense>
      </div>

      <div className="mt-8">
        <PlansGrid
          countryId={params.country_id}
          search={params.search}
        />
      </div>
    </div>
  );
}

async function FilterBar() {
  const countries = await getCountries();

  return (
    <>
      <SearchBar />
      <CountrySelector countries={countries as Country[]} />
    </>
  );
}

async function PlansGrid({
  countryId,
  search,
}: {
  countryId?: string;
  search?: string;
}) {
  let plans: PlanWithCountry[] = [];
  try {
    plans = await getPlans({ countryId, search });
  } catch {
    // error handled by empty state
  }

  return <PlanList plans={plans} />;
}
