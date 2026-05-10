import { NextResponse } from "next/server";
import { getDisplayPlans } from "@/lib/esimaccess/catalog";

export async function GET() {
  try {
    const plans = await getDisplayPlans();
    return NextResponse.json(plans);
  } catch (error) {
    console.error("getPlans error:", error);
    return NextResponse.json(
      { error: "Failed to fetch plans" },
      { status: 500 }
    );
  }
}
