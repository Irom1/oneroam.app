// Email delivery via Resend REST API

const RESEND_API = "https://api.resend.com";

export async function sendEsimEmail({
  to,
  qrCodeUrl,
  activationCode,
  iccid,
  orderNo,
  planName,
}: {
  to: string;
  qrCodeUrl?: string;
  activationCode?: string;
  iccid?: string;
  orderNo: string;
  planName: string;
}) {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn("RESEND_API_KEY not set — skipping email");
    return;
  }

  const acBlock = activationCode
    ? `<p style="font-size:16px;color:#333"><strong>Activation Code:</strong> <code style="background:#f5f5f5;padding:4px 8px;border-radius:4px;font-size:18px;letter-spacing:2px">${activationCode}</code></p>`
    : "";

  const qrBlock = qrCodeUrl
    ? `<div style="text-align:center;margin:24px 0"><img src="${qrCodeUrl}" alt="eSIM QR Code" style="width:200px;height:200px"/><p style="color:#888;font-size:12px">Scan with your phone camera</p></div>`
    : "";

  const html = `<!DOCTYPE html>
<html>
<body style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#1a1a1a">
  <h1 style="font-size:24px;margin-bottom:8px">Your eSIM is ready</h1>
  <p style="color:#666;margin-bottom:24px">${planName} — Order ${orderNo}</p>

  ${qrBlock}
  ${acBlock}

  ${iccid ? `<p style="font-size:13px;color:#888">ICCID: ${iccid}</p>` : ""}

  <hr style="border:none;border-top:1px solid #eee;margin:24px 0" />
  <h2 style="font-size:16px">How to install</h2>
  <ol style="color:#555;line-height:1.8;padding-left:20px">
    <li>Go to <strong>Settings > Cellular</strong> on your iPhone (or equivalent on Android)</li>
    <li>Tap <strong>Add eSIM</strong></li>
    <li>Scan the QR code above or enter the activation code manually</li>
    <li>Label your eSIM (e.g. "Travel") and you're online</li>
  </ol>

  <div style="margin-top:24px;padding:16px;background:#f5f8fb;border-radius:12px">
    <p style="font-size:13px;color:#555;margin:0 0 8px">
      <strong>Running low on data?</strong> Top up anytime.
    </p>
    <a href="https://oneroam.app/topup" style="font-size:13px;color:#4a90d9;text-decoration:none;font-weight:500">
      Check usage &amp; top up →
    </a>
  </div>

  <p style="margin-top:24px;font-size:12px;color:#aaa">
    oneroam — instant travel eSIM
  </p>
</body>
</html>`;

  await fetch(`${RESEND_API}/emails`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "oneroam <esim@oneroam.app>",
      to: [to],
      subject: `Your eSIM is ready — ${planName}`,
      html,
    }),
  });
}
