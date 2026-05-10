"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Country } from "@/lib/types";

type Props = {
  countries: Country[];
};

export function CountrySelector({ countries }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCountryId = searchParams.get("country_id") || "";

  const handleChange = useCallback(
    (value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "all") {
        params.set("country_id", value);
      } else {
        params.delete("country_id");
      }
      // Keep search param if present
      router.push(`/plans?${params.toString()}`);
    },
    [router, searchParams]
  );

  return (
    <Select value={currentCountryId || "all"} onValueChange={handleChange}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="All Countries" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Countries</SelectItem>
        {countries.map((c) => (
          <SelectItem key={c.id} value={c.id}>
            <span className="mr-1">{c.flag_emoji}</span> {c.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
