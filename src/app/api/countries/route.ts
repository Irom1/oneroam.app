import { NextResponse } from "next/server";
import { getCountries } from "@/lib/d1/data";

export async function GET() {
  try {
    const countries = await getCountries();
    return NextResponse.json(countries);
  } catch {
    return NextResponse.json({ error: "Failed to fetch countries" }, { status: 500 });
  }
}
