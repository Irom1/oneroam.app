import { NextResponse } from "next/server";
import { getPlans } from "@/lib/d1/data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const countryId = searchParams.get("country_id") || undefined;

  try {
    const plans = await getPlans({ countryId });
    return NextResponse.json(plans);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch plans" }, { status: 500 });
  }
}
