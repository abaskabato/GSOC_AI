import { useState } from 'react';
import { useApp } from '../store/AppContext';
import { Building, Camera, X, Plus, Trash2, Settings as SettingsIcon, AlertCircle } from 'lucide-react';
import type { BusinessLocation, CameraSource } from '../types';

export default function Settings() {
  const {
    businessName,
    setBusinessName,
    businessLocations,
    addBusinessLocation,
    updateBusinessLocation,
    deleteBusinessLocation,
    dismissalReasons,
    setDismissalReasons,
    escalationActions,
    setEscalationActions,
    cameraSources,
    addCameraSource,
    updateCameraSource,
    deleteCameraSource,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'business' | 'customize' | 'cameras'>('business');
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [showDismissalModal, setShowDismissalModal] = useState(false);
  const [showEscalationModal, setShowEscalationModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState<typeof businessLocations[0] | null>(null);
  const [editingCamera, setEditingCamera] = useState<typeof cameraSources[0] | null>(null);
  const [newDismissalReason, setNewDismissalReason] = useState('');
  const [newEscalationAction, setNewEscalationAction] = useState('');
  const [businessFormData, setBusinessFormData] = useState({
    name: '',
    address: '',
    hoursOfOperation: '',
    timezone: 'America/Los_Angeles',
  });
  const [cameraFormData, setCameraFormData] = useState({
    name: '',
    type: 'Genetec',
    url: '',
    status: 'offline' as CameraSource['status'],
  });

  const resetLocationForm = () => {
    setBusinessFormData({ name: '', address: '', hoursOfOperation: '', timezone: 'America/Los_Angeles' });
    setEditingLocation(null);
  };

  const resetCameraForm = () => {
    setCameraFormData({ name: '', type: 'Genetec', url: '', status: 'offline' });
    setEditingCamera(null);
  };

  const handleOpenLocationModal = (loc?: BusinessLocation) => {
    if (loc) {
      setEditingLocation(loc);
      setBusinessFormData({
        name: loc.name,
        address: loc.address,
        hoursOfOperation: loc.hoursOfOperation,
        timezone: loc.timezone,
      });
    } else {
      resetLocationForm();
    }
    setShowLocationModal(true);
  };

  const handleOpenCameraModal = (cam?: CameraSource) => {
    if (cam) {
      setEditingCamera(cam);
      setCameraFormData({
        name: cam.name,
        type: cam.type,
        url: cam.url,
        status: cam.status as CameraSource['status'],
      });
    } else {
      resetCameraForm();
    }
    setShowCameraModal(true);
  };

  const handleSubmitLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingLocation) {
      updateBusinessLocation(editingLocation.id, businessFormData);
    } else {
      addBusinessLocation(businessFormData);
    }
    setShowLocationModal(false);
    resetLocationForm();
  };

  const handleSubmitCamera = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCamera) {
      updateCameraSource(editingCamera.id, cameraFormData);
    } else {
      addCameraSource(cameraFormData);
    }
    setShowCameraModal(false);
    resetCameraForm();
  };

  const handleAddDismissalReason = () => {
    if (newDismissalReason && !dismissalReasons.includes(newDismissalReason)) {
      setDismissalReasons([...dismissalReasons, newDismissalReason]);
      setNewDismissalReason('');
    }
  };

  const handleRemoveDismissalReason = (reason: string) => {
    setDismissalReasons(dismissalReasons.filter(r => r !== reason));
  };

  const handleAddEscalationAction = () => {
    if (newEscalationAction && !escalationActions.includes(newEscalationAction)) {
      setEscalationActions([...escalationActions, newEscalationAction]);
      setNewEscalationAction('');
    }
  };

  const handleRemoveEscalationAction = (action: string) => {
    setEscalationActions(escalationActions.filter(a => a !== action));
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
      </div>

      <div className="tabs">
        <div 
          className={`tab ${activeTab === 'business' ? 'active' : ''}`}
          onClick={() => setActiveTab('business')}
        >
          <Building size={16} style={{ marginRight: '8px' }} />
          Business & Locations
        </div>
        <div 
          className={`tab ${activeTab === 'customize' ? 'active' : ''}`}
          onClick={() => setActiveTab('customize')}
        >
          <SettingsIcon size={16} style={{ marginRight: '8px' }} />
          Customization
        </div>
        <div 
          className={`tab ${activeTab === 'cameras' ? 'active' : ''}`}
          onClick={() => setActiveTab('cameras')}
        >
          <Camera size={16} style={{ marginRight: '8px' }} />
          Camera Integration
        </div>
      </div>

      {activeTab === 'business' && (
        <div>
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Business Information</h3>
            </div>
            <div className="form-group">
              <label className="form-label">Business Name</label>
              <input
                type="text"
                className="form-input"
                value={businessName}
                onChange={e => setBusinessName(e.target.value)}
                placeholder="e.g., McDonald's, KFC, Costco, Starbucks"
              />
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Business Locations</h3>
              <button className="btn btn-primary btn-sm" onClick={() => handleOpenLocationModal()}>
                <Plus size={14} /> Add Location
              </button>
            </div>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Address</th>
                    <th>Hours</th>
                    <th>Timezone</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {businessLocations.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="empty-state">No locations added</td>
                    </tr>
                  ) : (
                    businessLocations.map(loc => (
                      <tr key={loc.id}>
                        <td>{loc.name}</td>
                        <td>{loc.address}</td>
                        <td>{loc.hoursOfOperation}</td>
                        <td>{loc.timezone}</td>
                        <td>
                          <div className="actions-cell">
                            <button 
                              className="btn btn-secondary btn-sm" 
                              onClick={() => handleOpenLocationModal(loc)}
                            >
                              Edit
                            </button>
                            <button 
                              className="btn btn-danger btn-sm" 
                              onClick={() => deleteBusinessLocation(loc.id)}
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
        </div>
      )}

      {activeTab === 'customize' && (
        <div>
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Dismissal Reasons</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowDismissalModal(true)}>
                <Plus size={14} /> Add
              </button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {dismissalReasons.map(reason => (
                <span 
                  key={reason} 
                  className="status-badge status-open"
                  style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  {reason}
                  <X 
                    size={14} 
                    style={{ cursor: 'pointer' }} 
                    onClick={() => handleRemoveDismissalReason(reason)}
                  />
                </span>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Escalation Actions</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowEscalationModal(true)}>
                <Plus size={14} /> Add
              </button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {escalationActions.map(action => (
                <span 
                  key={action} 
                  className="status-badge status-active"
                  style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  {action}
                  <X 
                    size={14} 
                    style={{ cursor: 'pointer' }} 
                    onClick={() => handleRemoveEscalationAction(action)}
                  />
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'cameras' && (
        <div>
          <div className="card" style={{ backgroundColor: 'var(--primary)', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <AlertCircle size={24} />
              <div>
                <div style={{ fontWeight: 500 }}>Camera Integration</div>
                <div style={{ fontSize: '12px', opacity: 0.8 }}>
                  Compatible with Genetec, Milestone, and other VMS systems
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Camera Sources</h3>
              <button className="btn btn-primary btn-sm" onClick={() => handleOpenCameraModal()}>
                <Plus size={14} /> Add Camera
              </button>
            </div>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Type</th>
                    <th>URL</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cameraSources.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="empty-state">
                        No camera sources configured. Add cameras to integrate with your VMS.
                      </td>
                    </tr>
                  ) : (
                    cameraSources.map(cam => (
                      <tr key={cam.id}>
                        <td>{cam.name}</td>
                        <td>{cam.type}</td>
                        <td style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {cam.url}
                        </td>
                        <td>
                          <span className={`status-badge status-${cam.status === 'online' ? 'active' : cam.status === 'maintenance' ? 'paused' : 'dismissed'}`}>
                            {cam.status}
                          </span>
                        </td>
                        <td>
                          <div className="actions-cell">
                            <button 
                              className="btn btn-secondary btn-sm" 
                              onClick={() => handleOpenCameraModal(cam)}
                            >
                              Edit
                            </button>
                            <button 
                              className="btn btn-danger btn-sm" 
                              onClick={() => deleteCameraSource(cam.id)}
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
        </div>
      )}

      {showLocationModal && (
        <div className="modal-overlay" onClick={() => setShowLocationModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editingLocation ? 'Edit Location' : 'Add Location'}</h3>
              <button className="modal-close" onClick={() => setShowLocationModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmitLocation}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Location Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={businessFormData.name}
                    onChange={e => setBusinessFormData({ ...businessFormData, name: e.target.value })}
                    placeholder="e.g., Store #1001"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Address</label>
                  <input
                    type="text"
                    className="form-input"
                    value={businessFormData.address}
                    onChange={e => setBusinessFormData({ ...businessFormData, address: e.target.value })}
                    placeholder="123 Main St, City, State"
                    required
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Hours of Operation</label>
                    <input
                      type="text"
                      className="form-input"
                      value={businessFormData.hoursOfOperation}
                      onChange={e => setBusinessFormData({ ...businessFormData, hoursOfOperation: e.target.value })}
                      placeholder="e.g., 6AM - 11PM"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Timezone</label>
                    <select
                      className="form-select"
                      value={businessFormData.timezone}
                      onChange={e => setBusinessFormData({ ...businessFormData, timezone: e.target.value })}
                    >
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
                <button type="button" className="btn btn-secondary" onClick={() => setShowLocationModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingLocation ? 'Update' : 'Add'} Location
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCameraModal && (
        <div className="modal-overlay" onClick={() => setShowCameraModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editingCamera ? 'Edit Camera' : 'Add Camera Source'}</h3>
              <button className="modal-close" onClick={() => setShowCameraModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmitCamera}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Camera Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={cameraFormData.name}
                    onChange={e => setCameraFormData({ ...cameraFormData, name: e.target.value })}
                    placeholder="e.g., Front Entrance Cam 1"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">System Type</label>
                  <select
                    className="form-select"
                    value={cameraFormData.type}
                    onChange={e => setCameraFormData({ ...cameraFormData, type: e.target.value })}
                  >
                    <option value="Genetec">Genetec</option>
                    <option value="Milestone">Milestone</option>
                    <option value="Generic RTSP">Generic RTSP</option>
                    <option value="ONVIF">ONVIF</option>
                    <option value="Custom URL">Custom URL</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Connection URL</label>
                  <input
                    type="text"
                    className="form-input"
                    value={cameraFormData.url}
                    onChange={e => setCameraFormData({ ...cameraFormData, url: e.target.value })}
                    placeholder="rtsp:// or http:// stream URL"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={cameraFormData.status}
                    onChange={e => setCameraFormData({ ...cameraFormData, status: e.target.value as 'online' | 'offline' | 'maintenance' })}
                  >
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCameraModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingCamera ? 'Update' : 'Add'} Camera
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDismissalModal && (
        <div className="modal-overlay" onClick={() => setShowDismissalModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Add Dismissal Reason</h3>
              <button className="modal-close" onClick={() => setShowDismissalModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Reason</label>
                <input
                  type="text"
                  className="form-input"
                  value={newDismissalReason}
                  onChange={e => setNewDismissalReason(e.target.value)}
                  placeholder="Enter dismissal reason..."
                />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShowDismissalModal(false)}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary" onClick={handleAddDismissalReason}>
                Add Reason
              </button>
            </div>
          </div>
        </div>
      )}

      {showEscalationModal && (
        <div className="modal-overlay" onClick={() => setShowEscalationModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Add Escalation Action</h3>
              <button className="modal-close" onClick={() => setShowEscalationModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Action</label>
                <input
                  type="text"
                  className="form-input"
                  value={newEscalationAction}
                  onChange={e => setNewEscalationAction(e.target.value)}
                  placeholder="e.g., Email, Call, Dispatch..."
                />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShowEscalationModal(false)}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary" onClick={handleAddEscalationAction}>
                Add Action
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
