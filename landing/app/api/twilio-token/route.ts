import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const apiKeySid = process.env.TWILIO_API_KEY_SID;
  const apiKeySecret = process.env.TWILIO_API_KEY_SECRET;
  const appSid = process.env.TWILIO_APP_SID;

  if (!accountSid || !apiKeySid || !apiKeySecret || !appSid) {
    return NextResponse.json({ error: 'VoIP not configured on this server' }, { status: 503 });
  }

  let identity = 'gsoc-agent';
  try {
    const body = await req.json();
    if (body.identity) identity = String(body.identity).slice(0, 64);
  } catch { /* use default */ }

  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(
    JSON.stringify({ alg: 'HS256', typ: 'JWT', cty: 'twilio-fpa;v=1' }),
  ).toString('base64url');
  const payload = Buffer.from(
    JSON.stringify({
      jti: `${apiKeySid}-${now}`,
      iss: apiKeySid,
      sub: accountSid,
      exp: now + 3600,
      grants: {
        identity,
        voice: {
          incoming: { allow: true },
          outgoing: { application_sid: appSid },
        },
      },
    }),
  ).toString('base64url');

  const sig = crypto
    .createHmac('sha256', apiKeySecret)
    .update(`${header}.${payload}`)
    .digest('base64url');

  return NextResponse.json({ token: `${header}.${payload}.${sig}` });
}
