# GSOC AI - Global Security Operation Center Application

## 1. Project Overview

**Project Name:** GSOC AI
**Type:** Desktop Application (Windows/Mac)
**Framework:** Tauri (Rust backend + React frontend)
**Core Summary:** A comprehensive security operations center application with AI-powered incident triage, monitoring, protest tracking, VoIP softphone, and email generation capabilities.
**Target Users:** Security operations center analysts, supervisors, and managers at retail chains (McDonald's, KFC, Costco, Starbucks, etc.)

---

## 2. UI/UX Specification

### 2.1 Layout Structure

**Multi-Window Model:**
- Main window with sidebar navigation
- Modal dialogs for forms and settings
- Native window controls (minimize, maximize, close)

**Major Layout Areas:**
- **Sidebar (Left):** 200px fixed width, navigation menu
- **Header:** 60px height, app title, user info, notifications
- **Main Content:** Flexible, scrollable content area
- **Status Bar (Bottom):** 32px, connection status, time

### 2.2 Visual Design

**Color Palette:**
- Primary: `#1E3A5F` (Deep Navy Blue)
- Secondary: `#2D5A87` (Steel Blue)
- Accent: `#00D4AA` (Teal/Cyan)
- Background: `#0D1B2A` (Dark Blue-Black)
- Surface: `#1B2838` (Dark Slate)
- Text Primary: `#FFFFFF`
- Text Secondary: `#A0AEC0`
- Success: `#48BB78`
- Warning: `#ECC94B`
- Danger: `#F56565`
- Info: `#4299E1`

**Typography:**
- Font Family: Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif
- Headings: 24px (H1), 20px (H2), 16px (H3), font-weight: 600
- Body: 14px, font-weight: 400
- Small: 12px, font-weight: 400

**Spacing System:**
- Base unit: 4px
- Margins: 16px (sm), 24px (md), 32px (lg)
- Padding: 8px (sm), 12px (md), 16px (lg)
- Border radius: 4px (sm), 8px (md), 12px (lg)

**Visual Effects:**
- Card shadows: `0 4px 6px rgba(0, 0, 0, 0.3)`
- Hover transitions: 150ms ease-in-out
- Active states: brightness(1.1)

### 2.3 Components

**Navigation Sidebar:**
- Logo/App name at top
- Nav items with icons: TriageLog, Monitoring, Protest Tracker, VoIP, Documents, Tools, Settings
- Active state: accent color left border, highlighted background

**Data Tables:**
- Sortable columns
- Row hover effect
- Pagination controls
- Search/filter bar

**Forms:**
- Labeled inputs with validation
- Dropdown selects for customizable fields
- Date/time pickers
- Text areas for notes

**Buttons:**
- Primary: Accent color background
- Secondary: Outlined
- Danger: Red for destructive actions
- States: hover, active, disabled

**Cards:**
- Surface background
- 8px border radius
- 16px padding
- Subtle shadow

---

## 3. Functional Specification

### 3.1 TriageLog Module

**Purpose:** Manage and triage security incidents

**Fields:**
- Timestamp (auto-generated, editable)
- Source (dropdown: Phone, Email, Camera, Patrol, Third-party, Other)
- Incident Details (free text)
- Affected Location (customizable per business - e.g., McDonald's store #123, KFC location NYC-01)
- Dismissal Reason (customizable per business - e.g., False Alarm, Non-urgent, Duplicate, Resolved Externally)
- Escalate Actions (customizable - e.g., Email Supervisor, Call Manager, Dispatch Security, Police)
- Notes (free text)
- Resolver Initials (text - H for Human, AI for AI-assisted)
- Hours of Operation (based on location settings)

**Actions:**
- Create new incident
- Edit existing incident
- Dismiss incident with reason
- Escalate with action
- Add notes
- Generate email (see Email Generation)
- Filter and search

### 3.2 Monitoring Module

**Purpose:** Track business locations being monitored

**Monitoring Request Form:**
- Business Location Status (dropdown: Active, Paused, Completed)
- Monitoring Requestor (text)
- Location (dropdown - links to business locations)
- Monitoring Interval (dropdown: Live, Every 30 min, Every 1 hr, Every 3 hr)
- Details/Justification (text area)
- Start Date/Time
- End Date/Time
- Requestor Contact (phone/email)

**Monitoring Log (auto-generated):**
- Interval for monitoring
- Time Checked
- Business Location/Store Name/Number
- Camera Status (dropdown: Online, Offline, No Signal, Maintenance)
- Observation (text)
- Initials (text)

### 3.3 Protest Tracker Module

**Purpose:** Track protests near business locations

**Fields:**
- Local Time of Software (auto-detected timezone, e.g., Seattle - PST)
- Date
- Local Time of Protest Location
- Event Name (text)
- City
- State
- Nearest Business Location (dropdown)
- Nearest 10 Locations (auto-generated list based on proximity)
- Notes
- Initials

**Features:**
- Auto-detect local timezone
- Geocoding for protest locations
- Distance calculation to business locations

### 3.4 VoIP Module

**Purpose:** Softphone for outbound calls

**Status Section:**
- Available
- Not Ready - Tech Issues
- Not Ready - Admin
- Not Ready - Project
- Not Ready - Outbound
- Not Ready - Training
- Not Ready - Coaching
- After Call Work
- Not Ready - Meeting
- Not Ready - Login
- Not Ready - Personal
- Not Ready - Lunch
- Not Ready - Break
- Offline

**Features:**
- Outbound Number input with dial pad
- Quick Connects (saved numbers)
- Tabs: Current, Quick Connects, Metrics, History (Inbound/Outbound), Settings
- Audio Settings: Speaker, Microphone, Ringer selection
- Audio Enhancement toggle
- Notification settings
- Language selection
- Logout
- Download Logs

### 3.5 Documents/Post Orders Module

**Purpose:** Store templates and documents for supervisors

**Features:**
- Upload documents (PDF, DOCX, images)
- Create/edit document templates
- Categories: Incident Rubrics, Procedures, Policies, Training Materials
- Version control
- Share with team

### 3.6 Tools Section

**Timezone Converter:**
- Convert between timezones
- Select from/to timezone
- Display converted time

**Google Maps Integration:**
- Embedded Google Maps iframe
- Search locations
- View business locations on map

### 3.7 Email Generation Module

**Purpose:** Generate incident notification emails

**Email Templates (customizable):**
- Significant Impact Email
- General Impact Email
- Potential Impact Email

**Features:**
- Template editor (rich text)
- Variable placeholders: {location}, {time}, {incident_details}, {resolver}
- Integration with Outlook (via mailto: protocol)
- Integration with other email clients
- Auto-populate from TriageLog data

### 3.8 Camera Integration

**Purpose:** Connect with camera systems

**Supported Systems:**
- Genetec
- Milestone
- Generic RTSP/ONVIF
- Custom URL integration

**Features:**
- Add camera sources
- View camera feeds (placeholder for integration)
- Camera status monitoring
- Quick view from TriageLog

### 3.9 Settings Module

**Business Configuration:**
- Business Name (e.g., McDonald's, KFC, Costco, Starbucks)
- Location naming convention
- Custom dismissal reasons
- Custom escalation actions
- Hours of operation per location

**User Settings:**
- User profile
- Default initials
- Notification preferences

---

## 4. Data Models

### 4.1 Incident
```typescript
interface Incident {
  id: string;
  timestamp: Date;
  source: string;
  details: string;
  affectedLocation: string;
  dismissalReason?: string;
  escalation?: {
    action: string;
    timestamp: Date;
  };
  notes: string;
  resolverInitials: string;
  hoursOfOperation: string;
  status: 'open' | 'dismissed' | 'escalated' | 'resolved';
}
```

### 4.2 MonitoringRequest
```typescript
interface MonitoringRequest {
  id: string;
  locationStatus: string;
  requestor: string;
  location: string;
  interval: 'live' | '30min' | '1hr' | '3hr';
  justification: string;
  startDateTime: Date;
  endDateTime: Date;
  requestorContact: string;
}
```

### 4.3 MonitoringLog
```typescript
interface MonitoringLog {
  id: string;
  requestId: string;
  interval: string;
  timeChecked: Date;
  locationName: string;
  cameraStatus: string;
  observation: string;
  initials: string;
}
```

### 4.4 Protest
```typescript
interface Protest {
  id: string;
  softwareLocalTime: Date;
  date: Date;
  protestLocalTime: Date;
  eventName: string;
  city: string;
  state: string;
  nearestLocation: string;
  nearestTenLocations: string[];
  notes: string;
  initials: string;
}
```

---

## 5. Acceptance Criteria

### 5.1 TriageLog
- [ ] Can create new incident with all fields
- [ ] Can edit existing incidents
- [ ] Can dismiss with customizable reasons
- [ ] Can escalate with actions
- [ ] Can add notes
- [ ] Filter and search works
- [ ] Email generation works

### 5.2 Monitoring
- [ ] Can create monitoring request
- [ ] Auto-generates monitoring log entries based on interval
- [ ] Can view all monitoring requests
- [ ] Can edit/delete requests

### 5.3 Protest Tracker
- [ ] Auto-detects local timezone
- [ ] Can add protest events
- [ ] Shows nearest business locations

### 5.4 VoIP
- [ ] Can set user status
- [ ] Dial pad works
- [ ] Quick connects can be saved
- [ ] Audio settings can be configured

### 5.5 Documents
- [ ] Can upload documents
- [ ] Can create templates

### 5.6 Tools
- [ ] Timezone converter works
- [ ] Google Maps loads

### 5.7 Email
- [ ] Templates are customizable
- [ ] Can generate email from incident
- [ ] Opens default email client

### 5.8 Camera
- [ ] Can add camera sources
- [ ] Shows camera status

### 5.9 General
- [ ] App launches without errors
- [ ] All navigation works
- [ ] Data persists (local storage/database)
- [ ] Responsive and performs well
