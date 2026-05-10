import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const countryId = searchParams.get("country_id");

  const supabase = await createClient();

  let query = supabase
    .from("plans")
    .select("*, country:countries(*)")
    .eq("is_active", true)
    .order("coverage_type", { ascending: true })
    .order("price_cents", { ascending: true });

  if (countryId) {
    query = query.eq("country_id", countryId);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
