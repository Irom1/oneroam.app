import { NextResponse } from "next/server";
import { queryUsage } from "@/lib/esimaccess/usage";

export async function POST(request: Request) {
  try {
    const { iccid } = await request.json();
    if (!iccid) {
      return NextResponse.json({ error: "ICCID required" }, { status: 400 });
    }

    const usage = await queryUsage(iccid);
    return NextResponse.json({ usage });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed" },
      { status: 500 }
    );
  }
}
