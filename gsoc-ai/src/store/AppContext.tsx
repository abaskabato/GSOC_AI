import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [incidents, setIncidents] = useState<Incident[]>(() => {
    const saved = localStorage.getItem('incidents');
    return saved ? JSON.parse(saved) : [];
  });

  const [monitoringRequests, setMonitoringRequests] = useState<MonitoringRequest[]>(() => {
    const saved = localStorage.getItem('monitoringRequests');
    return saved ? JSON.parse(saved) : [];
  });

  const [monitoringLogs, setMonitoringLogs] = useState<MonitoringLog[]>(() => {
    const saved = localStorage.getItem('monitoringLogs');
    return saved ? JSON.parse(saved) : [];
  });

  const [protests, setProtests] = useState<Protest[]>(() => {
    const saved = localStorage.getItem('protests');
    return saved ? JSON.parse(saved) : [];
  });

  const [quickConnects, setQuickConnects] = useState<QuickConnect[]>(() => {
    const saved = localStorage.getItem('quickConnects');
    if (saved) return JSON.parse(saved);
    return [
      { id: '1', name: 'Emergency Services', number: '911' },
      { id: '2', name: 'Supervisor', number: '555-0100' },
      { id: '3', name: 'Security Desk', number: '555-0101' },
    ];
  });

  const [documents, setDocuments] = useState<Document[]>(() => {
    const saved = localStorage.getItem('documents');
    return saved ? JSON.parse(saved) : [];
  });

  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>(() => {
    const saved = localStorage.getItem('emailTemplates');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: '1',
        name: 'Significant Impact',
        subject: 'URGENT: Significant Security Incident - {location}',
        body: `Dear Team,\n\nA significant security incident has been reported at {location}.\n\nIncident Details:\n{details}\n\nTime: {time}\nResolver: {resolver}\n\nPlease take immediate action.\n\nBest regards,\nSecurity Operations`
      },
      {
        id: '2',
        name: 'General Impact',
        subject: 'Security Incident Report - {location}',
        body: `Dear Team,\n\nA security incident has been reported at {location}.\n\nIncident Details:\n{details}\n\nTime: {time}\nResolver: {resolver}\n\nPlease review and take appropriate action.\n\nBest regards,\nSecurity Operations`
      },
      {
        id: '3',
        name: 'Potential Impact',
        subject: 'Potential Security Alert - {location}',
        body: `Dear Team,\n\nA potential security concern has been identified at {location}.\n\nIncident Details:\n{details}\n\nTime: {time}\nResolver: {resolver}\n\nPlease monitor the situation.\n\nBest regards,\nSecurity Operations`
      }
    ];
  });

  const [businessLocations, setBusinessLocations] = useState<BusinessLocation[]>(() => {
    const saved = localStorage.getItem('businessLocations');
    if (saved) return JSON.parse(saved);
    return [
      { id: '1', name: 'Store #1001', address: '123 Main St, Seattle, WA', hoursOfOperation: '6AM - 11PM', timezone: 'America/Los_Angeles' },
      { id: '2', name: 'Store #1002', address: '456 Oak Ave, Portland, OR', hoursOfOperation: '6AM - 11PM', timezone: 'America/Los_Angeles' },
      { id: '3', name: 'Store #1003', address: '789 Pine Rd, Bellevue, WA', hoursOfOperation: '6AM - 10PM', timezone: 'America/Los_Angeles' },
    ];
  });

  const [cameraSources, setCameraSources] = useState<CameraSource[]>(() => {
    const saved = localStorage.getItem('cameraSources');
    return saved ? JSON.parse(saved) : [];
  });

  const [voipStatus, setVoipStatus] = useState<VoIPStatus>(() => {
    const saved = localStorage.getItem('voipStatus');
    return saved ? JSON.parse(saved) : { status: 'Available', lastChange: new Date().toISOString() };
  });

  const [businessName, setBusinessName] = useState(() => {
    return localStorage.getItem('businessName') || 'My Company';
  });

  const [dismissalReasons, setDismissalReasons] = useState<string[]>(() => {
    const saved = localStorage.getItem('dismissalReasons');
    if (saved) return JSON.parse(saved);
    return ['False Alarm', 'Non-Urgent', 'Duplicate', 'Resolved Externally'];
  });

  const [escalationActions, setEscalationActions] = useState<string[]>(() => {
    const saved = localStorage.getItem('escalationActions');
    if (saved) return JSON.parse(saved);
    return ['Email Supervisor', 'Call Manager', 'Dispatch Security', 'Contact Police'];
  });

  const localTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  useEffect(() => {
    localStorage.setItem('incidents', JSON.stringify(incidents));
  }, [incidents]);

  useEffect(() => {
    localStorage.setItem('monitoringRequests', JSON.stringify(monitoringRequests));
  }, [monitoringRequests]);

  useEffect(() => {
    localStorage.setItem('monitoringLogs', JSON.stringify(monitoringLogs));
  }, [monitoringLogs]);

  useEffect(() => {
    localStorage.setItem('protests', JSON.stringify(protests));
  }, [protests]);

  useEffect(() => {
    localStorage.setItem('quickConnects', JSON.stringify(quickConnects));
  }, [quickConnects]);

  useEffect(() => {
    localStorage.setItem('documents', JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem('emailTemplates', JSON.stringify(emailTemplates));
  }, [emailTemplates]);

  useEffect(() => {
    localStorage.setItem('businessLocations', JSON.stringify(businessLocations));
  }, [businessLocations]);

  useEffect(() => {
    localStorage.setItem('cameraSources', JSON.stringify(cameraSources));
  }, [cameraSources]);

  useEffect(() => {
    localStorage.setItem('voipStatus', JSON.stringify(voipStatus));
  }, [voipStatus]);

  useEffect(() => {
    localStorage.setItem('businessName', businessName);
  }, [businessName]);

  useEffect(() => {
    localStorage.setItem('dismissalReasons', JSON.stringify(dismissalReasons));
  }, [dismissalReasons]);

  useEffect(() => {
    localStorage.setItem('escalationActions', JSON.stringify(escalationActions));
  }, [escalationActions]);

  const addIncident = (incident: Omit<Incident, 'id'>) => {
    setIncidents(prev => [{ ...incident, id: uuidv4() }, ...prev]);
  };

  const updateIncident = (id: string, incident: Partial<Incident>) => {
    setIncidents(prev => prev.map(i => i.id === id ? { ...i, ...incident } : i));
  };

  const deleteIncident = (id: string) => {
    setIncidents(prev => prev.filter(i => i.id !== id));
  };

  const addMonitoringRequest = (request: Omit<MonitoringRequest, 'id'>) => {
    setMonitoringRequests(prev => [{ ...request, id: uuidv4() }, ...prev]);
  };

  const updateMonitoringRequest = (id: string, request: Partial<MonitoringRequest>) => {
    setMonitoringRequests(prev => prev.map(r => r.id === id ? { ...r, ...request } : r));
  };

  const deleteMonitoringRequest = (id: string) => {
    setMonitoringRequests(prev => prev.filter(r => r.id !== id));
  };

  const addMonitoringLog = (log: Omit<MonitoringLog, 'id'>) => {
    setMonitoringLogs(prev => [{ ...log, id: uuidv4() }, ...prev]);
  };

  const addProtest = (protest: Omit<Protest, 'id'>) => {
    setProtests(prev => [{ ...protest, id: uuidv4() }, ...prev]);
  };

  const updateProtest = (id: string, protest: Partial<Protest>) => {
    setProtests(prev => prev.map(p => p.id === id ? { ...p, ...protest } : p));
  };

  const deleteProtest = (id: string) => {
    setProtests(prev => prev.filter(p => p.id !== id));
  };

  const addQuickConnect = (qc: Omit<QuickConnect, 'id'>) => {
    setQuickConnects(prev => [...prev, { ...qc, id: uuidv4() }]);
  };

  const deleteQuickConnect = (id: string) => {
    setQuickConnects(prev => prev.filter(q => q.id !== id));
  };

  const addDocument = (doc: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    setDocuments(prev => [...prev, { ...doc, id: uuidv4(), createdAt: now, updatedAt: now }]);
  };

  const updateDocument = (id: string, doc: Partial<Document>) => {
    setDocuments(prev => prev.map(d => d.id === id ? { ...d, ...doc, updatedAt: new Date().toISOString() } : d));
  };

  const deleteDocument = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
  };

  const addEmailTemplate = (template: Omit<EmailTemplate, 'id'>) => {
    setEmailTemplates(prev => [...prev, { ...template, id: uuidv4() }]);
  };

  const updateEmailTemplate = (id: string, template: Partial<EmailTemplate>) => {
    setEmailTemplates(prev => prev.map(t => t.id === id ? { ...t, ...template } : t));
  };

  const deleteEmailTemplate = (id: string) => {
    setEmailTemplates(prev => prev.filter(t => t.id !== id));
  };

  const addBusinessLocation = (loc: Omit<BusinessLocation, 'id'>) => {
    setBusinessLocations(prev => [...prev, { ...loc, id: uuidv4() }]);
  };

  const updateBusinessLocation = (id: string, loc: Partial<BusinessLocation>) => {
    setBusinessLocations(prev => prev.map(l => l.id === id ? { ...l, ...loc } : l));
  };

  const deleteBusinessLocation = (id: string) => {
    setBusinessLocations(prev => prev.filter(l => l.id !== id));
  };

  const addCameraSource = (cam: Omit<CameraSource, 'id'>) => {
    setCameraSources(prev => [...prev, { ...cam, id: uuidv4() }]);
  };

  const updateCameraSource = (id: string, cam: Partial<CameraSource>) => {
    setCameraSources(prev => prev.map(c => c.id === id ? { ...c, ...cam } : c));
  };

  const deleteCameraSource = (id: string) => {
    setCameraSources(prev => prev.filter(c => c.id !== id));
  };

  return (
    <AppContext.Provider value={{
      incidents,
      addIncident,
      updateIncident,
      deleteIncident,
      monitoringRequests,
      addMonitoringRequest,
      updateMonitoringRequest,
      deleteMonitoringRequest,
      monitoringLogs,
      addMonitoringLog,
      protests,
      addProtest,
      updateProtest,
      deleteProtest,
      quickConnects,
      addQuickConnect,
      deleteQuickConnect,
      documents,
      addDocument,
      updateDocument,
      deleteDocument,
      emailTemplates,
      addEmailTemplate,
      updateEmailTemplate,
      deleteEmailTemplate,
      businessLocations,
      addBusinessLocation,
      updateBusinessLocation,
      deleteBusinessLocation,
      cameraSources,
      addCameraSource,
      updateCameraSource,
      deleteCameraSource,
      voipStatus,
      setVoipStatus,
      localTimezone,
      businessName,
      setBusinessName,
      dismissalReasons,
      setDismissalReasons,
      escalationActions,
      setEscalationActions,
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
