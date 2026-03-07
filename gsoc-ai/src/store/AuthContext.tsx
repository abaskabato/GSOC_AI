import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../utils/db';

export interface User {
  id: string;
  username: string;
  passwordHash: string;
  role: 'admin' | 'analyst' | 'manager';
  initials: string;
  createdAt: string;
  lastLogin?: string;
  forcePasswordChange?: boolean;
}

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  users: User[];
  addUser: (username: string, password: string, role: User['role'], initials: string) => Promise<void>;
  updateUser: (id: string, updates: Partial<Pick<User, 'role' | 'initials'>>) => void;
  deleteUser: (id: string) => void;
  changePassword: (userId: string, oldPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey(
    'raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']
  );
  const derivedBits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    256
  );
  return JSON.stringify({
    salt: Array.from(salt),
    hash: Array.from(new Uint8Array(derivedBits)),
  });
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  try {
    const { salt, hash } = JSON.parse(stored);
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']
    );
    const derivedBits = await crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt: new Uint8Array(salt), iterations: 100000, hash: 'SHA-256' },
      keyMaterial,
      256
    );
    const newHash = Array.from(new Uint8Array(derivedBits));
    return newHash.length === hash.length && newHash.every((b: number, i: number) => b === hash[i]);
  } catch {
    return false;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToUser(r: any): User {
  return {
    id: r.id,
    username: r.username,
    passwordHash: r.password_hash,
    role: r.role,
    initials: r.initials,
    createdAt: r.created_at,
    lastLogin: r.last_login ?? undefined,
    forcePasswordChange: Boolean(r.force_password_change),
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const init = async () => {
      const db = await getDb();
      const rows = await db.select<unknown[]>('SELECT * FROM users');
      if (rows.length > 0) {
        setUsers((rows as any[]).map(rowToUser));
      } else {
        // Seed default admin user
        const defaultHash = await hashPassword('admin');
        const defaultUser: User = {
          id: uuidv4(),
          username: 'admin',
          passwordHash: defaultHash,
          role: 'admin',
          initials: 'ADM',
          createdAt: new Date().toISOString(),
          forcePasswordChange: true,
        };
        await db.execute(
          'INSERT INTO users VALUES (?,?,?,?,?,?,?,?)',
          [defaultUser.id, defaultUser.username, defaultUser.passwordHash,
           defaultUser.role, defaultUser.initials, 1,
           defaultUser.createdAt, null]
        );
        setUsers([defaultUser]);
      }
      setIsInitialized(true);
    };
    init();
  }, []);

  const login = async (username: string, password: string) => {
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (!user) return { success: false, error: 'Invalid username or password' };
    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) return { success: false, error: 'Invalid username or password' };
    const lastLogin = new Date().toISOString();
    const db = await getDb();
    await db.execute('UPDATE users SET last_login=? WHERE id=?', [lastLogin, user.id]);
    const updated = users.map(u => u.id === user.id ? { ...u, lastLogin } : u);
    setUsers(updated);
    setCurrentUser({ ...user, lastLogin });
    return { success: true };
  };

  const logout = () => setCurrentUser(null);

  const addUser = async (username: string, password: string, role: User['role'], initials: string) => {
    const passwordHash = await hashPassword(password);
    const newUser: User = {
      id: uuidv4(), username, passwordHash, role, initials,
      createdAt: new Date().toISOString(),
    };
    const db = await getDb();
    await db.execute(
      'INSERT INTO users VALUES (?,?,?,?,?,?,?,?)',
      [newUser.id, newUser.username, newUser.passwordHash,
       newUser.role, newUser.initials, 0, newUser.createdAt, null]
    );
    setUsers(prev => [...prev, newUser]);
  };

  const updateUser = (id: string, updates: Partial<Pick<User, 'role' | 'initials'>>) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
    getDb().then(db => {
      const fields: string[] = [];
      const vals: unknown[] = [];
      if (updates.role !== undefined) { fields.push('role=?'); vals.push(updates.role); }
      if (updates.initials !== undefined) { fields.push('initials=?'); vals.push(updates.initials); }
      if (fields.length) {
        vals.push(id);
        db.execute(`UPDATE users SET ${fields.join(',')} WHERE id=?`, vals);
      }
    });
  };

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
    getDb().then(db => db.execute('DELETE FROM users WHERE id=?', [id]));
  };

  const changePassword = async (userId: string, oldPassword: string, newPassword: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return { success: false, error: 'User not found' };
    const valid = await verifyPassword(oldPassword, user.passwordHash);
    if (!valid) return { success: false, error: 'Current password is incorrect' };
    const newHash = await hashPassword(newPassword);
    const db = await getDb();
    await db.execute('UPDATE users SET password_hash=?,force_password_change=0 WHERE id=?', [newHash, userId]);
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, passwordHash: newHash, forcePasswordChange: false } : u));
    if (currentUser?.id === userId) {
      setCurrentUser(prev => prev ? { ...prev, passwordHash: newHash, forcePasswordChange: false } : null);
    }
    return { success: true };
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      isAuthenticated: currentUser !== null,
      isInitialized,
      login,
      logout,
      users,
      addUser,
      updateUser,
      deleteUser,
      changePassword,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
