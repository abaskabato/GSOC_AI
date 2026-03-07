import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './store/AppContext';
import { AuthProvider, useAuth } from './store/AuthContext';
import { AuditProvider } from './store/AuditContext';
import Login from './pages/Login';
import ErrorBoundary from './components/ErrorBoundary';
import TriageLog from './pages/TriageLog';
import Monitoring from './pages/Monitoring';
import ProtestTracker from './pages/ProtestTracker';
import VoIP from './pages/VoIP';
import Documents from './pages/Documents';
import Tools from './pages/Tools';
import Settings from './pages/Settings';
import Integrations from './pages/Integrations';
import {
  Shield, Map, Phone, FileText, Wrench,
  Settings as SettingsIcon, Monitor, AlertTriangle, Plug,
  LogOut, User, KeyRound,
} from 'lucide-react';

function Sidebar() {
  const { businessName } = useApp();

  const navItems = [
    { path: '/', icon: AlertTriangle, label: 'TriageLog' },
    { path: '/monitoring', icon: Monitor, label: 'Monitoring' },
    { path: '/protest-tracker', icon: Map, label: 'Protest Tracker' },
    { path: '/voip', icon: Phone, label: 'VoIP' },
    { path: '/documents', icon: FileText, label: 'Documents' },
    { path: '/tools', icon: Wrench, label: 'Tools' },
    { path: '/integrations', icon: Plug, label: 'Integrations' },
    { path: '/settings', icon: SettingsIcon, label: 'Settings' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1><Shield size={24} style={{ display: 'inline', marginRight: '8px' }} />GSOC AI</h1>
        <span>{businessName}</span>
      </div>
      <nav className="sidebar-nav">
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            end={item.path === '/'}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

function AppContent() {
  const { currentUser, isAuthenticated, isInitialized, logout } = useAuth();
  const location = useLocation();

  if (!isInitialized) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', backgroundColor: 'var(--bg)', color: 'var(--text-secondary)',
      }}>
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/': return 'TriageLog';
      case '/monitoring': return 'Monitoring';
      case '/protest-tracker': return 'Protest Tracker';
      case '/voip': return 'VoIP';
      case '/documents': return 'Documents';
      case '/tools': return 'Tools';
      case '/integrations': return 'Integrations';
      case '/settings': return 'Settings';
      default: return 'GSOC AI';
    }
  };

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <header className="header">
          <h2 className="header-title">{getPageTitle()}</h2>
          <div className="header-actions">
            <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
              {new Date().toLocaleString()}
            </span>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              color: 'var(--text-secondary)', fontSize: '12px',
              padding: '4px 10px', backgroundColor: 'var(--bg)', borderRadius: '4px',
            }}>
              <User size={14} />
              <span>{currentUser?.username}</span>
              <span style={{ opacity: 0.6 }}>({currentUser?.role})</span>
            </div>

            {currentUser?.forcePasswordChange && (
              <NavLink to="/settings" style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                backgroundColor: 'rgba(236,201,75,0.15)', color: 'var(--warning)',
                padding: '4px 10px', borderRadius: '4px', fontSize: '12px',
                textDecoration: 'none',
              }}>
                <KeyRound size={13} /> Change default password
              </NavLink>
            )}

            <button className="btn btn-secondary btn-sm" onClick={logout}>
              <LogOut size={14} /> Logout
            </button>
          </div>
        </header>

        <div className="content">
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<TriageLog />} />
              <Route path="/monitoring" element={<Monitoring />} />
              <Route path="/protest-tracker" element={<ProtestTracker />} />
              <Route path="/voip" element={<VoIP />} />
              <Route path="/documents" element={<Documents />} />
              <Route path="/tools" element={<Tools />} />
              <Route path="/integrations" element={<Integrations />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </ErrorBoundary>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AuditProvider>
          <AppProvider>
            <AppContent />
          </AppProvider>
        </AuditProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
