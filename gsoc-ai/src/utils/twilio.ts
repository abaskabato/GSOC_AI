const TOKEN_API = 'https://gsocai.vercel.app/api/twilio-token';

export async function fetchTwilioToken(identity: string): Promise<string> {
  const res = await fetch(TOKEN_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(data.error ?? `Token API ${res.status}`);
  }
  const { token } = await res.json() as { token: string };
  return token;
}

export async function isTwilioAvailable(): Promise<boolean> {
  try {
    const res = await fetch(TOKEN_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    });
    return res.status !== 503;
  } catch {
    return false;
  }
}
