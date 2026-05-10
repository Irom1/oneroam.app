import { NextResponse } from "next/server";
import { queryOne } from "@/lib/d1/client";

export async function POST(request: Request) {
  const { token } = await request.json();
  if (!token) return NextResponse.json({ valid: false }, { status: 400 });

  const row = await queryOne<{ id: string; used: number }>(
    "SELECT * FROM admin_tokens WHERE token = ? AND used = 0",
    [token]
  );

  return NextResponse.json({ valid: !!row, tokenId: row?.id });
}
