import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../utils/db';

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

export function AuditProvider({ children }: { children: ReactNode }) {
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);

  // Load recent audit entries on mount (last 2000)
  useEffect(() => {
    getDb().then(async db => {
      const rows = await db.select<unknown[]>(
        'SELECT * FROM audit_log ORDER BY timestamp DESC LIMIT 2000'
      );
      setAuditLog((rows as any[]).map(r => ({
        id: r.id,
        timestamp: r.timestamp,
        username: r.username,
        action: r.action,
        entityType: r.entity_type,
        entityId: r.entity_id ?? undefined,
        details: r.details,
      })));
    });
  }, []);

  const addAuditEntry = (entry: Omit<AuditEntry, 'id' | 'timestamp'>) => {
    const newEntry: AuditEntry = {
      ...entry,
      id: uuidv4(),
      timestamp: new Date().toISOString(),
    };
    setAuditLog(prev => [newEntry, ...prev].slice(0, 2000));
    getDb().then(db => db.execute(
      'INSERT INTO audit_log VALUES (?,?,?,?,?,?,?)',
      [newEntry.id, newEntry.timestamp, newEntry.username, newEntry.action,
       newEntry.entityType, newEntry.entityId ?? null, newEntry.details]
    ));
  };

  const clearAuditLog = () => {
    setAuditLog([]);
    getDb().then(db => db.execute('DELETE FROM audit_log'));
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
