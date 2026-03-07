import React, { useState, useEffect } from 'react';
import { useApp } from '../store/AppContext';
import { getDb } from '../utils/db';
import {
  Shield, Server, Video, Mail, MessageSquare, Webhook,
  Globe, Play, Pause, Trash2, Plus, RefreshCw,
  CheckCircle, XCircle, AlertTriangle, X, Loader
} from 'lucide-react';
import type { Incident } from '../types';

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
      { type: 'dataminr', name: 'Dataminr', icon: Shield },
      { type: 'recorded_future', name: 'Recorded Future', icon: Shield },
      { type: 'crowdstrike', name: 'CrowdStrike', icon: Shield },
      { type: 'mandiant', name: 'Mandiant', icon: Shield },
      { type: 'anomali', name: 'Anomali', icon: Shield },
    ]
  },
  {
    category: 'SIEM & SOAR',
    items: [
      { type: 'splunk', name: 'Splunk', icon: Server },
      { type: 'qradar', name: 'QRadar', icon: Server },
      { type: 'elastic', name: 'Elastic SIEM', icon: Server },
      { type: 'sentinel', name: 'Microsoft Sentinel', icon: Server },
      { type: 'splunk_soar', name: 'Splunk SOAR', icon: Server },
      { type: 'demisto', name: 'Demisto/Palo Alto', icon: Server },
    ]
  },
  {
    category: 'Video Management',
    items: [
      { type: 'genetec', name: 'Genetec', icon: Video },
      { type: 'milestone', name: 'Milestone', icon: Video },
      { type: 'avigilon', name: 'Avigilon', icon: Video },
      { type: 'hikvision', name: 'Hikvision', icon: Video },
      { type: 'axis', name: 'Axis', icon: Video },
    ]
  },
  {
    category: 'Access Control',
    items: [
      { type: 'lenel', name: 'Lenel', icon: Shield },
      { type: 'hid', name: 'HID', icon: Shield },
      { type: 'assa_abloy', name: 'ASSA ABLOY', icon: Shield },
    ]
  },
  {
    category: 'Communication',
    items: [
      { type: 'email_imap', name: 'Email (IMAP)', icon: Mail },
      { type: 'slack', name: 'Slack', icon: MessageSquare },
      { type: 'teams', name: 'Microsoft Teams', icon: MessageSquare },
      { type: 'webex', name: 'Webex', icon: MessageSquare },
    ]
  },
  {
    category: 'Other',
    items: [
      { type: 'webhook', name: 'Webhook Receiver', icon: Webhook },
      { type: 'rss', name: 'RSS Feed', icon: Globe },
      { type: 'generic_api', name: 'Generic API', icon: Globe },
    ]
  }
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToIntegration(r: any): IntegrationConfig {
  return {
    id: r.id,
    type: r.type,
    name: r.name,
    enabled: Boolean(r.enabled),
    config: JSON.parse(r.config || '{}'),
    lastSync: r.last_sync ?? undefined,
    status: r.status,
  };
}

export default function Integrations() {
  const { addIncident, businessLocations } = useApp();

  const [integrations, setIntegrations] = useState<IntegrationConfig[]>([]);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const [configForm, setConfigForm] = useState<Record<string, string>>({});
  const [isPolling, setIsPolling] = useState(false);
  const [pollingInterval, setPollingInterval] = useState('5');
  const [autoCreateIncident, setAutoCreateIncident] = useState(true);

  // Load from DB on mount
  useEffect(() => {
    getDb().then(async db => {
      const rows = await db.select<unknown[]>('SELECT * FROM integrations ORDER BY rowid');
      setIntegrations((rows as any[]).map(rowToIntegration));
    });
  }, []);

  const saveToDb = async (updated: IntegrationConfig[]) => {
    setIntegrations(updated);
  };

  const getConfigFields = (type: string) => {
    const fields: Record<string, string[]> = {
      dataminr: ['api_key', 'api_endpoint', 'filter_severity'],
      recorded_future: ['api_key', 'api_endpoint'],
      crowdstrike: ['api_key', 'api_endpoint'],
      mandiant: ['api_key', 'client_id', 'client_secret'],
      anomali: ['api_key', 'api_endpoint'],
      splunk: ['splunk_endpoint', 'hec_token', 'index'],
      qradar: ['api_endpoint', 'api_key', 'realm'],
      elastic: ['elasticsearch_url', 'api_key', 'index'],
      sentinel: ['tenant_id', 'client_id', 'client_secret'],
      splunk_soar: ['platform_url', 'api_key'],
      demisto: ['platform_url', 'api_key'],
      genetec: ['server_url', 'username', 'password'],
      milestone: ['server_url', 'username', 'password'],
      avigilon: ['server_url', 'username', 'password'],
      hikvision: ['server_url', 'username', 'password'],
      axis: ['server_url', 'username', 'password'],
      lenel: ['server_url', 'api_key'],
      hid: ['server_url', 'api_key'],
      assa_abloy: ['server_url', 'api_key'],
      email_imap: ['imap_server', 'port', 'username', 'password', 'folder'],
      slack: ['webhook_url', 'channel'],
      teams: ['webhook_url'],
      webex: ['webhook_url', 'token'],
      webhook: ['webhook_url', 'secret'],
      rss: ['feed_url'],
      generic_api: ['api_url', 'auth_type', 'api_key', 'headers', 'poll_interval'],
    };
    return fields[type] || [];
  };

  const getFieldLabel = (field: string) => {
    const labels: Record<string, string> = {
      api_key: 'API Key', api_endpoint: 'API Endpoint URL', filter_severity: 'Filter by Severity',
      client_id: 'Client ID', client_secret: 'Client Secret', splunk_endpoint: 'Splunk HEC Endpoint',
      hec_token: 'HEC Token', index: 'Splunk Index', realm: 'Realm',
      elasticsearch_url: 'Elasticsearch URL', server_url: 'Server URL', username: 'Username',
      password: 'Password', api_url: 'API URL', auth_type: 'Auth Type (basic/bearer/api_key)',
      headers: 'Custom Headers (JSON)', poll_interval: 'Poll Interval (minutes)', tenant_id: 'Tenant ID',
      platform_url: 'Platform URL', imap_server: 'IMAP Server', port: 'Port', folder: 'Mail Folder',
      webhook_url: 'Webhook URL', channel: 'Channel', token: 'Token', secret: 'Webhook Secret',
      feed_url: 'RSS Feed URL',
    };
    return labels[field] || field;
  };

  const getFieldType = (field: string) => {
    if (field.includes('password') || field.includes('token') || field.includes('secret') || field.includes('key')) return 'password';
    if (field.includes('url') || field.includes('endpoint') || field.includes('server')) return 'url';
    return 'text';
  };

  const handleAddIntegration = (type: string) => {
    setSelectedType(type);
    setConfigForm({});
    setShowModal(true);
  };

  const handleSaveIntegration = async () => {
    const newIntegration: IntegrationConfig = {
      id: Date.now().toString(),
      type: selectedType,
      name: INTEGRATION_TYPES.flatMap(c => c.items).find(i => i.type === selectedType)?.name || selectedType,
      enabled: true,
      config: configForm,
      status: 'disconnected',
    };
    const db = await getDb();
    await db.execute(
      'INSERT INTO integrations VALUES (?,?,?,?,?,?,?)',
      [newIntegration.id, newIntegration.type, newIntegration.name, 1,
       JSON.stringify(newIntegration.config), null, 'disconnected']
    );
    setIntegrations(prev => [...prev, newIntegration]);
    setShowModal(false);
  };

  const handleToggleEnabled = async (id: string) => {
    const target = integrations.find(i => i.id === id);
    if (!target) return;
    const newEnabled = !target.enabled;
    const db = await getDb();
    await db.execute('UPDATE integrations SET enabled=? WHERE id=?', [newEnabled ? 1 : 0, id]);
    setIntegrations(prev => prev.map(i => i.id === id ? { ...i, enabled: newEnabled } : i));
  };

  const handleDelete = async (id: string) => {
    const db = await getDb();
    await db.execute('DELETE FROM integrations WHERE id=?', [id]);
    setIntegrations(prev => prev.filter(i => i.id !== id));
  };

  const testConnection = async (integration: IntegrationConfig) => {
    setTestingId(integration.id);
    let newStatus: IntegrationConfig['status'] = 'error';
    const lastSync = new Date().toISOString();

    // Determine the URL to probe
    const urlField = integration.config.api_endpoint || integration.config.server_url ||
      integration.config.platform_url || integration.config.elasticsearch_url ||
      integration.config.api_url || integration.config.splunk_endpoint ||
      integration.config.feed_url || integration.config.webhook_url;

    if (urlField) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        const res = await fetch(urlField, { method: 'HEAD', mode: 'no-cors', signal: controller.signal });
        clearTimeout(timeout);
        // no-cors mode always returns opaque response with status 0; reaching here means network reachable
        newStatus = res.type === 'opaque' || res.ok ? 'connected' : 'error';
      } catch {
        newStatus = 'error';
      }
    } else {
      // No URL configured — mark disconnected
      newStatus = 'disconnected';
    }

    const db = await getDb();
    await db.execute('UPDATE integrations SET status=?,last_sync=? WHERE id=?', [newStatus, lastSync, integration.id]);
    setIntegrations(prev =>
      prev.map(i => i.id === integration.id ? { ...i, status: newStatus, lastSync } : i)
    );
    setTestingId(null);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleWebhook = async (data: any) => {
    const integration = integrations.find(i => i.type === 'webhook' && i.enabled);
    if (!integration || !autoCreateIncident || businessLocations.length === 0) return;
    const incident: Omit<Incident, 'id'> = {
      timestamp: new Date().toISOString(),
      source: 'Webhook',
      details: typeof data === 'string' ? data : JSON.stringify(data),
      affectedLocation: businessLocations[0].id,
      notes: `Received from webhook: ${integration.name}`,
      resolverInitials: 'AI',
      hoursOfOperation: businessLocations[0].hoursOfOperation,
      status: 'open',
    };
    addIncident(incident);
  };

  void handleWebhook; // referenced for lint

  const getIntegrationIcon = (type: string) => {
    for (const category of INTEGRATION_TYPES) {
      const item = category.items.find(i => i.type === type);
      if (item) return <item.icon size={20} />;
    }
    return <Globe size={20} />;
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Integrations</h1>
      </div>

      <div className="info-banner">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ marginBottom: '4px' }}>Auto-Population Settings</h3>
            <p>Configure how incidents are automatically imported into TriageLog</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', cursor: 'pointer' }}>
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
                padding: '7px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: 500,
                cursor: 'pointer', border: '1px solid rgba(255,255,255,0.4)',
                background: isPolling ? 'rgba(220,38,38,0.8)' : 'rgba(255,255,255,0.2)',
                color: '#fff',
              }}
              onClick={() => setIsPolling(p => !p)}
            >
              {isPolling ? <><Pause size={15} /> Stop Polling</> : <><Play size={15} /> Start Polling</>}
            </button>
          </div>
        </div>
      </div>

      {integrations.length > 0 && (
        <div className="card" style={{ marginBottom: '16px' }}>
          <div className="card-header">
            <h3 className="card-title">Configured Integrations</h3>
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Integration</th>
                  <th>Type</th>
                  <th>Last Tested</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {integrations.map(integration => (
                  <tr key={integration.id}>
                    <td>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {integration.status === 'connected' && <CheckCircle size={15} style={{ color: 'var(--success)' }} />}
                        {integration.status === 'error' && <XCircle size={15} style={{ color: 'var(--danger)' }} />}
                        {integration.status === 'disconnected' && <AlertTriangle size={15} style={{ color: 'var(--warning)' }} />}
                        <span className={`status-badge status-${integration.status === 'connected' ? 'active' : integration.status === 'error' ? 'dismissed' : 'escalated'}`}>
                          {integration.status}
                        </span>
                      </span>
                    </td>
                    <td style={{ fontWeight: 500 }}>{integration.name}</td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>{integration.type}</td>
                    <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {integration.lastSync ? new Date(integration.lastSync).toLocaleString() : 'Never'}
                    </td>
                    <td>
                      <div className="actions-cell">
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => testConnection(integration)}
                          disabled={testingId === integration.id}
                          title="Test Connection"
                        >
                          {testingId === integration.id
                            ? <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} />
                            : <RefreshCw size={14} />}
                        </button>
                        <button
                          className={`btn btn-sm ${integration.enabled ? 'btn-primary' : 'btn-secondary'}`}
                          onClick={() => handleToggleEnabled(integration.id)}
                          title={integration.enabled ? 'Disable' : 'Enable'}
                        >
                          {integration.enabled ? <Pause size={14} /> : <Play size={14} />}
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(integration.id)}
                          title="Delete"
                        >
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
                      padding: '14px',
                      backgroundColor: isConfigured ? '#F0FDF4' : 'var(--bg)',
                      borderRadius: '8px',
                      border: `1px solid ${isConfigured ? '#86EFAC' : 'var(--border)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: isConfigured ? 'default' : 'pointer',
                      transition: 'all 120ms',
                    }}
                    onClick={() => !isConfigured && handleAddIntegration(item.type)}
                    onMouseEnter={e => { if (!isConfigured) (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--primary)'; }}
                    onMouseLeave={e => { if (!isConfigured) (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'; }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <item.icon size={18} style={{ color: isConfigured ? 'var(--success)' : 'var(--text-secondary)' }} />
                      <span style={{ fontSize: '13.5px', fontWeight: 500 }}>{item.name}</span>
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

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                Configure {INTEGRATION_TYPES.flatMap(c => c.items).find(i => i.type === selectedType)?.name}
              </h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                Enter your connection details. Use "Test Connection" after saving to verify reachability.
              </p>
              {getConfigFields(selectedType).map(field => (
                <div className="form-group" key={field}>
                  <label className="form-label">{getFieldLabel(field)}</label>
                  <input
                    type={getFieldType(field)}
                    className="form-input"
                    value={configForm[field] || ''}
                    onChange={e => setConfigForm({ ...configForm, [field]: e.target.value })}
                    placeholder={getFieldLabel(field)}
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

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
