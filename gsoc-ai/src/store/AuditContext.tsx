import React, { createContext, useContext, useState, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';

export interface AuditEntry {
  id: string;
  timestamp: string;
  username: string;
  action: 'created' | 'updated' | 'deleted' | 'login' | 'logout' | 'login_failed' | 'exported' | 'uploaded';
  entityType: string;
  entityId?: string;
  details: string;
}

interface AuditContextType {
  auditLog: AuditEntry[];
  addAuditEntry: (entry: Omit<AuditEntry, 'id' | 'timestamp'>) => void;
  clearAuditLog: () => void;
}

const AuditContext = createContext<AuditContextType | undefined>(undefined);

const MAX_ENTRIES = 2000;

export function AuditProvider({ children }: { children: ReactNode }) {
  const [auditLog, setAuditLog] = useState<AuditEntry[]>(() => {
    try {
      const saved = localStorage.getItem('gsoc_auditLog');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const addAuditEntry = (entry: Omit<AuditEntry, 'id' | 'timestamp'>) => {
    const newEntry: AuditEntry = {
      ...entry,
      id: uuidv4(),
      timestamp: new Date().toISOString(),
    };
    setAuditLog(prev => {
      const updated = [newEntry, ...prev].slice(0, MAX_ENTRIES);
      try {
        localStorage.setItem('gsoc_auditLog', JSON.stringify(updated));
      } catch {
        // localStorage full - keep in memory only
      }
      return updated;
    });
  };

  const clearAuditLog = () => {
    setAuditLog([]);
    localStorage.removeItem('gsoc_auditLog');
  };

  return (
    <AuditContext.Provider value={{ auditLog, addAuditEntry, clearAuditLog }}>
      {children}
    </AuditContext.Provider>
  );
}

export function useAudit() {
  const ctx = useContext(AuditContext);
  if (!ctx) throw new Error('useAudit must be used within AuditProvider');
  return ctx;
}
