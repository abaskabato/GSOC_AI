import { useState } from 'react';
import { useApp } from '../store/AppContext';
import { useAuth } from '../store/AuthContext';
import { useAudit } from '../store/AuditContext';
import { Plus, Edit, Trash2, X, Monitor, Clock, Eye, Download } from 'lucide-react';
import { format } from 'date-fns';
import type { MonitoringRequest } from '../types';
import { exportToCSV } from '../utils/export';

export default function Monitoring() {
  const {
    monitoringRequests,
    monitoringLogs,
    addMonitoringRequest,
    updateMonitoringRequest,
    deleteMonitoringRequest,
    addMonitoringLog,
    businessLocations,
  } = useApp();
  const { currentUser } = useAuth();
  const { addAuditEntry } = useAudit();

  const [showModal, setShowModal] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [editingRequest, setEditingRequest] = useState<MonitoringRequest | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<MonitoringRequest | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState<'requests' | 'logs'>('requests');

  const [formData, setFormData] = useState({
    locationStatus: 'Active',
    requestor: '',
    location: '',
    interval: '1hr' as MonitoringRequest['interval'],
    justification: '',
    startDateTime: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    endDateTime: format(new Date(Date.now() + 24 * 60 * 60 * 1000), "yyyy-MM-dd'T'HH:mm"),
    requestorContact: '',
  });

  const [logFormData, setLogFormData] = useState({
    cameraStatus: 'Online',
    observation: '',
    initials: '',
  });

  const resetForm = () => {
    setFormData({
      locationStatus: 'Active',
      requestor: '',
      location: '',
      interval: '1hr',
      justification: '',
      startDateTime: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      endDateTime: format(new Date(Date.now() + 24 * 60 * 60 * 1000), "yyyy-MM-dd'T'HH:mm"),
      requestorContact: '',
    });
    setEditingRequest(null);
  };

  const handleOpenModal = (request?: MonitoringRequest) => {
    if (request) {
      setEditingRequest(request);
      setFormData({
        locationStatus: request.locationStatus,
        requestor: request.requestor,
        location: request.location,
        interval: request.interval as MonitoringRequest['interval'],
        justification: request.justification,
        startDateTime: request.startDateTime.slice(0, 16),
        endDateTime: request.endDateTime.slice(0, 16),
        requestorContact: request.requestorContact,
      });
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const requestData: Omit<MonitoringRequest, 'id'> = {
      locationStatus: formData.locationStatus,
      requestor: formData.requestor,
      location: formData.location,
      interval: formData.interval,
      justification: formData.justification,
      startDateTime: new Date(formData.startDateTime).toISOString(),
      endDateTime: new Date(formData.endDateTime).toISOString(),
      requestorContact: formData.requestorContact,
    };

    if (editingRequest) {
      updateMonitoringRequest(editingRequest.id, requestData);
      addAuditEntry({ username: currentUser?.username || 'unknown', action: 'updated', entityType: 'monitoring_request', entityId: editingRequest.id, details: `Updated monitoring request for ${formData.requestor}` });
    } else {
      addMonitoringRequest(requestData);
      addAuditEntry({ username: currentUser?.username || 'unknown', action: 'created', entityType: 'monitoring_request', details: `Created monitoring request for ${formData.requestor} at interval ${formData.interval}` });
    }

    setShowModal(false);
    resetForm();
  };

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;

    const location = businessLocations.find(l => l.id === selectedRequest.location);

    addMonitoringLog({
      requestId: selectedRequest.id,
      interval: selectedRequest.interval,
      timeChecked: new Date().toISOString(),
      locationName: location?.name || selectedRequest.location,
      cameraStatus: logFormData.cameraStatus,
      observation: logFormData.observation,
      initials: logFormData.initials || 'AI',
    });

    setShowLogModal(false);
    setLogFormData({
      cameraStatus: 'Online',
      observation: '',
      initials: '',
    });
  };

  const openLogModal = (request: MonitoringRequest) => {
    setSelectedRequest(request);
    setShowLogModal(true);
  };

  const filteredRequests = monitoringRequests.filter(request => {
    const matchesSearch =
      request.requestor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.justification.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || request.locationStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredLogs = monitoringLogs.filter(log => {
    const matchesSearch =
      log.locationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.observation.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getIntervalLabel = (interval: string) => {
    switch (interval) {
      case 'live': return 'Live';
      case '30min': return 'Every 30 min';
      case '1hr': return 'Every 1 hr';
      case '3hr': return 'Every 3 hr';
      default: return interval;
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Monitoring</h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="btn btn-secondary"
            onClick={() => {
              if (activeTab === 'requests') {
                const rows = filteredRequests.map(r => ({
                  Requestor: r.requestor,
                  Contact: r.requestorContact,
                  Location: businessLocations.find(l => l.id === r.location)?.name || r.location,
                  Interval: getIntervalLabel(r.interval),
                  Start: format(new Date(r.startDateTime), 'MM/dd/yyyy HH:mm'),
                  End: format(new Date(r.endDateTime), 'MM/dd/yyyy HH:mm'),
                  Status: r.locationStatus,
                  Justification: r.justification,
                }));
                exportToCSV(rows, `monitoring-requests-${format(new Date(), 'yyyy-MM-dd')}.csv`);
              } else {
                const rows = filteredLogs.map(l => ({
                  TimeChecked: format(new Date(l.timeChecked), 'MM/dd/yyyy HH:mm'),
                  Location: l.locationName,
                  Interval: getIntervalLabel(l.interval),
                  CameraStatus: l.cameraStatus,
                  Observation: l.observation,
                  Initials: l.initials,
                }));
                exportToCSV(rows, `monitoring-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`);
              }
              addAuditEntry({ username: currentUser?.username || 'unknown', action: 'exported', entityType: 'monitoring', details: `Exported monitoring ${activeTab} to CSV` });
            }}
          >
            <Download size={16} /> Export CSV
          </button>
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            <Plus size={16} /> New Request
          </button>
        </div>
      </div>

      <div className="tabs">
        <div 
          className={`tab ${activeTab === 'requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('requests')}
        >
          <Monitor size={16} style={{ marginRight: '8px' }} />
          Monitoring Requests ({filteredRequests.length})
        </div>
        <div 
          className={`tab ${activeTab === 'logs' ? 'active' : ''}`}
          onClick={() => setActiveTab('logs')}
        >
          <Clock size={16} style={{ marginRight: '8px' }} />
          Monitoring Logs ({filteredLogs.length})
        </div>
      </div>

      <div className="search-bar">
        <input
          type="text"
          className="form-input search-input"
          placeholder="Search..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        {activeTab === 'requests' && (
          <select
            className="form-select filter-select"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="Active">Active</option>
            <option value="Paused">Paused</option>
            <option value="Completed">Completed</option>
          </select>
        )}
      </div>

      {activeTab === 'requests' && (
        <div className="card">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Requestor</th>
                  <th>Location</th>
                  <th>Interval</th>
                  <th>Start</th>
                  <th>End</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="empty-state">No monitoring requests</td>
                  </tr>
                ) : (
                  filteredRequests.map(request => (
                    <tr key={request.id}>
                      <td>
                        <div>{request.requestor}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                          {request.requestorContact}
                        </div>
                      </td>
                      <td>
                        {businessLocations.find(l => l.id === request.location)?.name || request.location}
                      </td>
                      <td>{getIntervalLabel(request.interval)}</td>
                      <td>{format(new Date(request.startDateTime), 'MM/dd HH:mm')}</td>
                      <td>{format(new Date(request.endDateTime), 'MM/dd HH:mm')}</td>
                      <td>
                        <span className={`status-badge status-${request.locationStatus.toLowerCase()}`}>
                          {request.locationStatus}
                        </span>
                      </td>
                      <td>
                        <div className="actions-cell">
                          <button 
                            className="btn btn-secondary btn-sm" 
                            onClick={() => openLogModal(request)}
                            title="Add Log"
                          >
                            <Eye size={14} />
                          </button>
                          <button 
                            className="btn btn-secondary btn-sm" 
                            onClick={() => handleOpenModal(request)}
                            title="Edit"
                          >
                            <Edit size={14} />
                          </button>
                          <button 
                            className="btn btn-danger btn-sm" 
                            onClick={() => deleteMonitoringRequest(request.id)}
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="card">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Time Checked</th>
                  <th>Location</th>
                  <th>Interval</th>
                  <th>Camera Status</th>
                  <th>Observation</th>
                  <th>Initials</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="empty-state">No monitoring logs</td>
                  </tr>
                ) : (
                  filteredLogs.map(log => (
                    <tr key={log.id}>
                      <td>{format(new Date(log.timeChecked), 'MM/dd HH:mm')}</td>
                      <td>{log.locationName}</td>
                      <td>{getIntervalLabel(log.interval)}</td>
                      <td>
                        <span className={`status-badge status-${log.cameraStatus === 'Online' ? 'active' : log.cameraStatus === 'Offline' ? 'dismissed' : 'paused'}`}>
                          {log.cameraStatus}
                        </span>
                      </td>
                      <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {log.observation}
                      </td>
                      <td>{log.initials}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editingRequest ? 'Edit Request' : 'New Monitoring Request'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Requestor Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.requestor}
                      onChange={e => setFormData({ ...formData, requestor: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Requestor Contact</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.requestorContact}
                      onChange={e => setFormData({ ...formData, requestorContact: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Location</label>
                    <select
                      className="form-select"
                      value={formData.location}
                      onChange={e => setFormData({ ...formData, location: e.target.value })}
                      required
                    >
                      <option value="">Select location...</option>
                      {businessLocations.map(loc => (
                        <option key={loc.id} value={loc.id}>{loc.name} - {loc.address}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Monitoring Interval</label>
                    <select
                      className="form-select"
                      value={formData.interval}
                      onChange={e => setFormData({ ...formData, interval: e.target.value as MonitoringRequest['interval'] })}
                    >
                      <option value="live">Live Monitoring</option>
                      <option value="30min">Every 30 Minutes</option>
                      <option value="1hr">Every 1 Hour</option>
                      <option value="3hr">Every 3 Hours</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Start Date/Time</label>
                    <input
                      type="datetime-local"
                      className="form-input"
                      value={formData.startDateTime}
                      onChange={e => setFormData({ ...formData, startDateTime: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">End Date/Time</label>
                    <input
                      type="datetime-local"
                      className="form-input"
                      value={formData.endDateTime}
                      onChange={e => setFormData({ ...formData, endDateTime: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Justification / Details</label>
                  <textarea
                    className="form-textarea"
                    value={formData.justification}
                    onChange={e => setFormData({ ...formData, justification: e.target.value })}
                    placeholder="Reason for monitoring request..."
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={formData.locationStatus}
                    onChange={e => setFormData({ ...formData, locationStatus: e.target.value })}
                  >
                    <option value="Active">Active</option>
                    <option value="Paused">Paused</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingRequest ? 'Update' : 'Create'} Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showLogModal && selectedRequest && (
        <div className="modal-overlay" onClick={() => setShowLogModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Add Monitoring Log</h3>
              <button className="modal-close" onClick={() => setShowLogModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddLog}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input
                    type="text"
                    className="form-input"
                    value={businessLocations.find(l => l.id === selectedRequest.location)?.name || selectedRequest.location}
                    disabled
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Interval</label>
                    <input
                      type="text"
                      className="form-input"
                      value={getIntervalLabel(selectedRequest.interval)}
                      disabled
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Camera Status</label>
                    <select
                      className="form-select"
                      value={logFormData.cameraStatus}
                      onChange={e => setLogFormData({ ...logFormData, cameraStatus: e.target.value })}
                    >
                      <option value="Online">Online</option>
                      <option value="Offline">Offline</option>
                      <option value="No Signal">No Signal</option>
                      <option value="Maintenance">Maintenance</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Observation</label>
                  <textarea
                    className="form-textarea"
                    value={logFormData.observation}
                    onChange={e => setLogFormData({ ...logFormData, observation: e.target.value })}
                    placeholder="What was observed during monitoring..."
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Initials</label>
                  <input
                    type="text"
                    className="form-input"
                    value={logFormData.initials}
                    onChange={e => setLogFormData({ ...logFormData, initials: e.target.value })}
                    placeholder="H for Human, AI for AI"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowLogModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Log Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
