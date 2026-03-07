import { sql } from "@vercel/postgres";

export async function ensureSchema() {
  await sql`
    CREATE TABLE IF NOT EXISTS licenses (
      key                     TEXT PRIMARY KEY,
      email                   TEXT NOT NULL,
      org_name                TEXT,
      plan                    TEXT NOT NULL,
      status                  TEXT NOT NULL DEFAULT 'active',
      stripe_subscription_id  TEXT,
      stripe_customer_id      TEXT,
      trial_ends_at           TIMESTAMPTZ,
      activations             INTEGER NOT NULL DEFAULT 0,
      max_activations         INTEGER NOT NULL DEFAULT 3,
      created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}

export interface License {
  key: string;
  email: string;
  org_name: string | null;
  plan: string;
  status: string;
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
  trial_ends_at: string | null;
  activations: number;
  max_activations: number;
  created_at: string;
}

export async function createLicense(data: {
  key: string;
  email: string;
  orgName: string;
  plan: string;
  subscriptionId: string;
  customerId: string;
  trialEndsAt: Date;
}) {
  await sql`
    INSERT INTO licenses
      (key, email, org_name, plan, stripe_subscription_id, stripe_customer_id, trial_ends_at)
    VALUES
      (${data.key}, ${data.email}, ${data.orgName}, ${data.plan},
       ${data.subscriptionId}, ${data.customerId}, ${data.trialEndsAt.toISOString()})
  `;
}

export async function getLicense(key: string): Promise<License | null> {
  const { rows } = await sql<License>`
    SELECT * FROM licenses WHERE key = ${key} LIMIT 1
  `;
  return rows[0] ?? null;
}

export async function incrementActivations(key: string) {
  await sql`
    UPDATE licenses SET activations = activations + 1 WHERE key = ${key}
  `;
}

export async function setLicenseStatus(subscriptionId: string, status: string) {
  await sql`
    UPDATE licenses SET status = ${status}
    WHERE stripe_subscription_id = ${subscriptionId}
  `;
}
