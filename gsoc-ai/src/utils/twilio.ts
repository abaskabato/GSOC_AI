export interface TwilioConfig {
  accountSid: string;
  apiKeySid: string;
  apiKeySecret: string;
  twimlAppSid: string;
}

/**
 * Generate a Twilio Access Token with a Voice grant using the Web Crypto API.
 * This runs entirely client-side — no backend required.
 */
export async function generateTwilioToken(
  config: TwilioConfig,
  identity: string,
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);

  const header = { alg: 'HS256', typ: 'JWT', cty: 'twilio-fpa;v=1' };
  const payload = {
    jti: `${config.apiKeySid}-${now}`,
    iss: config.apiKeySid,
    sub: config.accountSid,
    exp: now + 3600,
    grants: {
      identity,
      voice: {
        incoming: { allow: true },
        outgoing: { application_sid: config.twimlAppSid },
      },
    },
  };

  const b64url = (obj: object) =>
    btoa(unescape(encodeURIComponent(JSON.stringify(obj))))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

  const header64 = b64url(header);
  const payload64 = b64url(payload);
  const input = `${header64}.${payload64}`;

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(config.apiKeySecret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );

  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(input));
  const sig64 = btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  return `${input}.${sig64}`;
}

export function isTwilioConfigured(config: Partial<TwilioConfig>): config is TwilioConfig {
  return !!(
    config.accountSid &&
    config.apiKeySid &&
    config.apiKeySecret &&
    config.twimlAppSid
  );
}
