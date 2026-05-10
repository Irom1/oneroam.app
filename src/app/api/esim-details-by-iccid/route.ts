import { NextResponse } from "next/server";
import { apiCall } from "@/lib/esimaccess/client";

interface EsimRecord {
  packageList?: { locationCode: string; packageName: string }[];
}

export async function POST(request: Request) {
  try {
    const { iccid } = await request.json();
    if (!iccid) return NextResponse.json({ error: "ICCID required" }, { status: 400 });

    const data = await apiCall<{ esimList: EsimRecord[] }>("/esim/query", {
      iccid,
      orderNo: "",
      pager: { pageNum: 1, pageSize: 5 },
    });

    const esim = data?.esimList?.[0];
    const pkg = esim?.packageList?.[0];

    return NextResponse.json({
      countryCode: pkg?.locationCode || "",
      countryName: pkg?.packageName || "",
    });
  } catch {
    return NextResponse.json({ countryCode: "", countryName: "" });
  }
}
