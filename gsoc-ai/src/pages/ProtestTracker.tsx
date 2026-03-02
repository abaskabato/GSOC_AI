import { useState } from 'react';
import { useApp } from '../store/AppContext';
import { Plus, Search, Edit, Trash2, X, MapPin, Calendar, Clock, Globe } from 'lucide-react';
import { format } from 'date-fns';
import type { Protest } from '../types';

export default function ProtestTracker() {
  const {
    protests,
    addProtest,
    updateProtest,
    deleteProtest,
    businessLocations,
    localTimezone,
  } = useApp();

  const [showModal, setShowModal] = useState(false);
  const [editingProtest, setEditingProtest] = useState<Protest | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    softwareLocalTime: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    date: format(new Date(), 'yyyy-MM-dd'),
    protestLocalTime: '',
    eventName: '',
    city: '',
    state: '',
    nearestLocation: '',
    nearestTenLocations: [] as string[],
    notes: '',
    initials: '',
  });

  const resetForm = () => {
    setFormData({
      softwareLocalTime: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      date: format(new Date(), 'yyyy-MM-dd'),
      protestLocalTime: '',
      eventName: '',
      city: '',
      state: '',
      nearestLocation: '',
      nearestTenLocations: [],
      notes: '',
      initials: '',
    });
    setEditingProtest(null);
  };

  const handleOpenModal = (protest?: Protest) => {
    if (protest) {
      setEditingProtest(protest);
      setFormData({
        softwareLocalTime: protest.softwareLocalTime.slice(0, 16),
        date: protest.date,
        protestLocalTime: protest.protestLocalTime,
        eventName: protest.eventName,
        city: protest.city,
        state: protest.state,
        nearestLocation: protest.nearestLocation,
        nearestTenLocations: protest.nearestTenLocations,
        notes: protest.notes,
        initials: protest.initials,
      });
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const protestData: Omit<Protest, 'id'> = {
      softwareLocalTime: new Date(formData.softwareLocalTime).toISOString(),
      date: formData.date,
      protestLocalTime: formData.protestLocalTime,
      eventName: formData.eventName,
      city: formData.city,
      state: formData.state,
      nearestLocation: formData.nearestLocation,
      nearestTenLocations: businessLocations.slice(0, 10).map(l => l.name),
      notes: formData.notes,
      initials: formData.initials || 'AI',
    };

    if (editingProtest) {
      updateProtest(editingProtest.id, protestData);
    } else {
      addProtest(protestData);
    }

    setShowModal(false);
    resetForm();
  };

  const filteredProtests = protests.filter(protest => {
    return (
      protest.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      protest.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      protest.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
      protest.notes.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const getTimezoneAbbr = (tz: string) => {
    const zones: Record<string, string> = {
      'America/New_York': 'EST/EDT',
      'America/Chicago': 'CST/CDT',
      'America/Denver': 'MST/MDT',
      'America/Los_Angeles': 'PST/PDT',
    };
    return zones[tz] || tz.split('/').pop() || tz;
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Protest Tracker</h1>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={16} /> Add Protest Event
        </button>
      </div>

      <div className="card" style={{ marginBottom: '16px', backgroundColor: 'var(--primary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Globe size={20} />
            <span>Software Running In:</span>
            <strong>{localTimezone} ({getTimezoneAbbr(localTimezone)})</strong>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={20} />
            <span>Local Time:</span>
            <strong>{format(new Date(), 'PPpp')}</strong>
          </div>
        </div>
      </div>

      <div className="search-bar">
        <input
          type="text"
          className="form-input search-input"
          placeholder="Search protests..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Event Name</th>
                <th>Location</th>
                <th>Nearest Business</th>
                <th>Notes</th>
                <th>Initials</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProtests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="empty-state">No protest events recorded</td>
                </tr>
              ) : (
                filteredProtests.map(protest => (
                  <tr key={protest.id}>
                    <td>{format(new Date(protest.date), 'MM/dd/yyyy')}</td>
                    <td>{protest.eventName}</td>
                    <td>
                      <div>{protest.city}, {protest.state}</div>
                      {protest.protestLocalTime && (
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                          Protest time: {protest.protestLocalTime}
                        </div>
                      )}
                    </td>
                    <td>{protest.nearestLocation || 'Not specified'}</td>
                    <td style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {protest.notes}
                    </td>
                    <td>{protest.initials}</td>
                    <td>
                      <div className="actions-cell">
                        <button 
                          className="btn btn-secondary btn-sm" 
                          onClick={() => handleOpenModal(protest)}
                          title="Edit"
                        >
                          <Edit size={14} />
                        </button>
                        <button 
                          className="btn btn-danger btn-sm" 
                          onClick={() => deleteProtest(protest.id)}
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
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '700px' }}>
            <div className="modal-header">
              <h3 className="modal-title">{editingProtest ? 'Edit Protest' : 'Add Protest Event'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={formData.date}
                      onChange={e => setFormData({ ...formData, date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Protest Local Time</label>
                    <input
                      type="time"
                      className="form-input"
                      value={formData.protestLocalTime}
                      onChange={e => setFormData({ ...formData, protestLocalTime: e.target.value })}
                      placeholder="e.g., 14:00"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Event Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.eventName}
                    onChange={e => setFormData({ ...formData, eventName: e.target.value })}
                    placeholder="e.g., Peaceful Protest, March, Rally"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">City</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.city}
                      onChange={e => setFormData({ ...formData, city: e.target.value })}
                      placeholder="e.g., Seattle"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">State</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.state}
                      onChange={e => setFormData({ ...formData, state: e.target.value })}
                      placeholder="e.g., WA"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Nearest Business Location</label>
                  <select
                    className="form-select"
                    value={formData.nearestLocation}
                    onChange={e => setFormData({ ...formData, nearestLocation: e.target.value })}
                  >
                    <option value="">Select nearest location...</option>
                    {businessLocations.map(loc => (
                      <option key={loc.id} value={loc.name}>{loc.name} - {loc.address}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Nearest 10 Locations (Auto-generated)</label>
                  <div style={{ 
                    backgroundColor: 'var(--bg)', 
                    padding: '12px', 
                    borderRadius: '4px',
                    fontSize: '12px',
                    color: 'var(--text-secondary)'
                  }}>
                    {businessLocations.length > 0 ? (
                      businessLocations.slice(0, 10).map((loc, i) => (
                        <div key={loc.id}>{i + 1}. {loc.name} - {loc.address}</div>
                      ))
                    ) : (
                      <em>No business locations configured. Add locations in Settings.</em>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <textarea
                    className="form-textarea"
                    value={formData.notes}
                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Additional notes about the protest event..."
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Initials</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.initials}
                    onChange={e => setFormData({ ...formData, initials: e.target.value })}
                    placeholder="H for Human, AI for AI"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingProtest ? 'Update' : 'Add'} Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
