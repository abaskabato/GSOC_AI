const LICENSE_API = 'https://gsocai.vercel.app/api/validate-license';
const APP_VERSION = '1.0.0';

export interface LicenseInfo {
  valid: boolean;
  plan?: string;
  org?: string;
  email?: string;
  trialEndsAt?: string;
  activationsUsed?: number;
  maxActivations?: number;
  reason?: string;
}

export async function validateLicense(key: string): Promise<LicenseInfo> {
  const res = await fetch(LICENSE_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ licenseKey: key.trim().toUpperCase(), appVersion: APP_VERSION }),
  });
  if (!res.ok) throw new Error(`License server error: ${res.status}`);
  return res.json();
}
