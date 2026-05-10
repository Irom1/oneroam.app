import { NextResponse } from "next/server";
import { listTopupPackages } from "@/lib/esimaccess/topup";
import type { DisplayPlan } from "@/lib/esimaccess/catalog";
import { buildDisplayPlan } from "@/lib/esimaccess/catalog";

export async function POST(request: Request) {
  try {
    const { iccid } = await request.json();
    if (!iccid) {
      return NextResponse.json({ error: "ICCID required" }, { status: 400 });
    }

    const pkgs = await listTopupPackages(iccid);
    const plans: DisplayPlan[] = pkgs.map(buildDisplayPlan);

    return NextResponse.json({ plans });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed" },
      { status: 500 }
    );
  }
}
