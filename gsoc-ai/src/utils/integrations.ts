import type { BusinessLocation, CameraSource, Incident } from '../types';

export interface AlertResult {
  externalId: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  lat?: number;
  lon?: number;
  timestamp: string;
  source: string;
}

// ── Geo utilities ─────────────────────────────────────────────────────────────

export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const toRad = (d: number) => d * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function geocodeAddress(address: string): Promise<{ lat: number; lon: number } | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`,
      { headers: { 'User-Agent': 'GSOC-AI/1.0' } },
    );
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
    }
  } catch { /* ignore */ }
  return null;
}

export function findNearestLocation(
  lat: number,
  lon: number,
  locations: Array<BusinessLocation & { lat?: number; lon?: number }>,
  radiusKm = 50,
): BusinessLocation | null {
  let nearest: BusinessLocation | null = null;
  let minDist = radiusKm;
  for (const loc of locations) {
    if (loc.lat == null || loc.lon == null) continue;
    const dist = haversineKm(lat, lon, loc.lat, loc.lon);
    if (dist < minDist) { minDist = dist; nearest = loc; }
  }
  return nearest;
}

// ── Factal ────────────────────────────────────────────────────────────────────
// Docs: https://api.factal.com — human-verified security alerts

export async function fetchFactalAlerts(
  config: Record<string, string>,
  since: string,
): Promise<AlertResult[]> {
  const base = (config.api_endpoint || 'https://api.factal.com/v1').replace(/\/$/, '');
  const res = await fetch(`${base}/events?limit=50&since=${encodeURIComponent(since)}`, {
    headers: { 'Authorization': `Bearer ${config.api_key}`, 'Accept': 'application/json' },
  });
  if (!res.ok) throw new Error(`Factal ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const events: any[] = data.events ?? data.data ?? data ?? [];
  return events.map(e => ({
    externalId: String(e.id ?? e.event_id ?? Math.random()),
    title: e.title ?? e.headline ?? 'Factal Alert',
    description: e.description ?? e.summary ?? '',
    severity: mapFactalSeverity(e.impact_category ?? e.severity ?? ''),
    lat: e.location?.coordinates?.[1] ?? e.location?.lat,
    lon: e.location?.coordinates?.[0] ?? e.location?.lon,
    timestamp: e.published_at ?? e.created_at ?? new Date().toISOString(),
    source: 'Factal',
  }));
}

function mapFactalSeverity(cat: string): AlertResult['severity'] {
  const c = cat.toLowerCase();
  if (c.includes('critical') || c.includes('extreme')) return 'critical';
  if (c.includes('high') || c.includes('major') || c.includes('significant')) return 'high';
  if (c.includes('medium') || c.includes('moderate')) return 'medium';
  return 'low';
}

// ── Dataminr ──────────────────────────────────────────────────────────────────
// Docs: https://gateway.dataminr.com — real-time threat signals

let _dataminrToken: string | null = null;
let _dataminrExpiry = 0;

async function getDataminrToken(clientId: string, clientSecret: string): Promise<string> {
  if (_dataminrToken && Date.now() < _dataminrExpiry) return _dataminrToken;
  const res = await fetch('https://gateway.dataminr.com/auth/2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=api_key&client_id=${encodeURIComponent(clientId)}&client_secret=${encodeURIComponent(clientSecret)}`,
  });
  if (!res.ok) throw new Error(`Dataminr auth ${res.status}`);
  const data = await res.json();
  _dataminrToken = data.access_token;
  _dataminrExpiry = Date.now() + (data.expires_in ?? 3600) * 900; // refresh at 90%
  return _dataminrToken!;
}

export async function fetchDataminrAlerts(config: Record<string, string>): Promise<AlertResult[]> {
  const token = await getDataminrToken(config.client_id, config.client_secret);
  const res = await fetch('https://gateway.dataminr.com/api/3/alerts?num=40', {
    headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
  });
  if (!res.ok) throw new Error(`Dataminr ${res.status}`);
  const data = await res.json();
  const alerts: any[] = data.data ?? data.alerts ?? data ?? [];
  return alerts.map(a => ({
    externalId: String(a.alertId ?? a.id ?? Math.random()),
    title: a.caption ?? a.headline ?? 'Dataminr Alert',
    description: a.expandedCaption ?? a.caption ?? '',
    severity: mapDataminrScore(a.alertType?.score ?? 0),
    lat: a.location?.coordinates?.lat ?? a.eventLocation?.lat,
    lon: a.location?.coordinates?.long ?? a.eventLocation?.long,
    timestamp: a.publishTime ? new Date(a.publishTime).toISOString() : new Date().toISOString(),
    source: 'Dataminr',
  }));
}

function mapDataminrScore(score: number): AlertResult['severity'] {
  if (score >= 90) return 'critical';
  if (score >= 70) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
}

// ── AlertMedia ────────────────────────────────────────────────────────────────
// Docs: https://api.alertmedia.com — mass employee notification

export async function sendAlertMediaNotification(
  config: Record<string, string>,
  subject: string,
  message: string,
  groupIds?: string[],
): Promise<void> {
  const base = (config.api_endpoint || 'https://api.alertmedia.com').replace(/\/$/, '');
  const body: Record<string, unknown> = {
    subject,
    message,
    media_types: ['email', 'sms', 'push'],
    ...(groupIds?.length ? { group_ids: groupIds } : {}),
  };
  const res = await fetch(`${base}/api/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Token ${config.api_key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`AlertMedia ${res.status}: ${await res.text()}`);
}

// ── Splunk HEC ────────────────────────────────────────────────────────────────
// Docs: Splunk HTTP Event Collector — push incidents to Splunk index

export async function pushToSplunk(
  config: Record<string, string>,
  incident: Incident,
  locationName: string,
): Promise<void> {
  const endpoint = config.splunk_endpoint.replace(/\/$/, '');
  const res = await fetch(`${endpoint}/services/collector/event`, {
    method: 'POST',
    headers: {
      'Authorization': `Splunk ${config.hec_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      time: new Date(incident.timestamp).getTime() / 1000,
      sourcetype: 'gsoc_ai:incident',
      source: 'gsoc_ai',
      index: config.index || 'main',
      event: {
        incident_id: incident.id,
        timestamp: incident.timestamp,
        source: incident.source,
        details: incident.details,
        location: locationName,
        status: incident.status,
        resolver: incident.resolverInitials,
        escalation_action: incident.escalation?.action ?? null,
        dismissal_reason: incident.dismissalReason ?? null,
        severity: incident.status === 'escalated' ? 'high' : 'medium',
      },
    }),
  });
  if (!res.ok) throw new Error(`Splunk HEC ${res.status}`);
}

// ── Microsoft Sentinel ────────────────────────────────────────────────────────
// Azure Monitor Data Collector API — custom log tables

export async function pushToSentinel(
  config: Record<string, string>,
  incident: Incident,
  locationName: string,
): Promise<void> {
  const workspaceId = config.workspace_id;
  const workspaceKey = config.workspace_key;
  const logType = config.log_type || 'GSocAIIncident';

  const body = JSON.stringify([{
    IncidentId: incident.id,
    TimeGenerated: incident.timestamp,
    SourceType: incident.source,
    Details: incident.details,
    Location: locationName,
    Status: incident.status,
    Resolver: incident.resolverInitials,
    EscalationAction: incident.escalation?.action ?? '',
    DismissalReason: incident.dismissalReason ?? '',
  }]);

  const date = new Date().toUTCString();
  const contentLength = new TextEncoder().encode(body).length;
  const stringToHash = `POST\n${contentLength}\napplication/json\nx-ms-date:${date}\n/api/logs`;

  const keyBytes = Uint8Array.from(atob(workspaceKey), c => c.charCodeAt(0));
  const key = await crypto.subtle.importKey(
    'raw', keyBytes, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(stringToHash));
  const signature = btoa(String.fromCharCode(...new Uint8Array(sig)));

  const res = await fetch(
    `https://${workspaceId}.ods.opinsights.azure.com/api/logs?api-version=2016-04-01`,
    {
      method: 'POST',
      headers: {
        'Authorization': `SharedKey ${workspaceId}:${signature}`,
        'Content-Type': 'application/json',
        'Log-Type': logType,
        'x-ms-date': date,
        'time-generated-field': 'TimeGenerated',
      },
      body,
    },
  );
  if (res.status !== 200 && res.status !== 202) {
    throw new Error(`Sentinel ${res.status}`);
  }
}

// ── Genetec Security Center ───────────────────────────────────────────────────
// REST API — fetch camera inventory from on-premise Genetec server

export async function fetchGenetecCameras(
  config: Record<string, string>,
): Promise<Omit<CameraSource, 'id'>[]> {
  const base = config.server_url.replace(/\/$/, '');
  const auth = btoa(`${config.username}:${config.password}`);
  const res = await fetch(`${base}/api/V2/Cameras`, {
    headers: { 'Authorization': `Basic ${auth}`, 'Accept': 'application/json' },
  });
  if (!res.ok) throw new Error(`Genetec ${res.status}`);
  const data = await res.json();
  const cameras: any[] = data.Cameras ?? data.cameras ?? data.Entities ?? data ?? [];
  return cameras.map(c => ({
    name: c.Name ?? c.name ?? c.EntityName ?? 'Genetec Camera',
    type: 'Genetec',
    url: c.StreamUri ?? c.streamUri ?? c.LiveStream?.Uri ?? `${base}/VideoStream/${c.Guid ?? c.id}`,
    status: 'online' as const,
  }));
}

// ── Milestone XProtect ────────────────────────────────────────────────────────
// REST API — fetch camera inventory from on-premise Milestone server

export async function fetchMilestoneCameras(
  config: Record<string, string>,
): Promise<Omit<CameraSource, 'id'>[]> {
  const base = config.server_url.replace(/\/$/, '');

  // OAuth2 password grant
  const tokenRes = await fetch(`${base}/IDP/connect/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=password&username=${encodeURIComponent(config.username)}&password=${encodeURIComponent(config.password)}&client_id=GrantValidatorClient`,
  });
  if (!tokenRes.ok) throw new Error(`Milestone auth ${tokenRes.status}`);
  const { access_token } = await tokenRes.json();

  const res = await fetch(`${base}/api/rest/v1/cameras`, {
    headers: { 'Authorization': `Bearer ${access_token}`, 'Accept': 'application/json' },
  });
  if (!res.ok) throw new Error(`Milestone ${res.status}`);
  const data = await res.json();
  const cameras: any[] = data.array ?? data.cameras ?? data ?? [];
  return cameras.map(c => ({
    name: c.name ?? c.displayName ?? 'Milestone Camera',
    type: 'Milestone',
    url: c.uri ?? c.streamUri ?? `${base}/VideoStream/${c.id}`,
    status: 'online' as const,
  }));
}

// ── Everbridge ────────────────────────────────────────────────────────────────
// Critical Event Management — mass notification

export async function sendEverbridgeAlert(
  config: Record<string, string>,
  subject: string,
  message: string,
): Promise<void> {
  const base = (config.api_endpoint || 'https://api.everbridge.net/rest').replace(/\/$/, '');
  const auth = btoa(`${config.username}:${config.password}`);
  const res = await fetch(`${base}/notifications/${config.org_id}`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: subject,
      notificationType: 'Standard',
      status: 'Published',
      messages: [{ textMessage: message, emailSubject: subject, emailBody: message }],
    }),
  });
  if (!res.ok) throw new Error(`Everbridge ${res.status}: ${await res.text()}`);
}

// ── X (Twitter) v2 Recent Search ──────────────────────────────────────────────
// Docs: https://developer.twitter.com/en/docs/twitter-api/tweets/search/api-reference/get-tweets-search-recent
// Requires: X API v2 Bearer Token (Basic tier or above)

const CRITICAL_X = /\b(shooting|gunshot|explosion|bomb|fire|hostage|terror|attack|active.shooter|mass.casualty)\b/i;
const HIGH_X     = /\b(fight|assault|robbery|stabbing|weapon|gun|knife|threat|emergency|police|911|violence|looting|arrested)\b/i;
const MEDIUM_X   = /\b(suspicious|incident|alert|warning|disturbance|argument|vandal|break.?in|trespas)\b/i;

function classifyXSeverity(text: string): AlertResult['severity'] {
  if (CRITICAL_X.test(text)) return 'critical';
  if (HIGH_X.test(text)) return 'high';
  if (MEDIUM_X.test(text)) return 'medium';
  return 'low';
}

export async function fetchXAlerts(
  config: Record<string, string>,
  since: string,
): Promise<AlertResult[]> {
  const bearerToken = config.bearer_token;
  const rawKeywords = (config.keywords ?? '').split(',').map(k => k.trim()).filter(Boolean);
  if (!bearerToken || rawKeywords.length === 0) return [];

  const lang = config.language?.trim() || 'en';
  const langClause = lang ? ` lang:${lang}` : '';
  const query = `(${rawKeywords.map(k => `"${k}"`).join(' OR ')}) -is:retweet${langClause}`;

  const url = new URL('https://api.twitter.com/2/tweets/search/recent');
  url.searchParams.set('query', query);
  url.searchParams.set('max_results', '50');
  url.searchParams.set('start_time', new Date(since).toISOString());
  url.searchParams.set('tweet.fields', 'created_at,geo,entities,author_id,text');
  url.searchParams.set('expansions', 'geo.place_id');
  url.searchParams.set('place.fields', 'geo,name,place_type,full_name');

  const res = await fetch(url.toString(), {
    headers: { 'Authorization': `Bearer ${bearerToken}`, 'Accept': 'application/json' },
  });
  if (res.status === 429) throw new Error('X API rate limit reached — reduce polling frequency');
  if (!res.ok) throw new Error(`X API ${res.status}: ${await res.text()}`);

  const data = await res.json();
  const tweets: any[] = data.data ?? [];
  const places: any[] = data.includes?.places ?? [];

  return tweets.map(t => {
    const place = places.find((p: any) => p.id === t.geo?.place_id);
    const bbox: number[] | undefined = place?.geo?.bbox;
    const lat = bbox ? (bbox[1] + bbox[3]) / 2 : undefined;
    const lon = bbox ? (bbox[0] + bbox[2]) / 2 : undefined;
    return {
      externalId: String(t.id),
      title: t.text.length > 120 ? t.text.slice(0, 117) + '...' : t.text,
      description: `${t.text}${place ? ` [near ${place.full_name ?? place.name}]` : ''}`,
      severity: classifyXSeverity(t.text),
      lat,
      lon,
      timestamp: t.created_at ?? new Date().toISOString(),
      source: 'X (Twitter)',
    };
  });
}
