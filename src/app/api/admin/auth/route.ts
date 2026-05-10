import { NextResponse } from "next/server";
import { query } from "@/lib/d1/client";

export async function POST(request: Request) {
  const { credentialId } = await request.json();
  if (!credentialId) return NextResponse.json({ ok: false }, { status: 400 });

  const result = await query(
    "SELECT * FROM admin_passkeys WHERE credential_id = ?",
    [credentialId]
  );

  return NextResponse.json({
    ok: result.results.length > 0,
    credential: result.results[0] || null,
  });
}
