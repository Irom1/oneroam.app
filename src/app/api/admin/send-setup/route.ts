import { NextResponse } from "next/server";
import { query, generateId } from "@/lib/d1/client";

function generateToken(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 32; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

export async function POST() {
  const token = generateToken();
  const id = generateId();

  await query(
    "INSERT INTO admin_tokens (id, token) VALUES (?, ?)",
    [id, token]
  );

  const setupUrl = `https://oneroam.app/admin/setup?token=${token}`;
  const key = process.env.RESEND_API_KEY;
  if (key) {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "oneroam <esim@oneroam.app>",
        to: ["mori.fin@icloud.com"],
        subject: "Admin setup — oneroam",
        html: `<p><a href="${setupUrl}">Click here to set up your admin passkey</a></p><p>This link expires after use.</p>`,
      }),
    });
  }

  return NextResponse.json({ ok: true });
}
