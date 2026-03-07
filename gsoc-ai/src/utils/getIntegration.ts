import { getDb } from './db';

export async function getIntegrationByType(type: string): Promise<Record<string, string> | null> {
  const db = await getDb();
  const rows = await db.select<{ config: string }[]>(
    'SELECT config FROM integrations WHERE type=? AND enabled=1 LIMIT 1',
    [type],
  );
  if (!rows.length) return null;
  return JSON.parse(rows[0].config || '{}');
}
