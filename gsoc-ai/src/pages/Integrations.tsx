import { useState, useEffect, useRef } from 'react';
import { useApp } from '../store/AppContext';
import { getDb } from '../utils/db';
import {
  Shield, Server, Video, Mail, MessageSquare, Webhook,
  Globe, Play, Pause, Trash2, Plus, RefreshCw,
  CheckCircle, XCircle, AlertTriangle, X, Loader, Radio,
} from 'lucide-react';
import {
  fetchFactalAlerts, fetchDataminrAlerts,
  fetchGenetecCameras, fetchMilestoneCameras,
  geocodeAddress, findNearestLocation,
  type AlertResult,
} from '../utils/integrations';

interface IntegrationConfig {
  id: string;
  type: string;
  name: string;
  enabled: boolean;
  config: Record<string, string>;
  lastSync?: string;
  status: 'connected' | 'disconnected' | 'error';
}

const INTEGRATION_TYPES = [
  {
    category: 'Threat Intelligence',
    items: [
      { type: 'factal', name: 'Factal', icon: Shield, badge: 'Recommended' },
      { type: 'dataminr', name: 'Dataminr', icon: Shield, badge: '' },
      { type: 'recorded_future', name: 'Recorded Future', icon: Shield, badge: '' },
      { type: 'crowdstrike', name: 'CrowdStrike', icon: Shield, badge: '' },
      { type: 'mandiant', name: 'Mandiant', icon: Shield, badge: '' },
      { type: 'anomali', name: 'Anomali', icon: Shield, badge: '' },
    ],
  },
  {
    category: 'Mass Notification & Response',
    items: [
      { type: 'alertmedia', name: 'AlertMedia', icon: Radio, badge: 'Recommended' },
      { type: 'everbridge', name: 'Everbridge', icon: Radio, badge: '' },
    ],
  },
  {
    category: 'SIEM & SOAR',
    items: [
      { type: 'splunk', name: 'Splunk', icon: Server, badge: '' },
      { type: 'sentinel', name: 'Microsoft Sentinel', icon: Server, badge: '' },
      { type: 'qradar', name: 'QRadar', icon: Server, badge: '' },
      { type: 'elastic', name: 'Elastic SIEM', icon: Server, badge: '' },
      { type: 'splunk_soar', name: 'Splunk SOAR', icon: Server, badge: '' },
      { type: 'demisto', name: 'Demisto/Palo Alto', icon: Server, badge: '' },
    ],
  },
  {
    category: 'Video Management',
    items: [
      { type: 'genetec', name: 'Genetec', icon: Video, badge: '' },
      { type: 'milestone', name: 'Milestone', icon: Video, badge: '' },
      { type: 'avigilon', name: 'Avigilon', icon: Video, badge: '' },
      { type: 'hikvision', name: 'Hikvision', icon: Video, badge: '' },
      { type: 'axis', name: 'Axis', icon: Video, badge: '' },
    ],
  },
  {
    category: 'Access Control',
    items: [
      { type: 'lenel', name: 'Lenel', icon: Shield, badge: '' },
      { type: 'hid', name: 'HID', icon: Shield, badge: '' },
      { type: 'assa_abloy', name: 'ASSA ABLOY', icon: Shield, badge: '' },
    ],
  },
  {
    category: 'Communication',
    items: [
      { type: 'slack', name: 'Slack', icon: MessageSquare, badge: '' },
      { type: 'teams', name: 'Microsoft Teams', icon: MessageSquare, badge: '' },
      { type: 'webex', name: 'Webex', icon: MessageSquare, badge: '' },
      { type: 'email_imap', name: 'Email (IMAP)', icon: Mail, badge: '' },
    ],
  },
  {
    category: 'Other',
    items: [
      { type: 'webhook', name: 'Webhook', icon: Webhook, badge: '' },
      { type: 'rss', name: 'RSS Feed', icon: Globe, badge: '' },
      { type: 'generic_api', name: 'Generic API', icon: Globe, badge: '' },
    ],
  },
];

const ALL_ITEMS = INTEGRATION_TYPES.flatMap(c => c.items);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToIntegration(r: any): IntegrationConfig {
  return {
    id: r.id, type: r.type, name: r.name,
    enabled: Boolean(r.enabled),
    config: JSON.parse(r.config || '{}'),
    lastSync: r.last_sync ?? undefined,
    status: r.status,
  };
}

const CONFIG_FIELDS: Record<string, string[]> = {
  factal:          ['api_key', 'api_endpoint', 'geo_radius_km'],
  dataminr:        ['client_id', 'client_secret', 'geo_radius_km'],
  recorded_future: ['api_key', 'api_endpoint'],
  crowdstrike:     ['api_key', 'api_endpoint'],
  mandiant:        ['api_key', 'client_id', 'client_secret'],
  anomali:         ['api_key', 'api_endpoint'],
  alertmedia:      ['api_key', 'api_endpoint', 'group_ids'],
  everbridge:      ['username', 'password', 'org_id', 'api_endpoint'],
  splunk:          ['splunk_endpoint', 'hec_token', 'index'],
  sentinel:        ['workspace_id', 'workspace_key', 'log_type'],
  qradar:          ['api_endpoint', 'api_key', 'realm'],
  elastic:         ['elasticsearch_url', 'api_key', 'index'],
  splunk_soar:     ['platform_url', 'api_key'],
  demisto:         ['platform_url', 'api_key'],
  genetec:         ['server_url', 'username', 'password'],
  milestone:       ['server_url', 'username', 'password'],
  avigilon:        ['server_url', 'username', 'password'],
  hikvision:       ['server_url', 'username', 'password'],
  axis:            ['server_url', 'username', 'password'],
  lenel:           ['server_url', 'api_key'],
  hid:             ['server_url', 'api_key'],
  assa_abloy:      ['server_url', 'api_key'],
  email_imap:      ['imap_server', 'port', 'username', 'password', 'folder'],
  slack:           ['webhook_url', 'channel'],
  teams:           ['webhook_url'],
  webex:           ['webhook_url', 'token'],
  webhook:         ['webhook_url', 'secret'],
  rss:             ['feed_url'],
  generic_api:     ['api_url', 'auth_type', 'api_key', 'poll_interval'],
};

const FIELD_LABELS: Record<string, string> = {
  api_key: 'API Key', api_endpoint: 'API Endpoint URL',
  client_id: 'Client ID', client_secret: 'Client Secret',
  geo_radius_km: 'Geo-match Radius (km)',
  group_ids: 'Target Group IDs (comma-separated)',
  org_id: 'Organization ID',
  splunk_endpoint: 'Splunk HEC Endpoint', hec_token: 'HEC Token', index: 'Index Name',
  workspace_id: 'Workspace ID', workspace_key: 'Primary Key', log_type: 'Custom Log Table Name',
  elasticsearch_url: 'Elasticsearch URL', realm: 'Realm',
  server_url: 'Server URL', username: 'Username', password: 'Password',
  platform_url: 'Platform URL',
  imap_server: 'IMAP Server', port: 'Port', folder: 'Mail Folder',
  webhook_url: 'Webhook URL', channel: 'Channel', token: 'Token', secret: 'Webhook Secret',
  feed_url: 'RSS Feed URL', api_url: 'API URL',
  auth_type: 'Auth Type (basic/bearer/api_key)',
  headers: 'Custom Headers (JSON)', poll_interval: 'Poll Interval (minutes)',
};

function fieldLabel(f: string): string { return FIELD_LABELS[f] ?? f; }
function fieldType(f: string): string {
  if (f.includes('password') || f.includes('token') || f.includes('secret') || f.includes('key') || f === 'workspace_key') return 'password';
  if (f.includes('url') || f.includes('endpoint') || f.includes('server')) return 'url';
  return 'text';
}

export default function Integrations() {
  const { addIncident, addCameraSource, businessLocations } = useApp();

  const [integrations, setIntegrations] = useState<IntegrationConfig[]>([]);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const [configForm, setConfigForm] = useState<Record<string, string>>({});
  const [isPolling, setIsPolling] = useState(false);
  const [pollingInterval, setPollingInterval] = useState('5');
  const [autoCreateIncident, setAutoCreateIncident] = useState(true);
  const [pollLog, setPollLog] = useState<string[]>([]);
  const [ingestedCount, setIngestedCount] = useState(0);

  // Geo cache — keyed by location id
  const coordsRef = useRef<Map<string, { lat: number; lon: number }>>(new Map());
  // Seen alert IDs — avoid duplicate incident creation per session
  const seenIdsRef = useRef<Set<string>>(new Set());

  // Load integrations from DB
  useEffect(() => {
    getDb().then(async db => {
      const rows = await db.select<unknown[]>('SELECT * FROM integrations ORDER BY rowid');
      setIntegrations((rows as any[]).map(rowToIntegration));
    });
  }, []);

  // Geocode business locations in background
  useEffect(() => {
    businessLocations.forEach(async loc => {
      if (!coordsRef.current.has(loc.id)) {
        const coords = await geocodeAddress(loc.address);
        if (coords) coordsRef.current.set(loc.id, coords);
      }
    });
  }, [businessLocations]);

  // ── Real polling engine ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!isPolling) return;

    const poll = async () => {
      const enabledIntegrations = integrations.filter(i => i.enabled);
      if (!enabledIntegrations.length) return;

      // Build locations with cached coords
      const locsWithCoords = businessLocations.map(loc => ({
        ...loc,
        ...coordsRef.current.get(loc.id),
      }));

      for (const integration of enabledIntegrations) {
        try {
          const since = integration.lastSync ?? new Date(Date.now() - 3_600_000).toISOString();
          let alerts: AlertResult[] = [];
          let cameraCount = 0;

          switch (integration.type) {
            case 'factal':
              alerts = await fetchFactalAlerts(integration.config, since);
              break;
            case 'dataminr':
              alerts = await fetchDataminrAlerts(integration.config);
              break;
            case 'genetec': {
              const cams = await fetchGenetecCameras(integration.config);
              cams.forEach(cam => addCameraSource({ ...cam, status: cam.status ?? 'online' }));
              cameraCount = cams.length;
              break;
            }
            case 'milestone': {
              const cams = await fetchMilestoneCameras(integration.config);
              cams.forEach(cam => addCameraSource({ ...cam, status: cam.status ?? 'online' }));
              cameraCount = cams.length;
              break;
            }
          }

          // Geo-match alerts → auto-create incidents
          let newIncidents = 0;
          if (autoCreateIncident && alerts.length > 0) {
            const radiusKm = parseFloat(integration.config.geo_radius_km ?? '50');
            for (const alert of alerts) {
              if (seenIdsRef.current.has(`${integration.type}:${alert.externalId}`)) continue;
              seenIdsRef.current.add(`${integration.type}:${alert.externalId}`);

              const loc = (alert.lat != null && alert.lon != null)
                ? findNearestLocation(alert.lat, alert.lon, locsWithCoords, radiusKm)
                : businessLocations[0] ?? null;

              if (!loc) continue;

              addIncident({
                timestamp: alert.timestamp,
                source: alert.source,
                details: `[${alert.severity.toUpperCase()}] ${alert.title}\n${alert.description}`.trim(),
                affectedLocation: loc.id,
                notes: `Auto-ingested from ${integration.name}. External ID: ${alert.externalId}`,
                resolverInitials: 'AI',
                hoursOfOperation: loc.hoursOfOperation,
                status: alert.severity === 'critical' || alert.severity === 'high' ? 'escalated' : 'open',
                escalation: alert.severity === 'critical'
                  ? { action: 'Review Immediately', timestamp: new Date().toISOString() }
                  : undefined,
              });
              newIncidents++;
            }
          }

          // Update DB status + last_sync
          const now = new Date().toISOString();
          const db = await getDb();
          await db.execute('UPDATE integrations SET status=?,last_sync=? WHERE id=?',
            ['connected', now, integration.id]);
          setIntegrations(prev => prev.map(i =>
            i.id === integration.id ? { ...i, status: 'connected', lastSync: now } : i,
          ));

          if (newIncidents > 0) {
            setIngestedCount(c => c + newIncidents);
            setPollLog(l => [`${new Date().toLocaleTimeString()} — ${integration.name}: ${newIncidents} new incident(s)`, ...l.slice(0, 49)]);
          }
          if (cameraCount > 0) {
            setPollLog(l => [`${new Date().toLocaleTimeString()} — ${integration.name}: ${cameraCount} camera(s) synced`, ...l.slice(0, 49)]);
          }
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          const db = await getDb();
          await db.execute('UPDATE integrations SET status=? WHERE id=?', ['error', integration.id]);
          setIntegrations(prev => prev.map(i =>
            i.id === integration.id ? { ...i, status: 'error' } : i,
          ));
          setPollLog(l => [`${new Date().toLocaleTimeString()} — ${integration.name} ERROR: ${msg}`, ...l.slice(0, 49)]);
        }
      }
    };

    poll();
    const handle = setInterval(poll, parseInt(pollingInterval) * 60 * 1000);
    return () => clearInterval(handle);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPolling, pollingInterval]);

  const handleAddIntegration = (type: string) => {
    setSelectedType(type);
    setConfigForm({});
    setShowModal(true);
  };

  const handleSaveIntegration = async () => {
    const newInt: IntegrationConfig = {
      id: Date.now().toString(),
      type: selectedType,
      name: ALL_ITEMS.find(i => i.type === selectedType)?.name ?? selectedType,
      enabled: true,
      config: configForm,
      status: 'disconnected',
    };
    const db = await getDb();
    await db.execute('INSERT INTO integrations VALUES (?,?,?,?,?,?,?)', [
      newInt.id, newInt.type, newInt.name, 1,
      JSON.stringify(newInt.config), null, 'disconnected',
    ]);
    setIntegrations(prev => [...prev, newInt]);
    setShowModal(false);
  };

  const handleToggleEnabled = async (id: string) => {
    const target = integrations.find(i => i.id === id);
    if (!target) return;
    const enabled = !target.enabled;
    const db = await getDb();
    await db.execute('UPDATE integrations SET enabled=? WHERE id=?', [enabled ? 1 : 0, id]);
    setIntegrations(prev => prev.map(i => i.id === id ? { ...i, enabled } : i));
  };

  const handleDelete = async (id: string) => {
    const db = await getDb();
    await db.execute('DELETE FROM integrations WHERE id=?', [id]);
    setIntegrations(prev => prev.filter(i => i.id !== id));
  };

  const testConnection = async (integration: IntegrationConfig) => {
    setTestingId(integration.id);
    let newStatus: IntegrationConfig['status'] = 'error';
    try {
      switch (integration.type) {
        case 'factal': {
          const alerts = await fetchFactalAlerts(integration.config, new Date(Date.now() - 3_600_000).toISOString());
          if (Array.isArray(alerts)) newStatus = 'connected';
          break;
        }
        case 'dataminr': {
          const alerts = await fetchDataminrAlerts(integration.config);
          if (Array.isArray(alerts)) newStatus = 'connected';
          break;
        }
        case 'genetec': {
          const cams = await fetchGenetecCameras(integration.config);
          if (Array.isArray(cams)) newStatus = 'connected';
          break;
        }
        case 'milestone': {
          const cams = await fetchMilestoneCameras(integration.config);
          if (Array.isArray(cams)) newStatus = 'connected';
          break;
        }
        default: {
          const urlField = integration.config.api_endpoint ?? integration.config.server_url
            ?? integration.config.platform_url ?? integration.config.elasticsearch_url
            ?? integration.config.api_url ?? integration.config.splunk_endpoint
            ?? integration.config.feed_url ?? integration.config.webhook_url;
          if (urlField) {
            const ctrl = new AbortController();
            const t = setTimeout(() => ctrl.abort(), 5000);
            const res = await fetch(urlField, { method: 'HEAD', mode: 'no-cors', signal: ctrl.signal });
            clearTimeout(t);
            newStatus = res.type === 'opaque' || res.ok ? 'connected' : 'error';
          } else {
            newStatus = 'disconnected';
          }
        }
      }
    } catch { newStatus = 'error'; }

    const now = new Date().toISOString();
    const db = await getDb();
    await db.execute('UPDATE integrations SET status=?,last_sync=? WHERE id=?', [newStatus, now, integration.id]);
    setIntegrations(prev => prev.map(i =>
      i.id === integration.id ? { ...i, status: newStatus, lastSync: now } : i,
    ));
    setTestingId(null);
  };

  const getIcon = (type: string) => {
    const item = ALL_ITEMS.find(i => i.type === type);
    return item ? <item.icon size={20} /> : <Globe size={20} />;
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Integrations</h1>
        {ingestedCount > 0 && (
          <span className="status-badge status-active" style={{ fontSize: '13px' }}>
            {ingestedCount} incidents ingested this session
          </span>
        )}
      </div>

      {/* Polling Controls */}
      <div className="info-banner">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ marginBottom: '4px' }}>Auto-Ingest Settings</h3>
            <p style={{ margin: 0, fontSize: '13px', opacity: 0.85 }}>
              Threat alerts are geo-matched to your business locations and auto-create TriageLog incidents
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', cursor: 'pointer', fontSize: '13px' }}>
              <input type="checkbox" checked={autoCreateIncident} onChange={e => setAutoCreateIncident(e.target.checked)} />
              Auto-create incidents
            </label>
            <select
              style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '6px', padding: '6px 10px', fontSize: '13px' }}
              value={pollingInterval}
              onChange={e => setPollingInterval(e.target.value)}
            >
              <option value="1">Every 1 min</option>
              <option value="5">Every 5 min</option>
              <option value="15">Every 15 min</option>
              <option value="30">Every 30 min</option>
              <option value="60">Every 1 hour</option>
            </select>
            <button
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '7px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 600,
                cursor: 'pointer', border: '1px solid rgba(255,255,255,0.4)',
                background: isPolling ? 'rgba(220,38,38,0.8)' : 'rgba(0,212,170,0.9)',
                color: '#fff',
              }}
              onClick={() => setIsPolling(p => !p)}
            >
              {isPolling ? <><Pause size={15} /> Stop Polling</> : <><Play size={15} /> Start Polling</>}
            </button>
          </div>
        </div>
      </div>

      {/* Poll log */}
      {pollLog.length > 0 && (
        <div className="card" style={{ marginBottom: '16px' }}>
          <div className="card-header">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {isPolling && <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--success)', display: 'inline-block', animation: 'pulse 1.5s infinite' }} />}
              Poll Log
            </h3>
            <button className="btn btn-secondary btn-sm" onClick={() => setPollLog([])}>Clear</button>
          </div>
          <div style={{ fontFamily: 'monospace', fontSize: '12px', maxHeight: '120px', overflowY: 'auto', color: 'var(--text-secondary)' }}>
            {pollLog.map((line, i) => (
              <div key={i} style={{ padding: '2px 0', borderBottom: '1px solid var(--border)' }}>{line}</div>
            ))}
          </div>
        </div>
      )}

      {/* Configured integrations table */}
      {integrations.length > 0 && (
        <div className="card" style={{ marginBottom: '16px' }}>
          <div className="card-header">
            <h3 className="card-title">Configured Integrations</h3>
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Status</th><th>Integration</th><th>Type</th><th>Last Synced</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {integrations.map(intg => (
                  <tr key={intg.id}>
                    <td>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {intg.status === 'connected' && <CheckCircle size={15} style={{ color: 'var(--success)' }} />}
                        {intg.status === 'error' && <XCircle size={15} style={{ color: 'var(--danger)' }} />}
                        {intg.status === 'disconnected' && <AlertTriangle size={15} style={{ color: 'var(--warning)' }} />}
                        <span className={`status-badge status-${intg.status === 'connected' ? 'active' : intg.status === 'error' ? 'dismissed' : 'escalated'}`}>
                          {intg.status}
                        </span>
                      </span>
                    </td>
                    <td style={{ fontWeight: 500 }}>{intg.name}</td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>{intg.type}</td>
                    <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {intg.lastSync ? new Date(intg.lastSync).toLocaleString() : 'Never'}
                    </td>
                    <td>
                      <div className="actions-cell">
                        <button className="btn btn-secondary btn-sm" onClick={() => testConnection(intg)} disabled={testingId === intg.id} title="Test Connection">
                          {testingId === intg.id ? <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <RefreshCw size={14} />}
                        </button>
                        <button className={`btn btn-sm ${intg.enabled ? 'btn-primary' : 'btn-secondary'}`} onClick={() => handleToggleEnabled(intg.id)} title={intg.enabled ? 'Disable' : 'Enable'}>
                          {intg.enabled ? <Pause size={14} /> : <Play size={14} />}
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(intg.id)} title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Integration catalog */}
      <div style={{ display: 'grid', gap: '20px' }}>
        {INTEGRATION_TYPES.map(category => (
          <div className="card" key={category.category}>
            <div className="card-header">
              <h3 className="card-title">{category.category}</h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
              {category.items.map(item => {
                const isConfigured = integrations.some(i => i.type === item.type);
                return (
                  <div
                    key={item.type}
                    style={{
                      padding: '14px', borderRadius: '8px',
                      backgroundColor: isConfigured ? 'rgba(72,187,120,0.08)' : 'var(--bg)',
                      border: `1px solid ${isConfigured ? 'var(--success)' : 'var(--border)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      cursor: isConfigured ? 'default' : 'pointer', transition: 'all 120ms',
                      position: 'relative',
                    }}
                    onClick={() => !isConfigured && handleAddIntegration(item.type)}
                    onMouseEnter={e => { if (!isConfigured) (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--accent)'; }}
                    onMouseLeave={e => { if (!isConfigured) (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'; }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <item.icon size={18} style={{ color: isConfigured ? 'var(--success)' : 'var(--text-secondary)', flexShrink: 0 }} />
                      <div>
                        <span style={{ fontSize: '13px', fontWeight: 500, display: 'block' }}>{item.name}</span>
                        {item.badge && (
                          <span style={{ fontSize: '10px', backgroundColor: 'rgba(0,212,170,0.15)', color: 'var(--accent)', padding: '1px 5px', borderRadius: '3px' }}>
                            {item.badge}
                          </span>
                        )}
                      </div>
                    </div>
                    {isConfigured
                      ? <CheckCircle size={15} style={{ color: 'var(--success)', flexShrink: 0 }} />
                      : <Plus size={15} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Add Integration Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {getIcon(selectedType)}
                <span style={{ marginLeft: '8px' }}>
                  Configure {ALL_ITEMS.find(i => i.type === selectedType)?.name}
                </span>
              </h3>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                Enter your credentials. Click "Test Connection" after saving to verify.
                Your customer provides these credentials from their own subscription.
              </p>
              {(CONFIG_FIELDS[selectedType] ?? []).map(field => (
                <div className="form-group" key={field}>
                  <label className="form-label">{fieldLabel(field)}</label>
                  <input
                    type={fieldType(field)}
                    className="form-input"
                    value={configForm[field] ?? ''}
                    onChange={e => setConfigForm({ ...configForm, [field]: e.target.value })}
                    placeholder={fieldLabel(field)}
                  />
                </div>
              ))}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSaveIntegration}>
                <Plus size={16} /> Add Integration
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.4} }`}</style>
    </div>
  );
}
