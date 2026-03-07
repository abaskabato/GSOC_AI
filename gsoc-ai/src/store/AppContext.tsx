import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../utils/db';
import type {
  Incident,
  MonitoringRequest,
  MonitoringLog,
  Protest,
  QuickConnect,
  Document,
  EmailTemplate,
  BusinessLocation,
  CameraSource,
  VoIPStatus
} from '../types';

export interface LicenseInfo {
  valid: boolean;
  plan?: string;
  org?: string;
  email?: string;
  trialEndsAt?: string;
  reason?: string;
}

export interface ApiKeys {
  anthropicKey: string;
  slackWebhookUrl: string;
  twilioAccountSid: string;
  twilioApiKeySid: string;
  twilioApiKeySecret: string;
  twilioAppSid: string;
}

const DEFAULT_API_KEYS: ApiKeys = {
  anthropicKey: '',
  slackWebhookUrl: '',
  twilioAccountSid: '',
  twilioApiKeySid: '',
  twilioApiKeySecret: '',
  twilioAppSid: '',
};

interface AppContextType {
  incidents: Incident[];
  addIncident: (incident: Omit<Incident, 'id'>) => void;
  updateIncident: (id: string, incident: Partial<Incident>) => void;
  deleteIncident: (id: string) => void;
  monitoringRequests: MonitoringRequest[];
  addMonitoringRequest: (request: Omit<MonitoringRequest, 'id'>) => void;
  updateMonitoringRequest: (id: string, request: Partial<MonitoringRequest>) => void;
  deleteMonitoringRequest: (id: string) => void;
  monitoringLogs: MonitoringLog[];
  addMonitoringLog: (log: Omit<MonitoringLog, 'id'>) => void;
  protests: Protest[];
  addProtest: (protest: Omit<Protest, 'id'>) => void;
  updateProtest: (id: string, protest: Partial<Protest>) => void;
  deleteProtest: (id: string) => void;
  quickConnects: QuickConnect[];
  addQuickConnect: (qc: Omit<QuickConnect, 'id'>) => void;
  deleteQuickConnect: (id: string) => void;
  documents: Document[];
  addDocument: (doc: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateDocument: (id: string, doc: Partial<Document>) => void;
  deleteDocument: (id: string) => void;
  emailTemplates: EmailTemplate[];
  addEmailTemplate: (template: Omit<EmailTemplate, 'id'>) => void;
  updateEmailTemplate: (id: string, template: Partial<EmailTemplate>) => void;
  deleteEmailTemplate: (id: string) => void;
  businessLocations: BusinessLocation[];
  addBusinessLocation: (loc: Omit<BusinessLocation, 'id'>) => void;
  updateBusinessLocation: (id: string, loc: Partial<BusinessLocation>) => void;
  deleteBusinessLocation: (id: string) => void;
  cameraSources: CameraSource[];
  addCameraSource: (cam: Omit<CameraSource, 'id'>) => void;
  updateCameraSource: (id: string, cam: Partial<CameraSource>) => void;
  deleteCameraSource: (id: string) => void;
  voipStatus: VoIPStatus;
  setVoipStatus: (status: VoIPStatus) => void;
  localTimezone: string;
  businessName: string;
  setBusinessName: (name: string) => void;
  dismissalReasons: string[];
  setDismissalReasons: (reasons: string[]) => void;
  escalationActions: string[];
  setEscalationActions: (actions: string[]) => void;
  apiKeys: ApiKeys;
  setApiKeys: (keys: ApiKeys) => void;
  licenseKey: string;
  licenseInfo: LicenseInfo | null;
  activateLicense: (key: string) => Promise<LicenseInfo>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// ── Row mappers ──────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToIncident(r: any): Incident {
  return {
    id: r.id,
    timestamp: r.timestamp,
    source: r.source,
    details: r.details,
    affectedLocation: r.affected_location,
    dismissalReason: r.dismissal_reason ?? undefined,
    escalation: r.escalation_action
      ? { action: r.escalation_action, timestamp: r.escalation_timestamp }
      : undefined,
    notes: r.notes,
    resolverInitials: r.resolver_initials,
    hoursOfOperation: r.hours_of_operation,
    status: r.status,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToMonitoringRequest(r: any): MonitoringRequest {
  return {
    id: r.id,
    locationStatus: r.location_status,
    requestor: r.requestor,
    location: r.location,
    interval: r.interval,
    justification: r.justification,
    startDateTime: r.start_date_time,
    endDateTime: r.end_date_time,
    requestorContact: r.requestor_contact,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToMonitoringLog(r: any): MonitoringLog {
  return {
    id: r.id,
    requestId: r.request_id,
    interval: r.interval,
    timeChecked: r.time_checked,
    locationName: r.location_name,
    cameraStatus: r.camera_status,
    observation: r.observation,
    initials: r.initials,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToProtest(r: any): Protest {
  return {
    id: r.id,
    softwareLocalTime: r.software_local_time,
    date: r.date,
    protestLocalTime: r.protest_local_time,
    eventName: r.event_name,
    city: r.city,
    state: r.state,
    nearestLocation: r.nearest_location,
    nearestTenLocations: JSON.parse(r.nearest_ten_locations || '[]'),
    notes: r.notes,
    initials: r.initials,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToDocument(r: any): Document {
  return {
    id: r.id,
    name: r.name,
    category: r.category,
    content: r.content,
    fileName: r.file_name ?? undefined,
    fileType: r.file_type ?? undefined,
    fileSize: r.file_size ?? undefined,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

// ── Provider ─────────────────────────────────────────────────────────────────

export function AppProvider({ children }: { children: ReactNode }) {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [monitoringRequests, setMonitoringRequests] = useState<MonitoringRequest[]>([]);
  const [monitoringLogs, setMonitoringLogs] = useState<MonitoringLog[]>([]);
  const [protests, setProtests] = useState<Protest[]>([]);
  const [quickConnects, setQuickConnects] = useState<QuickConnect[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);
  const [businessLocations, setBusinessLocations] = useState<BusinessLocation[]>([]);
  const [cameraSources, setCameraSources] = useState<CameraSource[]>([]);
  const [voipStatus, setVoipStatusState] = useState<VoIPStatus>({ status: 'Available', lastChange: new Date().toISOString() });
  const [businessName, setBusinessNameState] = useState('My Company');
  const [dismissalReasons, setDismissalReasonsState] = useState<string[]>([]);
  const [escalationActions, setEscalationActionsState] = useState<string[]>([]);
  const [apiKeys, setApiKeysState] = useState<ApiKeys>(DEFAULT_API_KEYS);
  const [licenseKey, setLicenseKeyState] = useState('');
  const [licenseInfo, setLicenseInfo] = useState<LicenseInfo | null>(null);

  const localTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Load all data from SQLite on mount
  useEffect(() => {
    getDb().then(async db => {
      const [inc, mReq, mLog, prot, qc, docs, tpl, locs, cams] = await Promise.all([
        db.select<unknown[]>('SELECT * FROM incidents ORDER BY timestamp DESC'),
        db.select<unknown[]>('SELECT * FROM monitoring_requests'),
        db.select<unknown[]>('SELECT * FROM monitoring_logs ORDER BY time_checked DESC'),
        db.select<unknown[]>('SELECT * FROM protests ORDER BY date DESC'),
        db.select<unknown[]>('SELECT * FROM quick_connects'),
        db.select<unknown[]>('SELECT * FROM documents ORDER BY created_at DESC'),
        db.select<unknown[]>('SELECT * FROM email_templates'),
        db.select<unknown[]>('SELECT * FROM business_locations'),
        db.select<unknown[]>('SELECT * FROM camera_sources'),
      ]);

      setIncidents((inc as any[]).map(rowToIncident));
      setMonitoringRequests((mReq as any[]).map(rowToMonitoringRequest));
      setMonitoringLogs((mLog as any[]).map(rowToMonitoringLog));
      setProtests((prot as any[]).map(rowToProtest));
      setQuickConnects(qc as QuickConnect[]);
      setDocuments((docs as any[]).map(rowToDocument));
      setEmailTemplates(tpl as EmailTemplate[]);
      setBusinessLocations((locs as any[]).map(r => ({
        id: (r as any).id,
        name: (r as any).name,
        address: (r as any).address,
        hoursOfOperation: (r as any).hours_of_operation,
        timezone: (r as any).timezone,
      })));
      setCameraSources((cams as any[]).map(r => ({
        id: (r as any).id,
        name: (r as any).name,
        type: (r as any).type,
        url: (r as any).url,
        status: (r as any).status,
      })));

      const settings = await db.select<{ key: string; value: string }[]>('SELECT key, value FROM settings');
      const get = (k: string) => settings.find(s => s.key === k)?.value;

      const biz = get('businessName');
      if (biz) setBusinessNameState(biz);

      const voip = get('voipStatus');
      if (voip) setVoipStatusState(JSON.parse(voip));

      const dr = get('dismissalReasons');
      setDismissalReasonsState(dr ? JSON.parse(dr) : ['False Alarm', 'Non-Urgent', 'Duplicate', 'Resolved Externally']);

      const ea = get('escalationActions');
      setEscalationActionsState(ea ? JSON.parse(ea) : ['Email Supervisor', 'Call Manager', 'Dispatch Security', 'Contact Police']);

      const ak = get('apiKeys');
      if (ak) setApiKeysState(JSON.parse(ak));

      const lk = get('licenseKey');
      if (lk) {
        setLicenseKeyState(lk);
        // Re-validate stored license silently on launch
        import('../utils/license').then(({ validateLicense }) =>
          validateLicense(lk).then(setLicenseInfo).catch(() => null)
        );
      }
    });
  }, []);

  // ── Incidents ──────────────────────────────────────────────────────────────

  const addIncident = (incident: Omit<Incident, 'id'>) => {
    const newInc: Incident = { ...incident, id: uuidv4() };
    setIncidents(prev => [newInc, ...prev]);
    getDb().then(db => db.execute(
      'INSERT INTO incidents VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',
      [newInc.id, newInc.timestamp, newInc.source, newInc.details, newInc.affectedLocation,
       newInc.dismissalReason ?? null, newInc.escalation?.action ?? null,
       newInc.escalation?.timestamp ?? null, newInc.notes, newInc.resolverInitials,
       newInc.hoursOfOperation, newInc.status]
    ));
  };

  const updateIncident = (id: string, update: Partial<Incident>) => {
    setIncidents(prev => prev.map(i => i.id === id ? { ...i, ...update } : i));
    getDb().then(async db => {
      const rows = await db.select<any[]>('SELECT * FROM incidents WHERE id = ?', [id]);
      if (!rows.length) return;
      const merged = { ...rowToIncident(rows[0]), ...update };
      await db.execute(
        `UPDATE incidents SET timestamp=?,source=?,details=?,affected_location=?,
         dismissal_reason=?,escalation_action=?,escalation_timestamp=?,notes=?,
         resolver_initials=?,hours_of_operation=?,status=? WHERE id=?`,
        [merged.timestamp, merged.source, merged.details, merged.affectedLocation,
         merged.dismissalReason ?? null, merged.escalation?.action ?? null,
         merged.escalation?.timestamp ?? null, merged.notes, merged.resolverInitials,
         merged.hoursOfOperation, merged.status, id]
      );
    });
  };

  const deleteIncident = (id: string) => {
    setIncidents(prev => prev.filter(i => i.id !== id));
    getDb().then(db => db.execute('DELETE FROM incidents WHERE id=?', [id]));
  };

  // ── Monitoring Requests ────────────────────────────────────────────────────

  const addMonitoringRequest = (request: Omit<MonitoringRequest, 'id'>) => {
    const newReq: MonitoringRequest = { ...request, id: uuidv4() };
    setMonitoringRequests(prev => [newReq, ...prev]);
    getDb().then(db => db.execute(
      'INSERT INTO monitoring_requests VALUES (?,?,?,?,?,?,?,?,?)',
      [newReq.id, newReq.locationStatus, newReq.requestor, newReq.location,
       newReq.interval, newReq.justification, newReq.startDateTime,
       newReq.endDateTime, newReq.requestorContact]
    ));
  };

  const updateMonitoringRequest = (id: string, update: Partial<MonitoringRequest>) => {
    setMonitoringRequests(prev => prev.map(r => r.id === id ? { ...r, ...update } : r));
    getDb().then(async db => {
      const rows = await db.select<any[]>('SELECT * FROM monitoring_requests WHERE id=?', [id]);
      if (!rows.length) return;
      const m = { ...rowToMonitoringRequest(rows[0]), ...update };
      await db.execute(
        `UPDATE monitoring_requests SET location_status=?,requestor=?,location=?,interval=?,
         justification=?,start_date_time=?,end_date_time=?,requestor_contact=? WHERE id=?`,
        [m.locationStatus, m.requestor, m.location, m.interval, m.justification,
         m.startDateTime, m.endDateTime, m.requestorContact, id]
      );
    });
  };

  const deleteMonitoringRequest = (id: string) => {
    setMonitoringRequests(prev => prev.filter(r => r.id !== id));
    getDb().then(db => db.execute('DELETE FROM monitoring_requests WHERE id=?', [id]));
  };

  // ── Monitoring Logs ────────────────────────────────────────────────────────

  const addMonitoringLog = (log: Omit<MonitoringLog, 'id'>) => {
    const newLog: MonitoringLog = { ...log, id: uuidv4() };
    setMonitoringLogs(prev => [newLog, ...prev]);
    getDb().then(db => db.execute(
      'INSERT INTO monitoring_logs VALUES (?,?,?,?,?,?,?,?)',
      [newLog.id, newLog.requestId, newLog.interval, newLog.timeChecked,
       newLog.locationName, newLog.cameraStatus, newLog.observation, newLog.initials]
    ));
  };

  // ── Protests ───────────────────────────────────────────────────────────────

  const addProtest = (protest: Omit<Protest, 'id'>) => {
    const newProt: Protest = { ...protest, id: uuidv4() };
    setProtests(prev => [newProt, ...prev]);
    getDb().then(db => db.execute(
      'INSERT INTO protests VALUES (?,?,?,?,?,?,?,?,?,?,?)',
      [newProt.id, newProt.softwareLocalTime, newProt.date, newProt.protestLocalTime,
       newProt.eventName, newProt.city, newProt.state, newProt.nearestLocation,
       JSON.stringify(newProt.nearestTenLocations), newProt.notes, newProt.initials]
    ));
  };

  const updateProtest = (id: string, update: Partial<Protest>) => {
    setProtests(prev => prev.map(p => p.id === id ? { ...p, ...update } : p));
    getDb().then(async db => {
      const rows = await db.select<any[]>('SELECT * FROM protests WHERE id=?', [id]);
      if (!rows.length) return;
      const m = { ...rowToProtest(rows[0]), ...update };
      await db.execute(
        `UPDATE protests SET software_local_time=?,date=?,protest_local_time=?,event_name=?,
         city=?,state=?,nearest_location=?,nearest_ten_locations=?,notes=?,initials=? WHERE id=?`,
        [m.softwareLocalTime, m.date, m.protestLocalTime, m.eventName, m.city,
         m.state, m.nearestLocation, JSON.stringify(m.nearestTenLocations),
         m.notes, m.initials, id]
      );
    });
  };

  const deleteProtest = (id: string) => {
    setProtests(prev => prev.filter(p => p.id !== id));
    getDb().then(db => db.execute('DELETE FROM protests WHERE id=?', [id]));
  };

  // ── Quick Connects ─────────────────────────────────────────────────────────

  const addQuickConnect = (qc: Omit<QuickConnect, 'id'>) => {
    const newQc: QuickConnect = { ...qc, id: uuidv4() };
    setQuickConnects(prev => [...prev, newQc]);
    getDb().then(db => db.execute('INSERT INTO quick_connects VALUES (?,?,?)', [newQc.id, newQc.name, newQc.number]));
  };

  const deleteQuickConnect = (id: string) => {
    setQuickConnects(prev => prev.filter(q => q.id !== id));
    getDb().then(db => db.execute('DELETE FROM quick_connects WHERE id=?', [id]));
  };

  // ── Documents ──────────────────────────────────────────────────────────────

  const addDocument = (doc: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newDoc: Document = { ...doc, id: uuidv4(), createdAt: now, updatedAt: now };
    setDocuments(prev => [newDoc, ...prev]);
    getDb().then(db => db.execute(
      'INSERT INTO documents VALUES (?,?,?,?,?,?,?,?,?)',
      [newDoc.id, newDoc.name, newDoc.category, newDoc.content,
       newDoc.fileName ?? null, newDoc.fileType ?? null, newDoc.fileSize ?? null,
       newDoc.createdAt, newDoc.updatedAt]
    ));
  };

  const updateDocument = (id: string, update: Partial<Document>) => {
    const updatedAt = new Date().toISOString();
    setDocuments(prev => prev.map(d => d.id === id ? { ...d, ...update, updatedAt } : d));
    getDb().then(async db => {
      const rows = await db.select<any[]>('SELECT * FROM documents WHERE id=?', [id]);
      if (!rows.length) return;
      const m = { ...rowToDocument(rows[0]), ...update, updatedAt };
      await db.execute(
        `UPDATE documents SET name=?,category=?,content=?,file_name=?,file_type=?,file_size=?,updated_at=? WHERE id=?`,
        [m.name, m.category, m.content, m.fileName ?? null, m.fileType ?? null, m.fileSize ?? null, updatedAt, id]
      );
    });
  };

  const deleteDocument = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
    getDb().then(db => db.execute('DELETE FROM documents WHERE id=?', [id]));
  };

  // ── Email Templates ────────────────────────────────────────────────────────

  const addEmailTemplate = (template: Omit<EmailTemplate, 'id'>) => {
    const newTpl: EmailTemplate = { ...template, id: uuidv4() };
    setEmailTemplates(prev => [...prev, newTpl]);
    getDb().then(db => db.execute('INSERT INTO email_templates VALUES (?,?,?,?)',
      [newTpl.id, newTpl.name, newTpl.subject, newTpl.body]));
  };

  const updateEmailTemplate = (id: string, update: Partial<EmailTemplate>) => {
    setEmailTemplates(prev => prev.map(t => t.id === id ? { ...t, ...update } : t));
    getDb().then(async db => {
      const rows = await db.select<any[]>('SELECT * FROM email_templates WHERE id=?', [id]);
      if (!rows.length) return;
      const m = { ...(rows[0] as EmailTemplate), ...update };
      await db.execute('UPDATE email_templates SET name=?,subject=?,body=? WHERE id=?',
        [m.name, m.subject, m.body, id]);
    });
  };

  const deleteEmailTemplate = (id: string) => {
    setEmailTemplates(prev => prev.filter(t => t.id !== id));
    getDb().then(db => db.execute('DELETE FROM email_templates WHERE id=?', [id]));
  };

  // ── Business Locations ─────────────────────────────────────────────────────

  const addBusinessLocation = (loc: Omit<BusinessLocation, 'id'>) => {
    const newLoc: BusinessLocation = { ...loc, id: uuidv4() };
    setBusinessLocations(prev => [...prev, newLoc]);
    getDb().then(db => db.execute('INSERT INTO business_locations VALUES (?,?,?,?,?)',
      [newLoc.id, newLoc.name, newLoc.address, newLoc.hoursOfOperation, newLoc.timezone]));
  };

  const updateBusinessLocation = (id: string, update: Partial<BusinessLocation>) => {
    setBusinessLocations(prev => prev.map(l => l.id === id ? { ...l, ...update } : l));
    getDb().then(async db => {
      const rows = await db.select<any[]>('SELECT * FROM business_locations WHERE id=?', [id]);
      if (!rows.length) return;
      const m = { id: rows[0].id, name: rows[0].name, address: rows[0].address,
        hoursOfOperation: rows[0].hours_of_operation, timezone: rows[0].timezone, ...update };
      await db.execute('UPDATE business_locations SET name=?,address=?,hours_of_operation=?,timezone=? WHERE id=?',
        [m.name, m.address, m.hoursOfOperation, m.timezone, id]);
    });
  };

  const deleteBusinessLocation = (id: string) => {
    setBusinessLocations(prev => prev.filter(l => l.id !== id));
    getDb().then(db => db.execute('DELETE FROM business_locations WHERE id=?', [id]));
  };

  // ── Camera Sources ─────────────────────────────────────────────────────────

  const addCameraSource = (cam: Omit<CameraSource, 'id'>) => {
    const newCam: CameraSource = { ...cam, id: uuidv4() };
    setCameraSources(prev => [...prev, newCam]);
    getDb().then(db => db.execute('INSERT INTO camera_sources VALUES (?,?,?,?,?)',
      [newCam.id, newCam.name, newCam.type, newCam.url, newCam.status]));
  };

  const updateCameraSource = (id: string, update: Partial<CameraSource>) => {
    setCameraSources(prev => prev.map(c => c.id === id ? { ...c, ...update } : c));
    getDb().then(async db => {
      const rows = await db.select<any[]>('SELECT * FROM camera_sources WHERE id=?', [id]);
      if (!rows.length) return;
      const m = { ...(rows[0] as CameraSource), ...update };
      await db.execute('UPDATE camera_sources SET name=?,type=?,url=?,status=? WHERE id=?',
        [m.name, m.type, m.url, m.status, id]);
    });
  };

  const deleteCameraSource = (id: string) => {
    setCameraSources(prev => prev.filter(c => c.id !== id));
    getDb().then(db => db.execute('DELETE FROM camera_sources WHERE id=?', [id]));
  };

  // ── Settings ───────────────────────────────────────────────────────────────

  const setVoipStatus = (status: VoIPStatus) => {
    setVoipStatusState(status);
    getDb().then(db => db.execute(
      "INSERT INTO settings(key,value) VALUES('voipStatus',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
      [JSON.stringify(status)]
    ));
  };

  const setBusinessName = (name: string) => {
    setBusinessNameState(name);
    getDb().then(db => db.execute(
      "INSERT INTO settings(key,value) VALUES('businessName',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
      [name]
    ));
  };

  const setDismissalReasons = (reasons: string[]) => {
    setDismissalReasonsState(reasons);
    getDb().then(db => db.execute(
      "INSERT INTO settings(key,value) VALUES('dismissalReasons',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
      [JSON.stringify(reasons)]
    ));
  };

  const setEscalationActions = (actions: string[]) => {
    setEscalationActionsState(actions);
    getDb().then(db => db.execute(
      "INSERT INTO settings(key,value) VALUES('escalationActions',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
      [JSON.stringify(actions)]
    ));
  };

  const setApiKeys = (keys: ApiKeys) => {
    setApiKeysState(keys);
    getDb().then(db => db.execute(
      "INSERT INTO settings(key,value) VALUES('apiKeys',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
      [JSON.stringify(keys)]
    ));
  };

  const activateLicense = async (key: string): Promise<LicenseInfo> => {
    const { validateLicense } = await import('../utils/license');
    const info = await validateLicense(key);
    setLicenseInfo(info);
    if (info.valid) {
      setLicenseKeyState(key.trim().toUpperCase());
      await getDb().then(db => db.execute(
        "INSERT INTO settings(key,value) VALUES('licenseKey',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
        [key.trim().toUpperCase()]
      ));
    }
    return info;
  };

  return (
    <AppContext.Provider value={{
      incidents, addIncident, updateIncident, deleteIncident,
      monitoringRequests, addMonitoringRequest, updateMonitoringRequest, deleteMonitoringRequest,
      monitoringLogs, addMonitoringLog,
      protests, addProtest, updateProtest, deleteProtest,
      quickConnects, addQuickConnect, deleteQuickConnect,
      documents, addDocument, updateDocument, deleteDocument,
      emailTemplates, addEmailTemplate, updateEmailTemplate, deleteEmailTemplate,
      businessLocations, addBusinessLocation, updateBusinessLocation, deleteBusinessLocation,
      cameraSources, addCameraSource, updateCameraSource, deleteCameraSource,
      voipStatus, setVoipStatus,
      localTimezone,
      businessName, setBusinessName,
      dismissalReasons, setDismissalReasons,
      escalationActions, setEscalationActions,
      apiKeys, setApiKeys,
      licenseKey, licenseInfo, activateLicense,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
