export interface Incident {
  id: string;
  timestamp: string;
  source: string;
  details: string;
  affectedLocation: string;
  dismissalReason?: string;
  escalation?: {
    action: string;
    timestamp: string;
  };
  notes: string;
  resolverInitials: string;
  hoursOfOperation: string;
  status: 'open' | 'dismissed' | 'escalated' | 'resolved';
}

export interface MonitoringRequest {
  id: string;
  locationStatus: string;
  requestor: string;
  location: string;
  interval: 'live' | '30min' | '1hr' | '3hr';
  justification: string;
  startDateTime: string;
  endDateTime: string;
  requestorContact: string;
}

export interface MonitoringLog {
  id: string;
  requestId: string;
  interval: string;
  timeChecked: string;
  locationName: string;
  cameraStatus: string;
  observation: string;
  initials: string;
}

export interface Protest {
  id: string;
  softwareLocalTime: string;
  date: string;
  protestLocalTime: string;
  eventName: string;
  city: string;
  state: string;
  nearestLocation: string;
  nearestTenLocations: string[];
  notes: string;
  initials: string;
}

export interface QuickConnect {
  id: string;
  name: string;
  number: string;
}

export interface Document {
  id: string;
  name: string;
  category: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
}

export interface BusinessLocation {
  id: string;
  name: string;
  address: string;
  hoursOfOperation: string;
  timezone: string;
}

export interface CameraSource {
  id: string;
  name: string;
  type: string;
  url: string;
  status: 'online' | 'offline' | 'maintenance';
}

export interface VoIPStatus {
  status: string;
  lastChange: string;
}
