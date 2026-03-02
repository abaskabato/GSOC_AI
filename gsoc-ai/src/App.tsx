import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './store/AppContext';
import TriageLog from './pages/TriageLog';
import Monitoring from './pages/Monitoring';
import ProtestTracker from './pages/ProtestTracker';
import VoIP from './pages/VoIP';
import Documents from './pages/Documents';
import Tools from './pages/Tools';
import Settings from './pages/Settings';
import Integrations from './pages/Integrations';
import { Shield, LayoutDashboard, Map, Phone, FileText, Wrench, Settings as SettingsIcon, Monitor, AlertTriangle, Plug } from 'lucide-react';

function Sidebar() {
  const { businessName } = useApp();
  const location = useLocation();

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
  const location = useLocation();
  
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
          </div>
        </header>
        <div className="content">
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
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </BrowserRouter>
  );
}
