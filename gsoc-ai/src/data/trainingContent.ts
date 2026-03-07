export interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export type ContentBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'steps'; title?: string; items: string[] }
  | { type: 'tip'; text: string }
  | { type: 'warning'; text: string }
  | { type: 'definition'; term: string; text: string }
  | { type: 'quiz'; questions: QuizQuestion[] };

export interface Lesson {
  id: string;
  title: string;
  readTime: string;
  content: ContentBlock[];
}

export interface TrainingModule {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  color: string;
  lessons: Lesson[];
}

export const MODULES: TrainingModule[] = [
  {
    id: 'orientation',
    number: 1,
    title: 'Platform Overview',
    subtitle: 'Your command center, explained',
    color: '#6366f1',
    lessons: [
      {
        id: 'what-is-gsoc',
        title: 'What Is GSOC AI?',
        readTime: '3 min',
        content: [
          { type: 'paragraph', text: 'GSOC AI is a desktop security operations platform designed for retail and enterprise physical security teams. It centralises incident management, threat intelligence, monitoring, and communications into a single application that analysts use on shift.' },
          { type: 'definition', term: 'GSOC', text: 'Global Security Operations Center — a centralised team responsible for monitoring physical and digital threats to business locations around the clock.' },
          { type: 'steps', title: 'The eight core modules are:', items: [
            'TriageLog — log, categorise, and resolve every incident',
            'Monitoring — track business locations at configurable intervals',
            'Civil Unrest Log — record civil events near your locations',
            'VoIP — make and receive calls without leaving the app',
            'Documents — store SOPs, rubrics, and templates',
            'Tools — timezone converter and maps',
            'Integrations — connect Factal, Dataminr, X, Splunk, and 30+ platforms',
            'Settings — configure your organisation',
          ]},
          { type: 'tip', text: 'Every action you take is recorded in the immutable Audit Log (Settings → Audit Log). This is your legal paper trail — treat every entry as if an attorney might read it.' },
          { type: 'quiz', questions: [
            { question: 'What does GSOC stand for?', options: ['General Security Operations Command', 'Global Security Operations Center', 'Government Security Operations Control', 'Ground Security Operations Center'], correct: 1, explanation: 'GSOC stands for Global Security Operations Center — the centralised hub for all physical security monitoring.' },
            { question: 'Where can you find a record of every action taken in the app?', options: ['TriageLog', 'Documents', 'Settings → Audit Log', 'Integrations → Poll Log'], correct: 2, explanation: 'The Audit Log under Settings captures every create, update, delete, and export action with timestamps and usernames.' },
          ]},
        ],
      },
      {
        id: 'navigating',
        title: 'Navigating the Interface',
        readTime: '4 min',
        content: [
          { type: 'paragraph', text: 'The left sidebar is your primary navigation. It persists across all screens so you can jump between modules mid-incident without losing context. The header shows the current user, their role, and the local time.' },
          { type: 'steps', title: 'Key interface patterns to know:', items: [
            'Status badges — coloured pills that communicate state at a glance (open = blue, escalated = amber, resolved = green, dismissed = grey)',
            'Action buttons — always in the top-right of a card or in the Actions column of tables',
            'Modals — forms open in overlay modals; pressing Escape or clicking outside closes them without saving',
            'CSV Export — available on TriageLog and Audit Log; always exports your current filtered view',
          ]},
          { type: 'warning', text: 'Role matters. Admin users can add/delete other users and clear the audit log. Analyst users cannot. If you need elevated access, contact your system administrator.' },
          { type: 'tip', text: 'The default password for new accounts is set by whoever created your account. You will see a "Change default password" banner in the header until you update it in Settings → Users.' },
          { type: 'quiz', questions: [
            { question: 'What colour is the status badge for an escalated incident?', options: ['Green', 'Blue', 'Grey', 'Amber/Yellow'], correct: 3, explanation: 'Escalated incidents show an amber/yellow badge to draw attention. Green = resolved, blue = open, grey = dismissed.' },
            { question: 'How do you close a modal without saving?', options: ['Press Tab', 'Press Escape or click outside the modal', 'Press Delete', 'Press F5'], correct: 1, explanation: 'All modals can be dismissed by pressing Escape or clicking the dark overlay behind the modal. The X button in the header also works.' },
          ]},
        ],
      },
    ],
  },
  {
    id: 'triage',
    number: 2,
    title: 'Incident Triage',
    subtitle: 'Log it, classify it, resolve it',
    color: '#ef4444',
    lessons: [
      {
        id: 'first-incident',
        title: 'Logging Your First Incident',
        readTime: '5 min',
        content: [
          { type: 'paragraph', text: 'The TriageLog is the heart of GSOC AI. Every security event — whether a phone call from a store, a camera alert, or an automated feed — becomes an incident here. The goal is to create a factual, timestamped record that can be reviewed, exported, or escalated.' },
          { type: 'steps', title: 'To create an incident:', items: [
            'Click "New Incident" in the top-right of TriageLog',
            'Set the timestamp — defaults to now; adjust if the event happened earlier',
            'Select the source (Phone, Email, Camera, Patrol, Third-party, X/Social Media, Other)',
            'Choose the affected location from your configured business locations',
            'Write clear, factual incident details — who, what, where, when',
            'Enter your initials in "Resolver Initials" (e.g., your badge number or name initials)',
            'Set status: Open (default), Dismissed, Escalated, or Resolved',
            'Click "Create Incident"',
          ]},
          { type: 'definition', term: 'Resolver Initials', text: 'The initials or identifier of the analyst who owns this incident. If AI triage auto-creates an incident, it is stamped "AI". Human-handled incidents should always have your initials.' },
          { type: 'tip', text: 'Write incident details as facts, not opinions. "Caller reported a male subject shouting at staff near the entrance at 14:23" is better than "Angry customer at store." The first version is legally defensible; the second is not.' },
          { type: 'quiz', questions: [
            { question: 'Which field identifies who is responsible for an incident?', options: ['Affected Location', 'Resolver Initials', 'Dismissal Reason', 'Hours of Operation'], correct: 1, explanation: 'Resolver Initials is the field that tracks who owns the incident. Always fill this in — the audit trail depends on it.' },
            { question: 'A store manager calls in a slip-and-fall injury. What source should you select?', options: ['Camera', 'Patrol', 'Phone', 'Email'], correct: 2, explanation: 'The call came in via phone, so the source is "Phone" regardless of where the injury occurred.' },
          ]},
        ],
      },
      {
        id: 'status-management',
        title: 'Dismissal, Escalation & Resolution',
        readTime: '5 min',
        content: [
          { type: 'paragraph', text: 'Every incident must reach a final status. An incident sitting as "Open" forever is a failure of process. The four statuses represent four distinct outcomes.' },
          { type: 'steps', title: 'The four statuses explained:', items: [
            'Open — active, unresolved; requires action',
            'Dismissed — reviewed and determined to require no further action (must select a dismissal reason)',
            'Escalated — routed to higher authority or emergency services; triggers Slack/AlertMedia notifications if configured',
            'Resolved — handled at the analyst level with no further escalation needed',
          ]},
          { type: 'warning', text: 'Never dismiss an incident with a vague reason like "no action needed." Always select the most accurate dismissal reason (False Alarm, Non-Urgent, Duplicate, Resolved Externally). Audit teams review these.' },
          { type: 'tip', text: 'The quick Dismiss and Escalate buttons in the Actions column let you act without opening the full edit modal. Use these during high-volume periods to process incidents faster.' },
          { type: 'quiz', questions: [
            { question: 'A store camera shows a bag left unattended. Police are called. What status should the incident have?', options: ['Open', 'Dismissed', 'Escalated', 'Resolved'], correct: 2, explanation: 'Any incident routed to emergency services should be Escalated. This triggers relevant notifications and tracks that an external authority was involved.' },
            { question: 'A caller reports a fire alarm but the store confirms it was a false activation. What dismissal reason fits?', options: ['Non-Urgent', 'False Alarm', 'Duplicate', 'Resolved Externally'], correct: 1, explanation: 'A confirmed false activation is a False Alarm — the event was not a genuine threat.' },
          ]},
        ],
      },
    ],
  },
  {
    id: 'ai-triage',
    number: 3,
    title: 'AI-Assisted Analysis',
    subtitle: 'Let Claude do the heavy lifting',
    color: '#8b5cf6',
    lessons: [
      {
        id: 'how-ai-works',
        title: 'How AI Triage Works',
        readTime: '4 min',
        content: [
          { type: 'paragraph', text: 'GSOC AI uses Anthropic\'s Claude model to analyse incident details and recommend a course of action. The AI reads the incident text, the source, and the affected location, then returns a structured assessment.' },
          { type: 'steps', title: 'The AI returns five outputs:', items: [
            'Severity — low, medium, high, or critical',
            'Suggested status — open, dismissed, escalated, or resolved',
            'Suggested dismissal reason — if dismissal is recommended',
            'Suggested escalation action — if escalation is recommended',
            'Summary — a one-sentence plain-English description',
          ]},
          { type: 'definition', term: 'AI Triage', text: 'The Sparkles (✦) button on each incident row sends the incident to Claude for analysis. Results appear in a modal with an "Apply Suggestions" button.' },
          { type: 'tip', text: 'AI triage requires your Anthropic API key to be set in Settings → API Keys. Without it, the button will display an error pointing you to the settings page.' },
          { type: 'warning', text: 'AI suggestions are advisory, not authoritative. You are the analyst. The AI may misclassify incidents with unusual phrasing, missing context, or ambiguous locations. Always review before applying.' },
          { type: 'quiz', questions: [
            { question: 'Where do you configure your Anthropic API key?', options: ['Integrations page', 'Settings → API Keys', 'TriageLog → New Incident', 'Settings → License'], correct: 1, explanation: 'API keys for Claude and Slack are configured under Settings → API Keys tab.' },
            { question: 'Should you always click "Apply Suggestions" when AI triage returns a result?', options: ['Yes, the AI is always correct', 'No — review the recommendation before applying', 'Only if the severity is critical', 'Only if you agree with the summary'], correct: 1, explanation: 'AI suggestions must be reviewed by a human analyst before applying. The AI can be wrong, especially with incomplete incident details.' },
          ]},
        ],
      },
    ],
  },
  {
    id: 'monitoring',
    number: 4,
    title: 'Monitoring & Cameras',
    subtitle: 'Eyes on your locations',
    color: '#06b6d4',
    lessons: [
      {
        id: 'monitoring-requests',
        title: 'Monitoring Requests',
        readTime: '4 min',
        content: [
          { type: 'paragraph', text: 'A Monitoring Request is a formal instruction to check on a business location at a defined interval. Requests are created by a requestor (a store manager, LP team, etc.) and fulfilled by GSOC analysts on shift.' },
          { type: 'steps', title: 'Creating a monitoring request:', items: [
            'Go to Monitoring → click "New Request"',
            'Enter the requestor name and contact information',
            'Select the location and set start/end date-times',
            'Choose interval: Live (continuous), 30 min, 1 hr, or 3 hr',
            'Write a justification (e.g., "High-theft period post-holiday")',
            'Click Create',
          ]},
          { type: 'steps', title: 'Logging a check:', items: [
            'Click the Eye (👁) icon on the monitoring request row',
            'Record camera status (Online, Offline, Degraded, Maintenance)',
            'Write your observation (e.g., "No activity observed. All cameras operational.")',
            'Enter your initials and save',
          ]},
          { type: 'tip', text: 'Monitoring logs are exportable to CSV and become key evidence if an incident occurs during a monitored period. Be specific in your observations — "quiet" is not a useful log entry.' },
          { type: 'quiz', questions: [
            { question: 'What does the "interval" field on a monitoring request control?', options: ['How long to monitor before stopping', 'How frequently an analyst checks the location', 'How many cameras to review', 'The time zone for the check'], correct: 1, explanation: 'Interval defines how often the analyst must log a check — e.g., every 30 minutes or every hour.' },
          ]},
        ],
      },
      {
        id: 'cameras',
        title: 'Camera Management',
        readTime: '3 min',
        content: [
          { type: 'paragraph', text: 'Camera sources can be added manually in Settings → Cameras or synced automatically from Genetec or Milestone if those integrations are configured. Each camera has a name, type, URL, and status.' },
          { type: 'definition', term: 'Camera URL', text: 'The stream URL for a camera — typically an HTTP MJPEG stream, RTSP, or a VMS web portal link. Genetec and Milestone integrations auto-populate these from the VMS server.' },
          { type: 'warning', text: 'RTSP streams cannot be rendered directly in the app. For live camera viewing, configure your VMS web portal URL or an HTTP transcoder URL. The "Open stream" button (external link icon) opens the URL in your system browser.' },
          { type: 'tip', text: 'Mark cameras as "Offline" or "Maintenance" in Settings → Cameras so monitoring logs accurately reflect camera availability during each check.' },
          { type: 'quiz', questions: [
            { question: 'Why do RTSP camera streams not display inside GSOC AI?', options: ['The app does not support video', 'RTSP cannot be rendered in a web-based view without a transcoding proxy', 'Cameras must be Genetec only', 'You need a Pro license'], correct: 1, explanation: 'The app\'s rendering engine cannot play raw RTSP. Use HTTP MJPEG streams, HLS URLs, or your VMS web portal links instead.' },
          ]},
        ],
      },
    ],
  },
  {
    id: 'intel',
    number: 5,
    title: 'Threat Intelligence',
    subtitle: 'Signals before incidents happen',
    color: '#f59e0b',
    lessons: [
      {
        id: 'intel-feeds',
        title: 'Connecting Intel Feeds',
        readTime: '5 min',
        content: [
          { type: 'paragraph', text: 'Threat intelligence integrations automatically monitor the world for events near your business locations and create TriageLog incidents when a match is found. This eliminates the need for analysts to manually monitor news feeds or social media.' },
          { type: 'steps', title: 'Setting up auto-ingest:', items: [
            'Go to Integrations and click the feed you want (e.g., Factal)',
            'Enter your API credentials and geo-match radius (50 km is a typical starting point)',
            'Click "Add Integration"',
            'Return to the Integrations page and click "Start Polling"',
            'Enable "Auto-create incidents" to have matched alerts appear in TriageLog automatically',
          ]},
          { type: 'definition', term: 'Geo-match Radius', text: 'The maximum distance (in km) from one of your business locations that an alert must be within to generate an incident. Set too wide and you get noise; too narrow and you miss nearby threats.' },
          { type: 'tip', text: 'Factal is a human-verified feed with very low false-positive rates — good for critical alerts. Dataminr and X (social media) feeds have higher volume and more noise. Start polling Factal first before enabling social media feeds.' },
          { type: 'quiz', questions: [
            { question: 'What does geo-match radius control?', options: ['How fast the app polls', 'How many incidents to show', 'The maximum distance from your locations for an alert to create an incident', 'The AI confidence threshold'], correct: 2, explanation: 'Geo-match radius filters alerts by proximity to your business locations. Only alerts within this distance generate incidents.' },
          ]},
        ],
      },
      {
        id: 'x-feed',
        title: 'X (Social Media) Monitoring',
        readTime: '4 min',
        content: [
          { type: 'paragraph', text: 'The X integration polls the X (Twitter) API v2 for recent tweets matching keywords you define. This surfaces real-time public safety signals — people posting about incidents near your stores before official channels report them.' },
          { type: 'steps', title: 'Configure the X integration:', items: [
            'Get an X Developer account at developer.twitter.com and create a project',
            'Copy your Bearer Token (Project → Keys and Tokens → Bearer Token)',
            'In Integrations, click the X icon under Social Media Intelligence',
            'Paste the Bearer Token',
            'Enter monitoring keywords: e.g., "robbery,shooting,fight,suspect" or location-specific terms like your city names',
            'Set language to "en" (or blank for all languages)',
            'Set geo-match radius — 25–50 km is typical for social media signals',
          ]},
          { type: 'warning', text: 'High-volume keywords like "fight" or "police" will generate significant noise in dense urban areas. Start with 3–5 specific keywords and expand over time. Review auto-created incidents frequently and dismiss false positives to calibrate your keyword list.' },
          { type: 'tip', text: 'Effective keyword sets combine generic terms ("shooting near [city]") with brand-specific terms ("shooting near [your store name]"). Social media posts often tag locations by neighbourhood or street rather than exact address — account for this.' },
          { type: 'definition', term: 'Bearer Token', text: 'A server-side authentication credential for the X API. It grants read-only access to public tweets. Never share this token — it has rate limits tied to your X developer account.' },
          { type: 'quiz', questions: [
            { question: 'Why should you start with a small, specific keyword list for the X feed?', options: ['X API requires fewer than 5 keywords', 'Broad keywords generate high noise volumes in urban areas', 'The app limits keywords to 5', 'Social media posts never mention crime'], correct: 1, explanation: 'Generic keywords in urban environments will create hundreds of false-positive incidents. Start narrow and refine based on what you see.' },
            { question: 'Where do you find your X Bearer Token?', options: ['GSOC AI Settings → API Keys', 'developer.twitter.com → Project → Keys and Tokens', 'gsocai.vercel.app', 'Settings → License'], correct: 1, explanation: 'The Bearer Token is generated from your X Developer account at developer.twitter.com under your Project\'s Keys and Tokens section.' },
          ]},
        ],
      },
    ],
  },
  {
    id: 'escalation',
    number: 6,
    title: 'Escalation Protocols',
    subtitle: 'When and how to escalate',
    color: '#ef4444',
    lessons: [
      {
        id: 'when-to-escalate',
        title: 'When to Escalate',
        readTime: '4 min',
        content: [
          { type: 'paragraph', text: 'Escalation is the act of routing an incident to a higher authority — law enforcement, emergency services, a supervisor, or security dispatch. Knowing when to escalate is a core GSOC skill. Escalating too late is dangerous; escalating for every minor event wastes resources and erodes trust.' },
          { type: 'steps', title: 'Escalate immediately when:', items: [
            'There is an imminent threat to life (active violence, medical emergency, fire)',
            'A crime is in progress',
            'You cannot resolve the situation with available resources',
            'A supervisor or policy requires escalation for the incident type',
            'An automated feed has flagged a critical-severity alert near a location',
          ]},
          { type: 'steps', title: 'Do not escalate when:', items: [
            'The incident can be resolved at store level (minor dispute, nuisance behaviour)',
            'The event has already concluded with no ongoing risk',
            'The report is unverified and there is no corroborating evidence',
          ]},
          { type: 'warning', text: 'Document your escalation decision in the incident notes — whether you escalate or not. "Decided not to escalate — caller confirmed situation resolved and subject left the premises" is a complete note. Blank notes are not.' },
          { type: 'quiz', questions: [
            { question: 'A store manager reports a shoplifter left the store and is no longer on premises. Should you escalate?', options: ['Yes, always escalate theft', 'No — the threat is no longer active', 'Only if the value exceeds $500', 'Yes, contact police immediately'], correct: 1, explanation: 'If the subject has left and there is no ongoing threat, escalation is typically not required. Resolve the incident and document the details. Follow your organisation\'s specific policy.' },
          ]},
        ],
      },
      {
        id: 'mass-notifications',
        title: 'Mass Notifications',
        readTime: '3 min',
        content: [
          { type: 'paragraph', text: 'When you escalate an incident in GSOC AI, automated notifications can fire simultaneously to multiple channels — Slack, AlertMedia (SMS/push to all employees), and Everbridge. This is the "one click to alert everyone" capability.' },
          { type: 'steps', title: 'Notifications trigger automatically on escalation when configured:', items: [
            'Slack — posts to your configured channel with incident ID, location, details, and escalation action',
            'AlertMedia — sends SMS, email, and push to target employee groups at the affected location',
            'Everbridge — sends to your CEM platform\'s distribution list',
            'Splunk / Sentinel — the incident is pushed to your SIEM index for correlation',
          ]},
          { type: 'tip', text: 'Test your notification stack before a real incident. Go to Integrations, add your AlertMedia or Slack integration, then create a test incident and escalate it. Verify the notification was received before relying on it operationally.' },
          { type: 'quiz', questions: [
            { question: 'What action in GSOC AI triggers AlertMedia and Slack notifications?', options: ['Creating a new incident', 'Dismissing an incident', 'Escalating an incident', 'Exporting to CSV'], correct: 2, explanation: 'Notifications fire when an incident status is set to Escalated — either via the quick Escalate button or by updating status in the edit modal.' },
          ]},
        ],
      },
    ],
  },
  {
    id: 'voip',
    number: 7,
    title: 'VoIP & Communications',
    subtitle: 'Calls managed from your console',
    color: '#10b981',
    lessons: [
      {
        id: 'softphone-basics',
        title: 'Softphone Basics',
        readTime: '3 min',
        content: [
          { type: 'paragraph', text: 'The VoIP module is a full softphone powered by Twilio. When connected, you can make and receive calls directly inside GSOC AI without picking up a physical phone. All calls are logged in Call History.' },
          { type: 'definition', term: 'Simulation Mode', text: 'If VoIP is not yet activated on your plan, the softphone runs in simulation mode. You can use the dial pad and Quick Connects, but no real calls are placed. The status banner tells you which mode you\'re in.' },
          { type: 'steps', title: 'Making a call:', items: [
            'Go to the VoIP tab',
            'Confirm the status banner shows "VoIP connected"',
            'Use the dial pad to enter a number or go to Quick Connects',
            'Click the green Call button',
            'Use Mute/Hold/Hang Up controls during the call',
          ]},
          { type: 'tip', text: 'Set your status at the top of the VoIP Current tab before taking calls. Status choices like "Available", "After Call Work", and "Not Ready" track your availability for reporting and supervision.' },
          { type: 'quiz', questions: [
            { question: 'What does "simulation mode" mean for the VoIP tab?', options: ['Calls are encrypted', 'VoIP is disconnected — dial pad works but no real calls are placed', 'The app is in demo mode', 'AI is simulating a caller'], correct: 1, explanation: 'Simulation mode means VoIP credentials are not configured or your plan does not include VoIP. The UI functions but no real calls are placed.' },
          ]},
        ],
      },
    ],
  },
  {
    id: 'compliance',
    number: 8,
    title: 'Compliance & Reporting',
    subtitle: 'The paper trail that protects you',
    color: '#64748b',
    lessons: [
      {
        id: 'audit-log',
        title: 'The Audit Log',
        readTime: '3 min',
        content: [
          { type: 'paragraph', text: 'The Audit Log (Settings → Audit Log) is an append-only record of every meaningful action taken in GSOC AI. It cannot be edited — entries can only be added. Admin users can clear the log, but this action itself is recorded.' },
          { type: 'steps', title: 'What is recorded:', items: [
            'Incident created, updated, deleted',
            'AI triage run on an incident',
            'CSV exports (who exported what, when)',
            'User logins and logouts',
            'Password changes',
            'Settings changes',
          ]},
          { type: 'warning', text: 'The audit log is your defence in a legal challenge. If an incident is disputed — "why was it dismissed?", "who escalated this?" — the audit log has the answer. Export it regularly and store copies off-device.' },
          { type: 'tip', text: 'Use the search/filter on the Audit Log to quickly find all actions by a specific user or all actions on a specific entity type. This is invaluable during post-incident reviews.' },
          { type: 'quiz', questions: [
            { question: 'Can audit log entries be edited?', options: ['Yes, by admins only', 'Yes, if within 24 hours', 'No — the log is append-only', 'Yes, via the CSV export'], correct: 2, explanation: 'The audit log is intentionally append-only. This immutability is what makes it legally useful. Entries cannot be changed, only added.' },
          ]},
        ],
      },
      {
        id: 'exports',
        title: 'Exports & Documentation',
        readTime: '3 min',
        content: [
          { type: 'paragraph', text: 'CSV export is available from TriageLog and the Audit Log. The export always reflects your current filter — if you are filtering by "Escalated" incidents at "Store #1001", the export contains only those rows.' },
          { type: 'steps', title: 'Best practices for reporting:', items: [
            'Export weekly incident reports by filtering by date range and exporting to CSV',
            'Store exports in your organisation\'s document management system, not just locally',
            'Use the Documents module to store SOP templates and incident rubrics for reference during shift',
            'For shift handoff, export the last 24 hours of incidents and include open items in your handoff notes',
          ]},
          { type: 'tip', text: 'The Documents module supports uploading PDFs and other files alongside text templates. Store your emergency contact lists, evacuation plans, and email templates there so every analyst has access without leaving the app.' },
          { type: 'quiz', questions: [
            { question: 'If you are viewing only "Escalated" incidents in TriageLog and click "Export CSV", what does the export contain?', options: ['All incidents ever', 'Only escalated incidents matching your current filter', 'Only incidents from today', 'All incidents in the last 30 days'], correct: 1, explanation: 'CSV export always reflects your current view. Filters applied to the table are applied to the export. If you want all incidents, clear your filters first.' },
          ]},
        ],
      },
    ],
  },
];

export const CLEARANCE_LEVELS = [
  { label: 'RECRUIT', color: '#94a3b8' },
  { label: 'PROBATIONARY', color: '#6366f1' },
  { label: 'ANALYST', color: '#3b82f6' },
  { label: 'SENIOR ANALYST', color: '#06b6d4' },
  { label: 'SPECIALIST', color: '#10b981' },
  { label: 'SENIOR SPECIALIST', color: '#f59e0b' },
  { label: 'TEAM LEAD', color: '#ef4444' },
  { label: 'SUPERVISOR', color: '#8b5cf6' },
  { label: 'OPERATIONS CHIEF', color: '#f97316' },
];
