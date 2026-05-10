import { NextResponse } from "next/server";
import { queryEsim } from "@/lib/esimaccess/order";

export async function POST(request: Request) {
  try {
    const { orderNo } = await request.json();
    if (!orderNo) {
      return NextResponse.json({ error: "orderNo required" }, { status: 400 });
    }

    const details = await queryEsim(orderNo);
    return NextResponse.json({
      iccid: details?.iccid || "",
      orderNo: details?.orderNo || orderNo,
    });
  } catch {
    return NextResponse.json(
      { error: "Could not retrieve eSIM details" },
      { status: 500 }
    );
  }
}
