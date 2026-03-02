# GSOC AI

Global Security Operations Center (GSOC) desktop application with AI-powered incident management, monitoring, and threat intelligence integration.

## Features

### Core Modules

- **TriageLog** - Incident management with customizable locations, dismissal reasons, escalation actions, and email generation
- **Monitoring** - Business location monitoring with configurable intervals (Live, 30min, 1hr, 3hr) and camera status tracking
- **Protest Tracker** - Track protests near business locations with timezone support and nearest location mapping
- **VoIP** - Softphone with status management, dial pad, quick connects, metrics, and call history
- **Documents** - Store templates, incident rubrics, and supervisor documents
- **Tools** - Timezone converter and Google Maps integration
- **Integrations** - Connect with 30+ industry-standard security systems
- **Settings** - Configure business name, locations, dismissal reasons, and escalation actions

### Integrations Supported

**Threat Intelligence:**
- Dataminr, Recorded Future, CrowdStrike, Mandiant, Anomali

**SIEM & SOAR:**
- Splunk, QRadar, Elastic SIEM, Microsoft Sentinel, Splunk SOAR, Demisto

**Video Management:**
- Genetec, Milestone, Avigilon, Hikvision, Axis

**Access Control:**
- Lenel, HID, ASSA ABLOY

**Communication:**
- Email (IMAP), Slack, Microsoft Teams, Webex

**Other:**
- Webhook Receiver, RSS Feed, Generic API

### Email Templates

- Significant Impact Email
- General Impact Email
- Potential Impact Email

Customizable with variables: `{location}`, `{time}`, `{details}`, `{resolver}`

## Tech Stack

- **Framework:** Tauri v2 (Rust backend)
- **Frontend:** React 19 + TypeScript + Vite
- **UI:** Custom CSS with Lucide React icons
- **State:** React Context + localStorage

## Getting Started

### Prerequisites

- Node.js 18+
- Rust (for desktop builds)

### Installation

```bash
# Clone the repository
git clone https://github.com/abaskabato/GSOC_AI.git
cd GSOC_AI/gsoc-ai

# Install dependencies
npm install

# Run development server
npm run dev
```

### Building Desktop App

#### macOS
```bash
brew install create-dmg
npm run tauri build
```

#### Windows
- Install Visual Studio Build Tools with C++ support
- Install WebView2 Runtime
```bash
npm run tauri build
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt-get install libgtk-3-dev libsoup-3.0-dev libjavascriptcoregtk-4.1-dev libwebkitgtk-6.0-dev
npm run tauri build
```

## Project Structure

```
gsoc-ai/
├── src/
│   ├── pages/
│   │   ├── TriageLog.tsx      # Incident management
│   │   ├── Monitoring.tsx      # Location monitoring
│   │   ├── ProtestTracker.tsx  # Protest tracking
│   │   ├── VoIP.tsx           # Softphone
│   │   ├── Documents.tsx       # Document templates
│   │   ├── Tools.tsx          # Timezone & Maps
│   │   ├── Integrations.tsx    # 30+ integrations
│   │   └── Settings.tsx       # Configuration
│   ├── store/
│   │   └── AppContext.tsx     # State management
│   ├── types/
│   │   └── index.ts           # TypeScript types
│   ├── App.tsx
│   └── main.tsx
├── src-tauri/                  # Tauri/Rust backend
├── SPEC.md                     # Detailed specification
└── package.json
```

## Configuration

### Business Setup

1. Go to **Settings**
2. Set your business name (e.g., McDonald's, KFC, Costco, Starbucks)
3. Add business locations with addresses and hours of operation
4. Customize dismissal reasons and escalation actions

### Integration Setup

1. Go to **Integrations**
2. Click on an integration to configure
3. Enter API credentials and endpoint URLs
4. Enable auto-polling and set interval
5. Toggle auto-create incidents

## License

MIT
