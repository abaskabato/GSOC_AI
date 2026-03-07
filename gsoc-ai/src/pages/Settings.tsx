import { useState } from 'react';
import { useApp } from '../store/AppContext';
import { useAuth } from '../store/AuthContext';
import { useAudit } from '../store/AuditContext';
import { Building, Camera, X, Plus, Trash2, Settings as SettingsIcon, AlertCircle, Users, ClipboardList, Eye, EyeOff, Download } from 'lucide-react';
import { format } from 'date-fns';
import type { BusinessLocation, CameraSource } from '../types';
import type { User } from '../store/AuthContext';
import { exportToCSV } from '../utils/export';

export default function Settings() {
  const {
    businessName, setBusinessName,
    businessLocations, addBusinessLocation, updateBusinessLocation, deleteBusinessLocation,
    dismissalReasons, setDismissalReasons,
    escalationActions, setEscalationActions,
    cameraSources, addCameraSource, updateCameraSource, deleteCameraSource,
  } = useApp();

  const { currentUser, users, addUser, updateUser, deleteUser, changePassword } = useAuth();
  const { auditLog, clearAuditLog } = useAudit();

  const [activeTab, setActiveTab] = useState<'business' | 'customize' | 'cameras' | 'users' | 'audit'>('business');
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [showDismissalModal, setShowDismissalModal] = useState(false);
  const [showEscalationModal, setShowEscalationModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState<typeof businessLocations[0] | null>(null);
  const [editingCamera, setEditingCamera] = useState<typeof cameraSources[0] | null>(null);
  const [newDismissalReason, setNewDismissalReason] = useState('');
  const [newEscalationAction, setNewEscalationAction] = useState('');

  // Location form
  const [businessFormData, setBusinessFormData] = useState({ name: '', address: '', hoursOfOperation: '', timezone: 'America/Los_Angeles' });
  // Camera form
  const [cameraFormData, setCameraFormData] = useState({ name: '', type: 'Genetec', url: '', status: 'offline' as CameraSource['status'] });
  // New user form
  const [newUserForm, setNewUserForm] = useState({ username: '', password: '', confirmPassword: '', role: 'analyst' as User['role'], initials: '' });
  const [newUserError, setNewUserError] = useState('');

  // Change password form
  const [pwForm, setPwForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [showOldPw, setShowOldPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  // Audit filter
  const [auditFilter, setAuditFilter] = useState('');

  const resetLocationForm = () => { setBusinessFormData({ name: '', address: '', hoursOfOperation: '', timezone: 'America/Los_Angeles' }); setEditingLocation(null); };
  const resetCameraForm = () => { setCameraFormData({ name: '', type: 'Genetec', url: '', status: 'offline' }); setEditingCamera(null); };

  const handleOpenLocationModal = (loc?: BusinessLocation) => {
    if (loc) { setEditingLocation(loc); setBusinessFormData({ name: loc.name, address: loc.address, hoursOfOperation: loc.hoursOfOperation, timezone: loc.timezone }); }
    else { resetLocationForm(); }
    setShowLocationModal(true);
  };

  const handleOpenCameraModal = (cam?: CameraSource) => {
    if (cam) { setEditingCamera(cam); setCameraFormData({ name: cam.name, type: cam.type, url: cam.url, status: cam.status }); }
    else { resetCameraForm(); }
    setShowCameraModal(true);
  };

  const handleSubmitLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingLocation) updateBusinessLocation(editingLocation.id, businessFormData);
    else addBusinessLocation(businessFormData);
    setShowLocationModal(false);
    resetLocationForm();
  };

  const handleSubmitCamera = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCamera) updateCameraSource(editingCamera.id, cameraFormData);
    else addCameraSource(cameraFormData);
    setShowCameraModal(false);
    resetCameraForm();
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError('');
    setPwSuccess('');
    if (pwForm.newPassword !== pwForm.confirmPassword) { setPwError('New passwords do not match'); return; }
    if (pwForm.newPassword.length < 8) { setPwError('New password must be at least 8 characters'); return; }
    if (!currentUser) return;
    const result = await changePassword(currentUser.id, pwForm.oldPassword, pwForm.newPassword);
    if (result.success) {
      setPwSuccess('Password changed successfully');
      setPwForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } else {
      setPwError(result.error || 'Failed to change password');
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewUserError('');
    if (newUserForm.password !== newUserForm.confirmPassword) { setNewUserError('Passwords do not match'); return; }
    if (newUserForm.password.length < 8) { setNewUserError('Password must be at least 8 characters'); return; }
    if (users.some(u => u.username.toLowerCase() === newUserForm.username.toLowerCase())) { setNewUserError('Username already exists'); return; }
    await addUser(newUserForm.username, newUserForm.password, newUserForm.role, newUserForm.initials);
    setNewUserForm({ username: '', password: '', confirmPassword: '', role: 'analyst', initials: '' });
    setShowAddUserModal(false);
  };

  const filteredAudit = auditLog.filter(entry =>
    !auditFilter ||
    entry.username.toLowerCase().includes(auditFilter.toLowerCase()) ||
    entry.action.toLowerCase().includes(auditFilter.toLowerCase()) ||
    entry.entityType.toLowerCase().includes(auditFilter.toLowerCase()) ||
    entry.details.toLowerCase().includes(auditFilter.toLowerCase())
  );

  const exportAuditLog = () => {
    const rows = filteredAudit.map(e => ({
      Timestamp: format(new Date(e.timestamp), 'MM/dd/yyyy HH:mm:ss'),
      User: e.username,
      Action: e.action,
      EntityType: e.entityType,
      EntityId: e.entityId || '',
      Details: e.details,
    }));
    exportToCSV(rows, `audit-log-${format(new Date(), 'yyyy-MM-dd')}.csv`);
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
      </div>

      <div className="tabs" style={{ flexWrap: 'wrap' }}>
        <div className={`tab ${activeTab === 'business' ? 'active' : ''}`} onClick={() => setActiveTab('business')}>
          <Building size={16} style={{ marginRight: '8px' }} /> Business & Locations
        </div>
        <div className={`tab ${activeTab === 'customize' ? 'active' : ''}`} onClick={() => setActiveTab('customize')}>
          <SettingsIcon size={16} style={{ marginRight: '8px' }} /> Customization
        </div>
        <div className={`tab ${activeTab === 'cameras' ? 'active' : ''}`} onClick={() => setActiveTab('cameras')}>
          <Camera size={16} style={{ marginRight: '8px' }} /> Cameras
        </div>
        <div className={`tab ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
          <Users size={16} style={{ marginRight: '8px' }} /> Users
        </div>
        <div className={`tab ${activeTab === 'audit' ? 'active' : ''}`} onClick={() => setActiveTab('audit')}>
          <ClipboardList size={16} style={{ marginRight: '8px' }} /> Audit Log
        </div>
      </div>

      {/* ── Business Tab ── */}
      {activeTab === 'business' && (
        <div>
          <div className="card">
            <div className="card-header"><h3 className="card-title">Business Information</h3></div>
            <div className="form-group">
              <label className="form-label">Business Name</label>
              <input type="text" className="form-input" value={businessName} onChange={e => setBusinessName(e.target.value)} placeholder="e.g., McDonald's, KFC, Costco, Starbucks" />
            </div>
          </div>
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Business Locations</h3>
              <button className="btn btn-primary btn-sm" onClick={() => handleOpenLocationModal()}><Plus size={14} /> Add Location</button>
            </div>
            <div className="table-container">
              <table className="table">
                <thead><tr><th>Name</th><th>Address</th><th>Hours</th><th>Timezone</th><th>Actions</th></tr></thead>
                <tbody>
                  {businessLocations.length === 0 ? (
                    <tr><td colSpan={5} className="empty-state">No locations added</td></tr>
                  ) : (
                    businessLocations.map(loc => (
                      <tr key={loc.id}>
                        <td>{loc.name}</td><td>{loc.address}</td><td>{loc.hoursOfOperation}</td><td>{loc.timezone}</td>
                        <td>
                          <div className="actions-cell">
                            <button className="btn btn-secondary btn-sm" onClick={() => handleOpenLocationModal(loc)}>Edit</button>
                            <button className="btn btn-danger btn-sm" onClick={() => deleteBusinessLocation(loc.id)}><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Customize Tab ── */}
      {activeTab === 'customize' && (
        <div>
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Dismissal Reasons</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowDismissalModal(true)}><Plus size={14} /> Add</button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {dismissalReasons.map(reason => (
                <span key={reason} className="status-badge status-open" style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {reason}
                  <X size={14} style={{ cursor: 'pointer' }} onClick={() => setDismissalReasons(dismissalReasons.filter(r => r !== reason))} />
                </span>
              ))}
            </div>
          </div>
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Escalation Actions</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowEscalationModal(true)}><Plus size={14} /> Add</button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {escalationActions.map(action => (
                <span key={action} className="status-badge status-active" style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {action}
                  <X size={14} style={{ cursor: 'pointer' }} onClick={() => setEscalationActions(escalationActions.filter(a => a !== action))} />
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Cameras Tab ── */}
      {activeTab === 'cameras' && (
        <div>
          <div className="card" style={{ backgroundColor: 'var(--primary)', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <AlertCircle size={24} />
              <div>
                <div style={{ fontWeight: 500 }}>Camera Integration</div>
                <div style={{ fontSize: '12px', opacity: 0.8 }}>Compatible with Genetec, Milestone, and other VMS systems</div>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Camera Sources</h3>
              <button className="btn btn-primary btn-sm" onClick={() => handleOpenCameraModal()}><Plus size={14} /> Add Camera</button>
            </div>
            <div className="table-container">
              <table className="table">
                <thead><tr><th>Name</th><th>Type</th><th>URL</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {cameraSources.length === 0 ? (
                    <tr><td colSpan={5} className="empty-state">No camera sources configured.</td></tr>
                  ) : (
                    cameraSources.map(cam => (
                      <tr key={cam.id}>
                        <td>{cam.name}</td><td>{cam.type}</td>
                        <td style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cam.url}</td>
                        <td>
                          <span className={`status-badge status-${cam.status === 'online' ? 'active' : cam.status === 'maintenance' ? 'paused' : 'dismissed'}`}>{cam.status}</span>
                        </td>
                        <td>
                          <div className="actions-cell">
                            <button className="btn btn-secondary btn-sm" onClick={() => handleOpenCameraModal(cam)}>Edit</button>
                            <button className="btn btn-danger btn-sm" onClick={() => deleteCameraSource(cam.id)}><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Users Tab ── */}
      {activeTab === 'users' && (
        <div>
          {/* Change Password */}
          <div className="card">
            <div className="card-header"><h3 className="card-title">Change My Password</h3></div>
            <form onSubmit={handleChangePassword} style={{ maxWidth: '400px' }}>
              {pwError && <div style={{ color: 'var(--danger)', marginBottom: '12px', fontSize: '13px' }}>{pwError}</div>}
              {pwSuccess && <div style={{ color: 'var(--success)', marginBottom: '12px', fontSize: '13px' }}>{pwSuccess}</div>}
              {currentUser?.forcePasswordChange && (
                <div style={{ backgroundColor: 'rgba(236,201,75,0.15)', border: '1px solid var(--warning)', borderRadius: '4px', padding: '10px 12px', marginBottom: '12px', fontSize: '13px', color: 'var(--warning)' }}>
                  You are using the default password. Please change it now.
                </div>
              )}
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <div style={{ position: 'relative' }}>
                  <input type={showOldPw ? 'text' : 'password'} className="form-input" value={pwForm.oldPassword} onChange={e => setPwForm({ ...pwForm, oldPassword: e.target.value })} required style={{ paddingRight: '40px' }} />
                  <button type="button" onClick={() => setShowOldPw(v => !v)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                    {showOldPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <div style={{ position: 'relative' }}>
                  <input type={showNewPw ? 'text' : 'password'} className="form-input" value={pwForm.newPassword} onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })} required minLength={8} style={{ paddingRight: '40px' }} />
                  <button type="button" onClick={() => setShowNewPw(v => !v)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                    {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input type="password" className="form-input" value={pwForm.confirmPassword} onChange={e => setPwForm({ ...pwForm, confirmPassword: e.target.value })} required minLength={8} />
              </div>
              <button type="submit" className="btn btn-primary">Update Password</button>
            </form>
          </div>

          {/* User Management (admin only) */}
          {currentUser?.role === 'admin' && (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">User Management</h3>
                <button className="btn btn-primary btn-sm" onClick={() => setShowAddUserModal(true)}><Plus size={14} /> Add User</button>
              </div>
              <div className="table-container">
                <table className="table">
                  <thead><tr><th>Username</th><th>Role</th><th>Initials</th><th>Last Login</th><th>Actions</th></tr></thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id}>
                        <td>
                          {user.username}
                          {user.forcePasswordChange && <span className="status-badge status-escalated" style={{ marginLeft: '8px', fontSize: '10px' }}>default pw</span>}
                        </td>
                        <td><span className={`status-badge status-${user.role === 'admin' ? 'escalated' : user.role === 'manager' ? 'open' : 'active'}`}>{user.role}</span></td>
                        <td>{user.initials}</td>
                        <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                          {user.lastLogin ? format(new Date(user.lastLogin), 'MM/dd/yyyy HH:mm') : 'Never'}
                        </td>
                        <td>
                          <div className="actions-cell">
                            {user.id !== currentUser.id && (
                              <button className="btn btn-danger btn-sm" onClick={() => deleteUser(user.id)} title="Delete user">
                                <Trash2 size={14} />
                              </button>
                            )}
                            {user.id === currentUser.id && (
                              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>You</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Audit Log Tab ── */}
      {activeTab === 'audit' && (
        <div>
          <div className="search-bar">
            <input type="text" className="form-input search-input" placeholder="Filter by user, action, entity..." value={auditFilter} onChange={e => setAuditFilter(e.target.value)} />
            <button className="btn btn-secondary" onClick={exportAuditLog} disabled={filteredAudit.length === 0}>
              <Download size={16} /> Export CSV
            </button>
            {currentUser?.role === 'admin' && (
              <button className="btn btn-danger" onClick={() => { if (confirm('Clear all audit log entries?')) clearAuditLog(); }}>
                Clear Log
              </button>
            )}
          </div>
          <div className="card">
            <div className="table-container">
              <table className="table">
                <thead><tr><th>Timestamp</th><th>User</th><th>Action</th><th>Entity</th><th>Details</th></tr></thead>
                <tbody>
                  {filteredAudit.length === 0 ? (
                    <tr><td colSpan={5} className="empty-state">No audit log entries</td></tr>
                  ) : (
                    filteredAudit.map(entry => (
                      <tr key={entry.id}>
                        <td style={{ whiteSpace: 'nowrap', fontSize: '12px' }}>
                          {format(new Date(entry.timestamp), 'MM/dd/yyyy HH:mm:ss')}
                        </td>
                        <td>{entry.username}</td>
                        <td>
                          <span className={`status-badge status-${entry.action === 'deleted' ? 'dismissed' : entry.action === 'created' ? 'active' : entry.action === 'login_failed' ? 'escalated' : 'open'}`}>
                            {entry.action}
                          </span>
                        </td>
                        <td style={{ fontSize: '12px' }}>{entry.entityType}</td>
                        <td style={{ fontSize: '12px', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{entry.details}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Location Modal */}
      {showLocationModal && (
        <div className="modal-overlay" onClick={() => setShowLocationModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editingLocation ? 'Edit Location' : 'Add Location'}</h3>
              <button className="modal-close" onClick={() => setShowLocationModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmitLocation}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Location Name</label>
                  <input type="text" className="form-input" value={businessFormData.name} onChange={e => setBusinessFormData({ ...businessFormData, name: e.target.value })} placeholder="e.g., Store #1001" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Address</label>
                  <input type="text" className="form-input" value={businessFormData.address} onChange={e => setBusinessFormData({ ...businessFormData, address: e.target.value })} placeholder="123 Main St, City, State" required />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Hours of Operation</label>
                    <input type="text" className="form-input" value={businessFormData.hoursOfOperation} onChange={e => setBusinessFormData({ ...businessFormData, hoursOfOperation: e.target.value })} placeholder="e.g., 6AM - 11PM" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Timezone</label>
                    <select className="form-select" value={businessFormData.timezone} onChange={e => setBusinessFormData({ ...businessFormData, timezone: e.target.value })}>
                      <option value="America/New_York">Eastern</option>
                      <option value="America/Chicago">Central</option>
                      <option value="America/Denver">Mountain</option>
                      <option value="America/Los_Angeles">Pacific</option>
                      <option value="America/Phoenix">Arizona</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowLocationModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingLocation ? 'Update' : 'Add'} Location</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Camera Modal */}
      {showCameraModal && (
        <div className="modal-overlay" onClick={() => setShowCameraModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editingCamera ? 'Edit Camera' : 'Add Camera Source'}</h3>
              <button className="modal-close" onClick={() => setShowCameraModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmitCamera}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Camera Name</label>
                  <input type="text" className="form-input" value={cameraFormData.name} onChange={e => setCameraFormData({ ...cameraFormData, name: e.target.value })} placeholder="e.g., Front Entrance Cam 1" required />
                </div>
                <div className="form-group">
                  <label className="form-label">System Type</label>
                  <select className="form-select" value={cameraFormData.type} onChange={e => setCameraFormData({ ...cameraFormData, type: e.target.value })}>
                    <option value="Genetec">Genetec</option>
                    <option value="Milestone">Milestone</option>
                    <option value="Generic RTSP">Generic RTSP</option>
                    <option value="ONVIF">ONVIF</option>
                    <option value="Custom URL">Custom URL</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Connection URL</label>
                  <input type="text" className="form-input" value={cameraFormData.url} onChange={e => setCameraFormData({ ...cameraFormData, url: e.target.value })} placeholder="rtsp:// or http:// stream URL" />
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-select" value={cameraFormData.status} onChange={e => setCameraFormData({ ...cameraFormData, status: e.target.value as CameraSource['status'] })}>
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCameraModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingCamera ? 'Update' : 'Add'} Camera</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dismissal Reason Modal */}
      {showDismissalModal && (
        <div className="modal-overlay" onClick={() => setShowDismissalModal(false)}>
          <div className="modal" style={{ maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Add Dismissal Reason</h3>
              <button className="modal-close" onClick={() => setShowDismissalModal(false)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Reason</label>
                <input type="text" className="form-input" value={newDismissalReason} onChange={e => setNewDismissalReason(e.target.value)} placeholder="Enter dismissal reason..." />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShowDismissalModal(false)}>Cancel</button>
              <button type="button" className="btn btn-primary" onClick={() => {
                if (newDismissalReason && !dismissalReasons.includes(newDismissalReason)) {
                  setDismissalReasons([...dismissalReasons, newDismissalReason]);
                  setNewDismissalReason('');
                  setShowDismissalModal(false);
                }
              }}>Add Reason</button>
            </div>
          </div>
        </div>
      )}

      {/* Escalation Action Modal */}
      {showEscalationModal && (
        <div className="modal-overlay" onClick={() => setShowEscalationModal(false)}>
          <div className="modal" style={{ maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Add Escalation Action</h3>
              <button className="modal-close" onClick={() => setShowEscalationModal(false)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Action</label>
                <input type="text" className="form-input" value={newEscalationAction} onChange={e => setNewEscalationAction(e.target.value)} placeholder="e.g., Email, Call, Dispatch..." />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShowEscalationModal(false)}>Cancel</button>
              <button type="button" className="btn btn-primary" onClick={() => {
                if (newEscalationAction && !escalationActions.includes(newEscalationAction)) {
                  setEscalationActions([...escalationActions, newEscalationAction]);
                  setNewEscalationAction('');
                  setShowEscalationModal(false);
                }
              }}>Add Action</button>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="modal-overlay" onClick={() => setShowAddUserModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Add New User</h3>
              <button className="modal-close" onClick={() => setShowAddUserModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleAddUser}>
              <div className="modal-body">
                {newUserError && <div style={{ color: 'var(--danger)', marginBottom: '12px', fontSize: '13px' }}>{newUserError}</div>}
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Username</label>
                    <input type="text" className="form-input" value={newUserForm.username} onChange={e => setNewUserForm({ ...newUserForm, username: e.target.value })} required autoComplete="off" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Initials</label>
                    <input type="text" className="form-input" value={newUserForm.initials} onChange={e => setNewUserForm({ ...newUserForm, initials: e.target.value.toUpperCase().slice(0, 4) })} placeholder="e.g., JD" required maxLength={4} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <select className="form-select" value={newUserForm.role} onChange={e => setNewUserForm({ ...newUserForm, role: e.target.value as User['role'] })}>
                    <option value="analyst">Analyst</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Password (min 8 characters)</label>
                  <input type="password" className="form-input" value={newUserForm.password} onChange={e => setNewUserForm({ ...newUserForm, password: e.target.value })} required minLength={8} autoComplete="new-password" />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm Password</label>
                  <input type="password" className="form-input" value={newUserForm.confirmPassword} onChange={e => setNewUserForm({ ...newUserForm, confirmPassword: e.target.value })} required minLength={8} autoComplete="new-password" />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddUserModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary"><Plus size={16} /> Create User</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
