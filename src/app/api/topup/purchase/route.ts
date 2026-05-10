import { NextResponse } from "next/server";
import { purchaseTopup } from "@/lib/esimaccess/topup";
import { generateId } from "@/lib/d1/client";

export async function POST(request: Request) {
  try {
    const { iccid, packageCode } = await request.json();
    if (!iccid || !packageCode) {
      return NextResponse.json(
        { error: "ICCID and packageCode required" },
        { status: 400 }
      );
    }

    const transactionId = generateId();
    const result = await purchaseTopup(iccid, packageCode, transactionId);

    return NextResponse.json({ orderNo: result.orderNo });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Topup failed" },
      { status: 500 }
    );
  }
}
