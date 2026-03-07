import { useState } from 'react';
import { useApp } from '../store/AppContext';
import { useAuth } from '../store/AuthContext';
import { useAudit } from '../store/AuditContext';
import { Plus, Edit, Trash2, Mail, X, AlertTriangle, CheckCircle, XCircle, ArrowUpCircle, Download } from 'lucide-react';
import { format } from 'date-fns';
import type { Incident } from '../types';
import { exportToCSV } from '../utils/export';

export default function TriageLog() {
  const {
    incidents,
    addIncident,
    updateIncident,
    deleteIncident,
    businessLocations,
    dismissalReasons,
    escalationActions,
    emailTemplates,
    localTimezone,
  } = useApp();
  const { currentUser } = useAuth();
  const { addAuditEntry } = useAudit();

  const [showModal, setShowModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [editingIncident, setEditingIncident] = useState<Incident | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [generatedEmail, setGeneratedEmail] = useState('');

  const [formData, setFormData] = useState({
    timestamp: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    source: 'Phone',
    details: '',
    affectedLocation: '',
    dismissalReason: '',
    escalationAction: '',
    notes: '',
    resolverInitials: '',
    hoursOfOperation: '',
    status: 'open' as Incident['status'],
  });

  const resetForm = () => {
    setFormData({
      timestamp: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      source: 'Phone',
      details: '',
      affectedLocation: '',
      dismissalReason: '',
      escalationAction: '',
      notes: '',
      resolverInitials: '',
      hoursOfOperation: '',
      status: 'open',
    });
    setEditingIncident(null);
  };

  const handleOpenModal = (incident?: Incident) => {
    if (incident) {
      setEditingIncident(incident);
      setFormData({
        timestamp: incident.timestamp.slice(0, 16),
        source: incident.source,
        details: incident.details,
        affectedLocation: incident.affectedLocation,
        dismissalReason: incident.dismissalReason || '',
        escalationAction: incident.escalation?.action || '',
        notes: incident.notes,
        resolverInitials: incident.resolverInitials,
        hoursOfOperation: incident.hoursOfOperation,
        status: incident.status as Incident['status'],
      });
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const location = businessLocations.find(l => l.id === formData.affectedLocation);
    const hoursOfOp = location?.hoursOfOperation || formData.hoursOfOperation;

    const incidentData: Omit<Incident, 'id'> = {
      timestamp: new Date(formData.timestamp).toISOString(),
      source: formData.source,
      details: formData.details,
      affectedLocation: formData.affectedLocation,
      dismissalReason: formData.dismissalReason || undefined,
      escalation: formData.escalationAction ? {
        action: formData.escalationAction,
        timestamp: new Date().toISOString(),
      } : undefined,
      notes: formData.notes,
      resolverInitials: formData.resolverInitials || 'AI',
      hoursOfOperation: hoursOfOp,
      status: formData.status,
    };

    if (editingIncident) {
      updateIncident(editingIncident.id, incidentData);
      addAuditEntry({
        username: currentUser?.username || 'unknown',
        action: 'updated',
        entityType: 'incident',
        entityId: editingIncident.id,
        details: `Updated incident: ${formData.details.slice(0, 80)}`,
      });
    } else {
      addIncident(incidentData);
      addAuditEntry({
        username: currentUser?.username || 'unknown',
        action: 'created',
        entityType: 'incident',
        details: `Created incident from ${formData.source}: ${formData.details.slice(0, 80)}`,
      });
    }

    setShowModal(false);
    resetForm();
  };

  const handleDelete = (incident: Incident) => {
    deleteIncident(incident.id);
    addAuditEntry({
      username: currentUser?.username || 'unknown',
      action: 'deleted',
      entityType: 'incident',
      entityId: incident.id,
      details: `Deleted incident: ${incident.details.slice(0, 80)}`,
    });
  };

  const handleExportCSV = () => {
    const rows = filteredIncidents.map(inc => ({
      Timestamp: format(new Date(inc.timestamp), 'MM/dd/yyyy HH:mm'),
      Source: inc.source,
      Location: businessLocations.find(l => l.id === inc.affectedLocation)?.name || inc.affectedLocation,
      Details: inc.details,
      Status: inc.status,
      DismissalReason: inc.dismissalReason || '',
      EscalationAction: inc.escalation?.action || '',
      Notes: inc.notes,
      Resolver: inc.resolverInitials,
      HoursOfOperation: inc.hoursOfOperation,
    }));
    exportToCSV(rows, `incidents-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    addAuditEntry({
      username: currentUser?.username || 'unknown',
      action: 'exported',
      entityType: 'incident',
      details: `Exported ${rows.length} incidents to CSV`,
    });
  };

  const handleDismiss = (id: string, reason: string) => {
    updateIncident(id, { dismissalReason: reason, status: 'dismissed' });
  };

  const handleEscalate = (id: string, action: string) => {
    updateIncident(id, {
      escalation: { action, timestamp: new Date().toISOString() },
      status: 'escalated'
    });
  };

  const handleGenerateEmail = () => {
    if (!selectedIncident || !selectedTemplate) return;

    const template = emailTemplates.find(t => t.id === selectedTemplate);
    if (!template) return;

    const location = businessLocations.find(l => l.id === selectedIncident.affectedLocation);
    const locationName = location?.name || selectedIncident.affectedLocation;

    let emailBody = template.body
      .replace('{location}', locationName)
      .replace('{details}', selectedIncident.details)
      .replace('{time}', format(new Date(selectedIncident.timestamp), 'PPpp'))
      .replace('{resolver}', selectedIncident.resolverInitials);

    const emailSubject = template.subject.replace('{location}', locationName);

    const mailtoUrl = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    setGeneratedEmail(mailtoUrl);
    setShowEmailModal(false);
    window.open(mailtoUrl, '_blank');
  };

  const filteredIncidents = incidents.filter(incident => {
    const matchesSearch = 
      incident.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.affectedLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.resolverInitials.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || incident.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertTriangle size={14} />;
      case 'dismissed': return <XCircle size={14} />;
      case 'escalated': return <ArrowUpCircle size={14} />;
      case 'resolved': return <CheckCircle size={14} />;
      default: return null;
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">TriageLog</h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary" onClick={handleExportCSV} disabled={filteredIncidents.length === 0}>
            <Download size={16} /> Export CSV
          </button>
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            <Plus size={16} /> New Incident
          </button>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <span className="stat-card-label">Open</span>
          <span className="stat-card-value info">{incidents.filter(i => i.status === 'open').length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-card-label">Escalated</span>
          <span className="stat-card-value warning">{incidents.filter(i => i.status === 'escalated').length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-card-label">Resolved</span>
          <span className="stat-card-value success">{incidents.filter(i => i.status === 'resolved').length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-card-label">Dismissed</span>
          <span className="stat-card-value">{incidents.filter(i => i.status === 'dismissed').length}</span>
        </div>
      </div>

      <div className="search-bar">
        <input
          type="text"
          className="form-input search-input"
          placeholder="Search incidents..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <select
          className="form-select filter-select"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="open">Open</option>
          <option value="dismissed">Dismissed</option>
          <option value="escalated">Escalated</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Source</th>
                <th>Location</th>
                <th>Details</th>
                <th>Resolver</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredIncidents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="empty-state">No incidents found</td>
                </tr>
              ) : (
                filteredIncidents.map(incident => (
                  <tr key={incident.id}>
                    <td>{format(new Date(incident.timestamp), 'MM/dd HH:mm')}</td>
                    <td>{incident.source}</td>
                    <td>
                      {businessLocations.find(l => l.id === incident.affectedLocation)?.name || incident.affectedLocation}
                    </td>
                    <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {incident.details}
                    </td>
                    <td>{incident.resolverInitials}</td>
                    <td>
                      <span className={`status-badge status-${incident.status}`}>
                        {getStatusIcon(incident.status)}
                        <span style={{ marginLeft: '4px' }}>{incident.status}</span>
                      </span>
                    </td>
                    <td>
                      <div className="actions-cell">
                        <button 
                          className="btn btn-secondary btn-sm" 
                          onClick={() => handleOpenModal(incident)}
                          title="Edit"
                        >
                          <Edit size={14} />
                        </button>
                        <button 
                          className="btn btn-secondary btn-sm" 
                          onClick={() => {
                            setSelectedIncident(incident);
                            setShowEmailModal(true);
                          }}
                          title="Generate Email"
                        >
                          <Mail size={14} />
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(incident)}
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

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editingIncident ? 'Edit Incident' : 'New Incident'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Timestamp</label>
                    <input
                      type="datetime-local"
                      className="form-input"
                      value={formData.timestamp}
                      onChange={e => setFormData({ ...formData, timestamp: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Source</label>
                    <select
                      className="form-select"
                      value={formData.source}
                      onChange={e => setFormData({ ...formData, source: e.target.value })}
                    >
                      <option value="Phone">Phone</option>
                      <option value="Email">Email</option>
                      <option value="Camera">Camera</option>
                      <option value="Patrol">Patrol</option>
                      <option value="Third-party">Third-party</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Affected Location</label>
                  <select
                    className="form-select"
                    value={formData.affectedLocation}
                    onChange={e => setFormData({ ...formData, affectedLocation: e.target.value })}
                  >
                    <option value="">Select location...</option>
                    {businessLocations.map(loc => (
                      <option key={loc.id} value={loc.id}>{loc.name} - {loc.address}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Incident Details</label>
                  <textarea
                    className="form-textarea"
                    value={formData.details}
                    onChange={e => setFormData({ ...formData, details: e.target.value })}
                    placeholder="Describe the incident..."
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Resolver Initials</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.resolverInitials}
                      onChange={e => setFormData({ ...formData, resolverInitials: e.target.value })}
                      placeholder="H for Human, AI for AI"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Hours of Operation</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.hoursOfOperation}
                      onChange={e => setFormData({ ...formData, hoursOfOperation: e.target.value })}
                      placeholder="e.g., 6AM - 11PM"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Dismissal Reason</label>
                    <select
                      className="form-select"
                      value={formData.dismissalReason}
                      onChange={e => setFormData({ ...formData, dismissalReason: e.target.value })}
                    >
                      <option value="">Select reason...</option>
                      {dismissalReasons.map(reason => (
                        <option key={reason} value={reason}>{reason}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Escalation Action</label>
                    <select
                      className="form-select"
                      value={formData.escalationAction}
                      onChange={e => setFormData({ ...formData, escalationAction: e.target.value })}
                    >
                      <option value="">Select action...</option>
                      {escalationActions.map(action => (
                        <option key={action} value={action}>{action}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <textarea
                    className="form-textarea"
                    value={formData.notes}
                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Additional notes..."
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as Incident['status'] })}
                  >
                    <option value="open">Open</option>
                    <option value="dismissed">Dismissed</option>
                    <option value="escalated">Escalated</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingIncident ? 'Update' : 'Create'} Incident
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEmailModal && (
        <div className="modal-overlay" onClick={() => setShowEmailModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Generate Email</h3>
              <button className="modal-close" onClick={() => setShowEmailModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Select Email Template</label>
                <select
                  className="form-select"
                  value={selectedTemplate}
                  onChange={e => setSelectedTemplate(e.target.value)}
                >
                  <option value="">Choose template...</option>
                  {emailTemplates.map(template => (
                    <option key={template.id} value={template.id}>{template.name}</option>
                  ))}
                </select>
              </div>
              {selectedTemplate && (
                <div>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>Preview:</p>
                  <div className="email-preview">
                    {emailTemplates.find(t => t.id === selectedTemplate)?.body
                      .replace('{location}', businessLocations.find(l => l.id === selectedIncident?.affectedLocation)?.name || selectedIncident?.affectedLocation || '[Location]')
                      .replace('{details}', selectedIncident?.details || '[Details]')
                      .replace('{time}', selectedIncident ? format(new Date(selectedIncident.timestamp), 'PPpp') : '[Time]')
                      .replace('{resolver}', selectedIncident?.resolverInitials || '[Resolver]')
                    }
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShowEmailModal(false)}>
                Cancel
              </button>
              <button 
                type="button" 
                className="btn btn-primary" 
                onClick={handleGenerateEmail}
                disabled={!selectedTemplate}
              >
                <Mail size={16} /> Open in Email Client
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
