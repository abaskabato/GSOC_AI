import { Resend } from "resend";

export function generateLicenseKey(): string {
  const seg = () =>
    Math.random().toString(36).substring(2, 6).toUpperCase().padEnd(4, "0");
  return `GSOC-${seg()}-${seg()}-${seg()}-${seg()}`;
}

export async function sendLicenseEmail(params: {
  email: string;
  orgName: string;
  plan: string;
  licenseKey: string;
  trialEndsAt: Date;
}) {
  const resend = new Resend(process.env.RESEND_API_KEY!);
  const trialEnd = params.trialEndsAt.toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });

  await resend.emails.send({
    from: "GSOC AI <noreply@gsocai.com>",
    to: params.email,
    subject: "Your GSOC AI License Key",
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="background:#000;color:#fff;font-family:system-ui,sans-serif;padding:40px 20px;margin:0;">
  <div style="max-width:520px;margin:0 auto;">
    <h1 style="font-size:24px;font-weight:700;margin-bottom:4px;">Welcome to GSOC AI</h1>
    <p style="color:#888;margin-top:0;">Your ${params.plan} plan is active.</p>

    <div style="border:1px solid #222;border-radius:12px;padding:28px;margin:28px 0;">
      <p style="color:#888;font-size:12px;text-transform:uppercase;letter-spacing:.08em;margin:0 0 8px;">Your license key</p>
      <p style="font-family:monospace;font-size:22px;font-weight:700;letter-spacing:.1em;margin:0;color:#fff;">
        ${params.licenseKey}
      </p>
      <p style="color:#555;font-size:12px;margin:12px 0 0;">
        Trial period ends ${trialEnd}. Keep this key safe — you will need it to activate the app.
      </p>
    </div>

    <h2 style="font-size:16px;margin-bottom:12px;">Get started</h2>
    <ol style="color:#888;padding-left:20px;line-height:1.8;">
      <li>Download GSOC AI from <a href="https://gsocai.vercel.app/success" style="color:#fff;">gsocai.vercel.app/success</a></li>
      <li>Open the app and go to <strong style="color:#fff;">Settings → License</strong></li>
      <li>Paste your license key above and click Activate</li>
      <li>Configure your business locations and connect your integrations</li>
    </ol>

    <hr style="border:none;border-top:1px solid #222;margin:32px 0;" />
    <p style="color:#444;font-size:12px;margin:0;">
      Questions? Reply to this email or contact
      <a href="mailto:support@gsocai.com" style="color:#888;">support@gsocai.com</a>
    </p>
  </div>
</body>
</html>
    `.trim(),
  });
}
