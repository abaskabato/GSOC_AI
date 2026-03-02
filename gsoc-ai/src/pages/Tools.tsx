import { useState } from 'react';
import { Globe, Map, ArrowRight, Clock } from 'lucide-react';

const TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Phoenix',
  'America/Anchorage',
  'Pacific/Honolulu',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Dubai',
  'Australia/Sydney',
];

export default function Tools() {
  const [fromTimezone, setFromTimezone] = useState('America/Los_Angeles');
  const [toTimezone, setToTimezone] = useState('America/New_York');
  const [fromTime, setFromTime] = useState('12:00');
  const [convertedTime, setConvertedTime] = useState('');
  const [mapSearch, setMapSearch] = useState('');

  const convertTime = () => {
    try {
      const [hours, minutes] = fromTime.split(':').map(Number);
      const now = new Date();
      const fromDate = new Date(now.toLocaleString('en-US', { timeZone: fromTimezone }));
      const toDate = new Date(now.toLocaleString('en-US', { timeZone: toTimezone }));
      
      const diff = toDate.getTime() - fromDate.getTime();
      const date = new Date();
      date.setHours(hours, minutes, 0, 0);
      date.setTime(date.getTime() + diff);
      
      setConvertedTime(date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        timeZone: toTimezone 
      }));
    } catch (e) {
      setConvertedTime('Invalid time');
    }
  };

  const getTimezoneAbbr = (tz: string) => {
    const abbrs: Record<string, string> = {
      'America/New_York': 'EST/EDT',
      'America/Chicago': 'CST/CDT',
      'America/Denver': 'MST/MDT',
      'America/Los_Angeles': 'PST/PDT',
      'America/Phoenix': 'MST',
      'America/Anchorage': 'AKST/AKDT',
      'Pacific/Honolulu': 'HST',
      'Europe/London': 'GMT/BST',
      'Europe/Paris': 'CET/CEST',
      'Europe/Berlin': 'CET/CEST',
      'Asia/Tokyo': 'JST',
      'Asia/Shanghai': 'CST',
      'Asia/Dubai': 'GST',
      'Australia/Sydney': 'AEST/AEDT',
    };
    return abbrs[tz] || tz.split('/').pop();
  };

  const handleMapSearch = () => {
    if (mapSearch) {
      window.open(`https://www.google.com/maps/search/${encodeURIComponent(mapSearch)}`, '_blank');
    }
  };

  return (
    <div className="tools-grid">
      <div className="card tool-card">
        <div className="card-header">
          <h3 className="card-title">
            <Clock size={20} style={{ marginRight: '8px' }} />
            Timezone Converter
          </h3>
        </div>

        <div className="form-group">
          <label className="form-label">From Timezone</label>
          <select
            className="form-select"
            value={fromTimezone}
            onChange={e => setFromTimezone(e.target.value)}
          >
            {TIMEZONES.map(tz => (
              <option key={tz} value={tz}>
                {tz.replace('_', ' ')} ({getTimezoneAbbr(tz)})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Time</label>
          <input
            type="time"
            className="form-input"
            value={fromTime}
            onChange={e => setFromTime(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', margin: '16px 0' }}>
          <ArrowRight size={24} />
        </div>

        <div className="form-group">
          <label className="form-label">To Timezone</label>
          <select
            className="form-select"
            value={toTimezone}
            onChange={e => setToTimezone(e.target.value)}
          >
            {TIMEZONES.map(tz => (
              <option key={tz} value={tz}>
                {tz.replace('_', ' ')} ({getTimezoneAbbr(tz)})
              </option>
            ))}
          </select>
        </div>

        <button className="btn btn-primary" onClick={convertTime} style={{ width: '100%', marginTop: '8px' }}>
          Convert
        </button>

        {convertedTime && (
          <div style={{ 
            marginTop: '16px', 
            padding: '16px', 
            backgroundColor: 'var(--bg)', 
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
              Converted Time
            </div>
            <div style={{ fontSize: '28px', fontWeight: 600, color: 'var(--accent)' }}>
              {convertedTime}
            </div>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              {getTimezoneAbbr(toTimezone)}
            </div>
          </div>
        )}
      </div>

      <div className="card tool-card">
        <div className="card-header">
          <h3 className="card-title">
            <Map size={20} style={{ marginRight: '8px' }} />
            Google Maps
          </h3>
        </div>

        <div className="form-group">
          <label className="form-label">Search Location</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              className="form-input"
              value={mapSearch}
              onChange={e => setMapSearch(e.target.value)}
              placeholder="Enter address or location..."
              onKeyDown={e => e.key === 'Enter' && handleMapSearch()}
            />
            <button className="btn btn-primary" onClick={handleMapSearch}>
              Search
            </button>
          </div>
        </div>

        <div className="map-container">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d26868.54321098765!2d-122.3321!3d47.6062!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sus!4v1234567890"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Google Maps"
          />
        </div>

        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '12px' }}>
          Click "Search" to open the location in a new Google Maps tab.
        </p>
      </div>
    </div>
  );
}
