import Database from '@tauri-apps/plugin-sql';

let _db: Database | null = null;

export async function getDb(): Promise<Database> {
  if (!_db) {
    _db = await Database.load('sqlite:gsoc.db');
    await initSchema(_db);
  }
  return _db;
}

async function initSchema(db: Database): Promise<void> {
  await db.execute(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'analyst',
    initials TEXT NOT NULL DEFAULT '',
    force_password_change INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    last_login TEXT
  )`);

  await db.execute(`CREATE TABLE IF NOT EXISTS incidents (
    id TEXT PRIMARY KEY,
    timestamp TEXT NOT NULL,
    source TEXT NOT NULL,
    details TEXT NOT NULL,
    affected_location TEXT NOT NULL,
    dismissal_reason TEXT,
    escalation_action TEXT,
    escalation_timestamp TEXT,
    notes TEXT NOT NULL DEFAULT '',
    resolver_initials TEXT NOT NULL DEFAULT '',
    hours_of_operation TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'open'
  )`);

  await db.execute(`CREATE TABLE IF NOT EXISTS monitoring_requests (
    id TEXT PRIMARY KEY,
    location_status TEXT NOT NULL DEFAULT '',
    requestor TEXT NOT NULL DEFAULT '',
    location TEXT NOT NULL DEFAULT '',
    interval TEXT NOT NULL DEFAULT '1hr',
    justification TEXT NOT NULL DEFAULT '',
    start_date_time TEXT NOT NULL DEFAULT '',
    end_date_time TEXT NOT NULL DEFAULT '',
    requestor_contact TEXT NOT NULL DEFAULT ''
  )`);

  await db.execute(`CREATE TABLE IF NOT EXISTS monitoring_logs (
    id TEXT PRIMARY KEY,
    request_id TEXT NOT NULL DEFAULT '',
    interval TEXT NOT NULL DEFAULT '',
    time_checked TEXT NOT NULL DEFAULT '',
    location_name TEXT NOT NULL DEFAULT '',
    camera_status TEXT NOT NULL DEFAULT '',
    observation TEXT NOT NULL DEFAULT '',
    initials TEXT NOT NULL DEFAULT ''
  )`);

  await db.execute(`CREATE TABLE IF NOT EXISTS protests (
    id TEXT PRIMARY KEY,
    software_local_time TEXT NOT NULL DEFAULT '',
    date TEXT NOT NULL DEFAULT '',
    protest_local_time TEXT NOT NULL DEFAULT '',
    event_name TEXT NOT NULL DEFAULT '',
    city TEXT NOT NULL DEFAULT '',
    state TEXT NOT NULL DEFAULT '',
    nearest_location TEXT NOT NULL DEFAULT '',
    nearest_ten_locations TEXT NOT NULL DEFAULT '[]',
    notes TEXT NOT NULL DEFAULT '',
    initials TEXT NOT NULL DEFAULT ''
  )`);

  await db.execute(`CREATE TABLE IF NOT EXISTS quick_connects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    number TEXT NOT NULL
  )`);

  await db.execute(`CREATE TABLE IF NOT EXISTS documents (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    content TEXT NOT NULL DEFAULT '',
    file_name TEXT,
    file_type TEXT,
    file_size INTEGER,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`);

  await db.execute(`CREATE TABLE IF NOT EXISTS email_templates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    body TEXT NOT NULL
  )`);

  await db.execute(`CREATE TABLE IF NOT EXISTS business_locations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    hours_of_operation TEXT NOT NULL DEFAULT '',
    timezone TEXT NOT NULL DEFAULT 'America/Los_Angeles'
  )`);

  await db.execute(`CREATE TABLE IF NOT EXISTS camera_sources (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    url TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'offline'
  )`);

  await db.execute(`CREATE TABLE IF NOT EXISTS audit_log (
    id TEXT PRIMARY KEY,
    timestamp TEXT NOT NULL,
    username TEXT NOT NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    details TEXT NOT NULL
  )`);

  await db.execute(`CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  )`);

  await seedDefaults(db);
}

async function count(db: Database, table: string): Promise<number> {
  const rows = await db.select<[{ c: number }]>(`SELECT COUNT(*) as c FROM ${table}`);
  return rows[0].c;
}

async function getSetting(db: Database, key: string): Promise<string | null> {
  const rows = await db.select<[{ value: string }]>('SELECT value FROM settings WHERE key = ?', [key]);
  return rows.length > 0 ? rows[0].value : null;
}

async function seedDefaults(db: Database): Promise<void> {
  if ((await count(db, 'quick_connects')) === 0) {
    await db.execute("INSERT INTO quick_connects VALUES ('1','Emergency Services','911')");
    await db.execute("INSERT INTO quick_connects VALUES ('2','Supervisor','555-0100')");
    await db.execute("INSERT INTO quick_connects VALUES ('3','Security Desk','555-0101')");
  }

  if ((await count(db, 'business_locations')) === 0) {
    await db.execute("INSERT INTO business_locations VALUES ('1','Store #1001','123 Main St, Seattle, WA','6AM - 11PM','America/Los_Angeles')");
    await db.execute("INSERT INTO business_locations VALUES ('2','Store #1002','456 Oak Ave, Portland, OR','6AM - 11PM','America/Los_Angeles')");
    await db.execute("INSERT INTO business_locations VALUES ('3','Store #1003','789 Pine Rd, Bellevue, WA','6AM - 10PM','America/Los_Angeles')");
  }

  if ((await count(db, 'email_templates')) === 0) {
    await db.execute('INSERT INTO email_templates VALUES (?,?,?,?)', [
      '1', 'Significant Impact', 'URGENT: Significant Security Incident - {location}',
      'Dear Team,\n\nA significant security incident has been reported at {location}.\n\nIncident Details:\n{details}\n\nTime: {time}\nResolver: {resolver}\n\nPlease take immediate action.\n\nBest regards,\nSecurity Operations'
    ]);
    await db.execute('INSERT INTO email_templates VALUES (?,?,?,?)', [
      '2', 'General Impact', 'Security Incident Report - {location}',
      'Dear Team,\n\nA security incident has been reported at {location}.\n\nIncident Details:\n{details}\n\nTime: {time}\nResolver: {resolver}\n\nPlease review and take appropriate action.\n\nBest regards,\nSecurity Operations'
    ]);
    await db.execute('INSERT INTO email_templates VALUES (?,?,?,?)', [
      '3', 'Potential Impact', 'Potential Security Alert - {location}',
      'Dear Team,\n\nA potential security concern has been identified at {location}.\n\nIncident Details:\n{details}\n\nTime: {time}\nResolver: {resolver}\n\nPlease monitor the situation.\n\nBest regards,\nSecurity Operations'
    ]);
  }

  if (!(await getSetting(db, 'businessName'))) {
    await db.execute("INSERT INTO settings VALUES ('businessName','My Company')");
  }
  if (!(await getSetting(db, 'dismissalReasons'))) {
    await db.execute('INSERT INTO settings VALUES (?,?)', [
      'dismissalReasons',
      JSON.stringify(['False Alarm', 'Non-Urgent', 'Duplicate', 'Resolved Externally'])
    ]);
  }
  if (!(await getSetting(db, 'escalationActions'))) {
    await db.execute('INSERT INTO settings VALUES (?,?)', [
      'escalationActions',
      JSON.stringify(['Email Supervisor', 'Call Manager', 'Dispatch Security', 'Contact Police'])
    ]);
  }
  if (!(await getSetting(db, 'voipStatus'))) {
    await db.execute('INSERT INTO settings VALUES (?,?)', [
      'voipStatus',
      JSON.stringify({ status: 'Available', lastChange: new Date().toISOString() })
    ]);
  }
}
