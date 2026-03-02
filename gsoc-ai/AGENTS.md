# GSOC AI - Development Guide

## Overview
GSOC AI is a Global Security Operations Center desktop application built with Tauri (Rust + React + TypeScript).

## Tech Stack
- **Framework:** Tauri v2
- **Frontend:** React 19 + TypeScript + Vite
- **UI:** Custom CSS with Lucide React icons
- **State:** React Context + localStorage

## Prerequisites

### For Development
```bash
# Install Node.js dependencies
cd gsoc-ai
npm install

# Run development server
npm run dev
```

### For Desktop Build (Windows/Mac)

#### Required System Dependencies

**macOS:**
```bash
# Using Homebrew
brew install gtk+3webkit
```

**Windows:**
- Install Visual Studio Build Tools with C++ support
- Install WebView2 Runtime

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get install libgtk-3-dev libsoup-3.0-dev libjavascriptcoregtk-4.1-dev libwebkitgtk-6.0-dev libgdk-pixbuf-2.0-dev libpango1.0-dev libatk1.0-dev libcairo2-dev libglib2.0-dev
```

**Install Rust:**
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
rustup default stable
```

## Build Commands

```bash
# Development (web server)
npm run dev

# Build frontend
npm run build

# Build desktop app
npm run tauri build

# Build for specific platform
npm run tauri build -- --target x86_64-pc-windows-msvc  # Windows
npm run tauri build -- --target aarch64-apple-darwin     # macOS ARM
npm run tauri build -- --target x86_64-apple-darwin      # macOS Intel
```

## Project Structure
```
gsoc-ai/
├── src/                    # React frontend source
│   ├── components/         # Reusable components
│   ├── pages/              # Page components
│   │   ├── TriageLog.tsx
│   │   ├── Monitoring.tsx
│   │   ├── ProtestTracker.tsx
│   │   ├── VoIP.tsx
│   │   ├── Documents.tsx
│   │   ├── Tools.tsx
│   │   └── Settings.tsx
│   ├── store/             # React Context
│   ├── types/             # TypeScript types
│   ├── App.tsx
│   └── main.tsx
├── src-tauri/             # Tauri/Rust backend
├── dist/                  # Built frontend
├── SPEC.md                # Detailed specification
└── package.json
```

## Features
- **TriageLog:** Incident management with customizable locations, dismissal reasons, escalation actions
- **Monitoring:** Business location monitoring with intervals and logging
- **Protest Tracker:** Track protests near business locations with timezone support
- **VoIP:** Softphone with status management, dial pad, quick connects, metrics
- **Documents:** Store templates and supervisor documents
- **Tools:** Timezone converter, Google Maps integration
- **Email Generation:** Customizable templates (Significant/General/Potential Impact)
- **Camera Integration:** Support for Genetec, Milestone, and other VMS systems
- **Settings:** Configure business name, locations, dismissal reasons, escalation actions

## Data Storage
All data is stored in localStorage. For production, consider adding a backend database.
