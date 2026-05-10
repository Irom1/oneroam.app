// Server-side admin auth check — verifies passkey credential exists in DB
import { query } from "@/lib/d1/client";

export async function verifyAdmin(credentialId: string): Promise<boolean> {
  if (!credentialId) return false;
  const result = await query(
    "SELECT * FROM admin_passkeys WHERE credential_id = ?",
    [credentialId]
  );
  return result.results.length > 0;
}
