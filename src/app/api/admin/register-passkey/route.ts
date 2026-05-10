import { NextResponse } from "next/server";
import { query, queryOne, generateId } from "@/lib/d1/client";

export async function POST(request: Request) {
  const { token, credentialId, publicKey } = await request.json();
  if (!token || !credentialId || !publicKey) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // Verify token is valid and unused
  const tokenRow = await queryOne<{ id: string; used: number }>(
    "SELECT * FROM admin_tokens WHERE token = ? AND used = 0",
    [token]
  );
  if (!tokenRow) {
    return NextResponse.json({ error: "Invalid or used token" }, { status: 400 });
  }

  // Mark token as used
  await query("UPDATE admin_tokens SET used = 1 WHERE id = ?", [tokenRow.id]);

  // Store passkey
  await query(
    "INSERT INTO admin_passkeys (id, credential_id, public_key) VALUES (?, ?, ?)",
    [generateId(), credentialId, publicKey]
  );

  return NextResponse.json({ ok: true });
}
