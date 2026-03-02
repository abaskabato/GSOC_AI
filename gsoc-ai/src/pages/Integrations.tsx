import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { 
  Shield, Server, Video, Mail, MessageSquare, Webhook, 
  Globe, Settings, Play, Pause, Trash2, Plus, RefreshCw,
  CheckCircle, XCircle, AlertTriangle, X
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

export default function Integrations() {
  const { addIncident, businessLocations, localTimezone } = useApp();
  
  const [integrations, setIntegrations] = useState<IntegrationConfig[]>(() => {
    const saved = localStorage.getItem('integrations');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [showModal, setShowModal] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const [configForm, setConfigForm] = useState<Record<string, string>>({});
  const [isPolling, setIsPolling] = useState(false);
  const [pollingInterval, setPollingInterval] = useState('5');
  const [autoCreateIncident, setAutoCreateIncident] = useState(true);

  const getConfigFields = (type: string) => {
    const fields: Record<string, string[]> = {
      dataminr: ['api_key', 'api_endpoint', 'filter_severity'],
      recorded_future: ['api_key', 'api_endpoint'],
      crowdsrike: ['api_key', 'api_endpoint'],
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
      api_key: 'API Key',
      api_endpoint: 'API Endpoint URL',
      filter_severity: 'Filter by Severity',
      client_id: 'Client ID',
      client_secret: 'Client Secret',
      splunk_endpoint: 'Splunk HEC Endpoint',
      hec_token: 'HEC Token',
      index: 'Splunk Index',
      qradar_endpoint: 'QRadar API Endpoint',
      realm: 'Realm',
      elasticsearch_url: 'Elasticsearch URL',
      server_url: 'Server URL',
      username: 'Username',
      password: 'Password',
      api_url: 'API URL',
      auth_type: 'Auth Type (basic/bearer/api_key)',
      headers: 'Custom Headers (JSON)',
      poll_interval: 'Poll Interval (minutes)',
      tenant_id: 'Tenant ID',
      platform_url: 'Platform URL',
      imap_server: 'IMAP Server',
      port: 'Port',
      folder: 'Mail Folder',
      webhook_url: 'Webhook URL',
      channel: 'Channel',
      token: 'Token',
      secret: 'Webhook Secret',
      feed_url: 'RSS Feed URL',
    };
    return labels[field] || field;
  };

  const getFieldType = (field: string) => {
    if (field.includes('password') || field.includes('token') || field.includes('secret') || field.includes('key')) {
      return 'password';
    }
    if (field.includes('url') || field.includes('endpoint') || field.includes('server')) {
      return 'url';
    }
    return 'text';
  };

  const handleAddIntegration = (type: string) => {
    setSelectedType(type);
    setConfigForm({});
    setShowModal(true);
  };

  const handleSaveIntegration = () => {
    const newIntegration: IntegrationConfig = {
      id: Date.now().toString(),
      type: selectedType,
      name: INTEGRATION_TYPES.flatMap(c => c.items).find(i => i.type === selectedType)?.name || selectedType,
      enabled: true,
      config: configForm,
      status: 'disconnected',
    };
    const updated = [...integrations, newIntegration];
    setIntegrations(updated);
    localStorage.setItem('integrations', JSON.stringify(updated));
    setShowModal(false);
  };

  const handleToggleEnabled = (id: string) => {
    const updated = integrations.map(i => 
      i.id === id ? { ...i, enabled: !i.enabled } : i
    );
    setIntegrations(updated);
    localStorage.setItem('integrations', JSON.stringify(updated));
  };

  const handleDelete = (id: string) => {
    const updated = integrations.filter(i => i.id !== id);
    setIntegrations(updated);
    localStorage.setItem('integrations', JSON.stringify(updated));
  };

  const testConnection = async (integration: IntegrationConfig) => {
    const newStatus: 'connected' | 'disconnected' | 'error' = 'connected';
    const updated = integrations.map(i => 
      i.id === integration.id ? { ...i, status: newStatus, lastSync: new Date().toISOString() } as IntegrationConfig : i
    );
    setIntegrations(updated);
    localStorage.setItem('integrations', JSON.stringify(updated));
  };

  const handleWebhook = async (data: any) => {
    const integration = integrations.find(i => i.type === 'webhook' && i.enabled);
    if (!integration) return;

    if (autoCreateIncident && businessLocations.length > 0) {
      const incident: Omit<Incident, 'id'> = {
        timestamp: new Date().toISOString(),
        source: 'Webhook',
        details: JSON.stringify(data),
        affectedLocation: businessLocations[0].id,
        notes: `Received from webhook: ${integration.name}`,
        resolverInitials: 'AI',
        hoursOfOperation: businessLocations[0].hoursOfOperation,
        status: 'open',
      };
      addIncident(incident);
    }
  };

  const renderConfigForm = () => {
    const fields = getConfigFields(selectedType);
    return (
      <div className="modal-body">
        <div className="form-group">
          <label className="form-label">Configuration</label>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Configure the connection settings for {INTEGRATION_TYPES.flatMap(c => c.items).find(i => i.type === selectedType)?.name}
          </p>
        </div>
        {fields.map(field => (
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
    );
  };

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

      <div className="card" style={{ marginBottom: '16px', backgroundColor: 'var(--primary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ marginBottom: '8px' }}>Auto-Population Settings</h3>
            <p style={{ fontSize: '12px', opacity: 0.8 }}>
              Configure how incidents are automatically imported into TriageLog
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input 
                type="checkbox" 
                checked={autoCreateIncident}
                onChange={e => setAutoCreateIncident(e.target.checked)}
              />
              Auto-create incidents
            </label>
            <select 
              className="form-select" 
              style={{ width: 'auto' }}
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
              className={`btn ${isPolling ? 'btn-danger' : 'btn-primary'}`}
              onClick={() => setIsPolling(!isPolling)}
            >
              {isPolling ? <Pause size={16} /> : <Play size={16} />}
              {isPolling ? 'Stop Polling' : 'Start Polling'}
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
                  <th>Last Sync</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {integrations.map(integration => (
                  <tr key={integration.id}>
                    <td>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {integration.status === 'connected' && <CheckCircle size={16} style={{ color: 'var(--success)' }} />}
                        {integration.status === 'error' && <XCircle size={16} style={{ color: 'var(--danger)' }} />}
                        {integration.status === 'disconnected' && <AlertTriangle size={16} style={{ color: 'var(--warning)' }} />}
                        {integration.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </td>
                    <td>{integration.name}</td>
                    <td>{integration.type}</td>
                    <td>{integration.lastSync ? new Date(integration.lastSync).toLocaleString() : 'Never'}</td>
                    <td>
                      <div className="actions-cell">
                        <button 
                          className="btn btn-secondary btn-sm"
                          onClick={() => testConnection(integration)}
                          title="Test Connection"
                        >
                          <RefreshCw size={14} />
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

      <div style={{ display: 'grid', gap: '24px' }}>
        {INTEGRATION_TYPES.map(category => (
          <div className="card" key={category.category}>
            <div className="card-header">
              <h3 className="card-title">{category.category}</h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
              {category.items.map(item => {
                const isConfigured = integrations.some(i => i.type === item.type);
                return (
                  <div 
                    key={item.type}
                    style={{
                      padding: '16px',
                      backgroundColor: isConfigured ? 'rgba(0, 212, 170, 0.1)' : 'var(--bg)',
                      borderRadius: '8px',
                      border: `1px solid ${isConfigured ? 'var(--accent)' : 'rgba(255,255,255,0.1)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                    }}
                    onClick={() => !isConfigured && handleAddIntegration(item.type)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <item.icon size={20} />
                      <span>{item.name}</span>
                    </div>
                    {isConfigured ? (
                      <CheckCircle size={16} style={{ color: 'var(--accent)' }} />
                    ) : (
                      <Plus size={16} style={{ color: 'var(--text-secondary)' }} />
                    )}
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
            {renderConfigForm()}
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSaveIntegration}>
                <Plus size={16} /> Add Integration
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
