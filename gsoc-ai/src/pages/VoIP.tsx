import { useState, useEffect, useRef } from 'react';
import { useApp } from '../store/AppContext';
import { Phone, PhoneCall, PhoneOff, Mic, MicOff, Volume2, Settings, LogOut, Download, History, Gauge, Zap, User, Plus, Trash2, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

const STATUSES = [
  { value: 'Available', label: 'Available', color: 'success' },
  { value: 'NotReady-TechIssues', label: 'Not Ready - Tech Issues', color: 'warning' },
  { value: 'NotReady-Admin', label: 'Not Ready - Admin', color: 'warning' },
  { value: 'NotReady-Project', label: 'Not Ready - Project', color: 'warning' },
  { value: 'NotReady-Outbound', label: 'Not Ready - Outbound', color: 'warning' },
  { value: 'NotReady-Training', label: 'Not Ready - Training', color: 'warning' },
  { value: 'NotReady-Coaching', label: 'Not Ready - Coaching', color: 'warning' },
  { value: 'AfterCallWork', label: 'After Call Work', color: 'warning' },
  { value: 'NotReady-Meeting', label: 'Not Ready - Meeting', color: 'warning' },
  { value: 'NotReady-Login', label: 'Not Ready - Login', color: 'warning' },
  { value: 'NotReady-Personal', label: 'Not Ready - Personal', color: 'warning' },
  { value: 'NotReady-Lunch', label: 'Not Ready - Lunch', color: 'warning' },
  { value: 'NotReady-Break', label: 'Not Ready - Break', color: 'warning' },
  { value: 'Offline', label: 'Offline', color: 'secondary' },
];

export default function VoIP() {
  const { quickConnects, addQuickConnect, deleteQuickConnect, voipStatus, setVoipStatus } = useApp();
  
  const [activeTab, setActiveTab] = useState<'current' | 'quickconnects' | 'metrics' | 'history' | 'settings'>('current');
  const [dialNumber, setDialNumber] = useState('');
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showAddQuickConnect, setShowAddQuickConnect] = useState(false);
  const [newQuickConnect, setNewQuickConnect] = useState({ name: '', number: '' });
  const [activeCall, setActiveCall] = useState<{ number: string; startTime: Date; muted: boolean; held: boolean } | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [callHistory, setCallHistory] = useState([
    { id: '1', type: 'outbound', number: '555-0123', duration: '5:23', time: '10:30 AM' },
    { id: '2', type: 'inbound', number: '555-0456', duration: '3:12', time: '10:15 AM' },
    { id: '3', type: 'outbound', number: '555-0789', duration: '8:45', time: '09:45 AM' },
    { id: '4', type: 'inbound', number: '555-0321', duration: '2:30', time: '09:20 AM' },
  ]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [audioSettings, setAudioSettings] = useState({
    speaker: 'Default',
    microphone: 'Default',
    ringer: 'Default',
    audioEnhancement: true,
  });

  useEffect(() => {
    if (activeCall) {
      timerRef.current = setInterval(() => setCallDuration(s => s + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setCallDuration(0);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [activeCall]);

  const handleDial = (num: string) => {
    setDialNumber(prev => prev + num);
  };

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleCall = () => {
    if (dialNumber && !activeCall) {
      setActiveCall({ number: dialNumber, startTime: new Date(), muted: false, held: false });
    }
  };

  const handleHangup = () => {
    if (!activeCall) return;
    const duration = formatDuration(callDuration);
    const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    setCallHistory(prev => [
      { id: Date.now().toString(), type: 'outbound', number: activeCall.number, duration, time },
      ...prev,
    ]);
    setActiveCall(null);
    setDialNumber('');
  };

  const handleClear = () => {
    setDialNumber('');
  };

  const handleStatusChange = (status: string) => {
    setVoipStatus({
      status,
      lastChange: new Date().toISOString(),
    });
    setShowStatusMenu(false);
  };

  const handleAddQuickConnect = () => {
    if (newQuickConnect.name && newQuickConnect.number) {
      addQuickConnect(newQuickConnect);
      setNewQuickConnect({ name: '', number: '' });
      setShowAddQuickConnect(false);
    }
  };

  const getCurrentStatus = () => {
    return STATUSES.find(s => s.value === voipStatus.status) || STATUSES[0];
  };

  const mockMetrics = {
    callsToday: callHistory.filter(c => c.type === 'outbound').length,
    avgHandleTime: '4:32',
    avgHoldTime: '0:45',
    callsOnHold: 0,
    availableAgents: 1,
  };

  return (
    <div className="voip-container">
      <div className="voip-main">
        <div className="tabs">
          <div className={`tab ${activeTab === 'current' ? 'active' : ''}`} onClick={() => setActiveTab('current')}>
            <Phone size={16} style={{ marginRight: '8px' }} /> Current
          </div>
          <div className={`tab ${activeTab === 'quickconnects' ? 'active' : ''}`} onClick={() => setActiveTab('quickconnects')}>
            <Zap size={16} style={{ marginRight: '8px' }} /> Quick Connects
          </div>
          <div className={`tab ${activeTab === 'metrics' ? 'active' : ''}`} onClick={() => setActiveTab('metrics')}>
            <Gauge size={16} style={{ marginRight: '8px' }} /> Metrics
          </div>
          <div className={`tab ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
            <History size={16} style={{ marginRight: '8px' }} /> History
          </div>
          <div className={`tab ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
            <Settings size={16} style={{ marginRight: '8px' }} /> Settings
          </div>
        </div>

        {activeCall && (
          <div style={{
            backgroundColor: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: '8px',
            padding: '16px 20px', marginBottom: '12px', display: 'flex',
            alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--success)', animation: 'pulse 1.5s infinite' }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: '15px' }}>Active Call — {activeCall.number}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  {activeCall.held ? 'On Hold' : activeCall.muted ? 'Muted' : 'Connected'} · {formatDuration(callDuration)}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setActiveCall(c => c ? { ...c, muted: !c.muted } : null)}
                style={{ minWidth: '72px' }}
              >
                <Mic size={14} /> {activeCall.muted ? 'Unmute' : 'Mute'}
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setActiveCall(c => c ? { ...c, held: !c.held } : null)}
                style={{ minWidth: '72px' }}
              >
                {activeCall.held ? 'Resume' : 'Hold'}
              </button>
              <button className="btn btn-danger btn-sm" onClick={handleHangup}>
                <PhoneOff size={14} /> Hang Up
              </button>
            </div>
          </div>
        )}

        {activeTab === 'current' && (
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div style={{ position: 'relative' }}>
                <div
                  className="status-indicator"
                  onClick={() => setShowStatusMenu(!showStatusMenu)}
                  style={{ cursor: 'pointer', padding: '8px 14px', backgroundColor: 'var(--bg)', borderRadius: '6px', border: '1px solid var(--border)' }}
                >
                  <span className={`status-dot ${getCurrentStatus().color === 'success' ? 'available' : getCurrentStatus().color === 'warning' ? 'not-ready' : 'offline'}`}></span>
                  <span style={{ fontWeight: 500, fontSize: '13.5px' }}>{getCurrentStatus().label}</span>
                </div>

                {showStatusMenu && (
                  <div className="status-menu">
                    {STATUSES.map(status => (
                      <div
                        key={status.value}
                        onClick={() => handleStatusChange(status.value)}
                        className="status-menu-item"
                      >
                        {status.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ 
                fontSize: '32px', 
                fontWeight: 600, 
                letterSpacing: '4px',
                marginBottom: '8px',
                fontFamily: 'monospace'
              }}>
                {dialNumber || '------'}
              </div>
              {dialNumber && (
                <button 
                  onClick={handleClear}
                  style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                >
                  Clear
                </button>
              )}
            </div>

            <div className="dial-pad">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map(num => (
                <button
                  key={num}
                  className="dial-btn"
                  onClick={() => handleDial(num)}
                >
                  {num}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '24px' }}>
              <button
                className="btn btn-primary"
                style={{ borderRadius: '50%', width: '64px', height: '64px' }}
                onClick={handleCall}
                disabled={!dialNumber || !!activeCall}
                title={activeCall ? 'Already in a call' : 'Call'}
              >
                <PhoneCall size={24} />
              </button>
              <button
                className="btn btn-danger"
                style={{ borderRadius: '50%', width: '64px', height: '64px' }}
                onClick={activeCall ? handleHangup : handleClear}
                title={activeCall ? 'Hang up' : 'Clear'}
              >
                <PhoneOff size={24} />
              </button>
            </div>
          </div>
        )}

        {activeTab === 'quickconnects' && (
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Quick Connects</h3>
              <button className="btn btn-primary btn-sm" onClick={() => setShowAddQuickConnect(true)}>
                <Plus size={14} /> Add
              </button>
            </div>
            <div className="quick-connect">
              {quickConnects.map(qc => (
                <div key={qc.id} className="quick-connect-item">
                  <div>
                    <div style={{ fontWeight: 500 }}>{qc.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{qc.number}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => {
                        setDialNumber(qc.number);
                        setActiveTab('current');
                      }}
                    >
                      <PhoneCall size={14} />
                    </button>
                    <button 
                      className="btn btn-danger btn-sm"
                      onClick={() => deleteQuickConnect(qc.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
              {quickConnects.length === 0 && (
                <div className="empty-state">No quick connects added yet</div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'metrics' && (
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: '16px' }}>Today's Metrics</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              <div style={{ backgroundColor: 'var(--bg)', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: 600, color: 'var(--accent)' }}>{mockMetrics.callsToday}</div>
                <div style={{ color: 'var(--text-secondary)' }}>Calls Today</div>
              </div>
              <div style={{ backgroundColor: 'var(--bg)', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: 600, color: 'var(--accent)' }}>{mockMetrics.avgHandleTime}</div>
                <div style={{ color: 'var(--text-secondary)' }}>Avg Handle Time</div>
              </div>
              <div style={{ backgroundColor: 'var(--bg)', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: 600, color: 'var(--warning)' }}>{mockMetrics.avgHoldTime}</div>
                <div style={{ color: 'var(--text-secondary)' }}>Avg Hold Time</div>
              </div>
              <div style={{ backgroundColor: 'var(--bg)', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: 600, color: 'var(--info)' }}>{mockMetrics.callsOnHold}</div>
                <div style={{ color: 'var(--text-secondary)' }}>Calls On Hold</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: '16px' }}>Call History</h3>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Number</th>
                    <th>Duration</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {callHistory.map(call => (
                    <tr key={call.id}>
                      <td>
                        {call.type === 'outbound' ? (
                          <ArrowUpRight size={16} style={{ color: 'var(--success)' }} />
                        ) : (
                          <ArrowDownLeft size={16} style={{ color: 'var(--info)' }} />
                        )}
                      </td>
                      <td>{call.number}</td>
                      <td>{call.duration}</td>
                      <td>{call.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: '16px' }}>Audio Settings</h3>
            <div className="form-group">
              <label className="form-label">Speaker</label>
              <select 
                className="form-select"
                value={audioSettings.speaker}
                onChange={e => setAudioSettings({ ...audioSettings, speaker: e.target.value })}
              >
                <option>Default</option>
                <option>Speakers (Realtek Audio)</option>
                <option>Bluetooth Speaker</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Microphone</label>
              <select 
                className="form-select"
                value={audioSettings.microphone}
                onChange={e => setAudioSettings({ ...audioSettings, microphone: e.target.value })}
              >
                <option>Default</option>
                <option>Microphone (Realtek Audio)</option>
                <option>Bluetooth Mic</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Ringer</label>
              <select 
                className="form-select"
                value={audioSettings.ringer}
                onChange={e => setAudioSettings({ ...audioSettings, ringer: e.target.value })}
              >
                <option>Default</option>
                <option>Speaker</option>
                <option>Headset</option>
              </select>
            </div>
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={audioSettings.audioEnhancement}
                  onChange={e => setAudioSettings({ ...audioSettings, audioEnhancement: e.target.checked })}
                />
                Audio Enhancement
              </label>
            </div>

            <div style={{ marginTop: '32px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
              <h3 className="card-title" style={{ marginBottom: '16px' }}>Other Settings</h3>
              <div className="form-group">
                <label className="form-label">Language</label>
                <select className="form-select">
                  <option>English (US)</option>
                  <option>Spanish</option>
                  <option>French</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button className="btn btn-secondary">
                  <Download size={16} /> Download Logs
                </button>
                <button className="btn btn-danger">
                  <LogOut size={16} /> Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="voip-sidebar">
        <div className="card">
          <div style={{ textAlign: 'center', padding: '16px' }}>
            <User size={48} style={{ marginBottom: '8px', opacity: 0.5 }} />
            <div style={{ fontWeight: 500 }}>Agent</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Status: {getCurrentStatus().label}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Last change: {new Date(voipStatus.lastChange).toLocaleTimeString()}
            </div>
          </div>
        </div>

        <div className="card">
          <h4 style={{ marginBottom: '12px' }}>Audio Controls</h4>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-secondary btn-sm" style={{ flex: 1 }}>
              <Mic size={16} /> Mute
            </button>
            <button className="btn btn-secondary btn-sm" style={{ flex: 1 }}>
              <Volume2 size={16} /> Speaker
            </button>
          </div>
        </div>

        {showAddQuickConnect && (
          <div className="card">
            <h4 style={{ marginBottom: '12px' }}>Add Quick Connect</h4>
            <div className="form-group">
              <input
                type="text"
                className="form-input"
                placeholder="Name"
                value={newQuickConnect.name}
                onChange={e => setNewQuickConnect({ ...newQuickConnect, name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                className="form-input"
                placeholder="Number"
                value={newQuickConnect.number}
                onChange={e => setNewQuickConnect({ ...newQuickConnect, number: e.target.value })}
              />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-primary btn-sm" onClick={handleAddQuickConnect}>Add</button>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowAddQuickConnect(false)}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
