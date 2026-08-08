import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Repositories } from './pages/Repositories';
import { DashboardView } from './pages/DashboardView';
import { ArchitectureView } from './pages/ArchitectureView';
import { DependencyView } from './pages/DependencyView';
import { ImpactView } from './pages/ImpactView';
import { CodeExplorerView } from './pages/CodeExplorerView';
import { GitHistoryView } from './pages/GitHistoryView';
import { TechnicalDebtView } from './pages/TechnicalDebtView';
import { AiAssistantView } from './pages/AiAssistantView';
import { ReportsView } from './pages/ReportsView';
import { 
  Shield, 
  LayoutDashboard, 
  FolderGit2, 
  Network, 
  GitCommit, 
  AlertTriangle, 
  Bot, 
  FileText, 
  Settings, 
  LogOut, 
  Layers, 
  Zap, 
  Search,
  Code
} from 'lucide-react';

const AppContent: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState<string>('dashboard');
  const [authPage, setAuthPage] = useState<'login' | 'register'>('login');
  const [activeScanId, setActiveScanId] = useState<string>('scan-demo-001');
  const [impactTargetFile, setImpactTargetFile] = useState<string>('');

  if (!isAuthenticated) {
    if (authPage === 'register') {
      return <Register onNavigate={(page) => setAuthPage(page as 'login' | 'register')} />;
    }
    return <Login onNavigate={(page) => setAuthPage(page as 'login' | 'register')} />;
  }

  const handleSelectFileForImpact = (filePath: string) => {
    setImpactTargetFile(filePath);
    setCurrentPage('impact');
  };

  const renderNavButtons = () => {
    const navItems = [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'repositories', label: 'Repositories', icon: FolderGit2 },
      { id: 'architecture', label: 'Architecture', icon: Layers },
      { id: 'dependencies', label: 'Dependency Graph', icon: Network },
      { id: 'impact', label: 'Impact Analysis', icon: Zap },
      { id: 'code', label: 'Code Explorer', icon: Code },
      { id: 'git-history', label: 'Git Archaeology', icon: GitCommit },
      { id: 'technical-debt', label: 'Technical Debt', icon: AlertTriangle },
      { id: 'ai-assistant', label: 'AI Q&A Assistant', icon: Bot },
      { id: 'reports', label: 'PDF Reports', icon: FileText },
    ];

    return navItems.map((item) => {
      const Icon = item.icon;
      const isActive = currentPage === item.id;
      return (
        <div
          key={item.id}
          className={`nav-item ${isActive ? 'active' : ''}`}
          onClick={() => setCurrentPage(item.id)}
        >
          <Icon size={18} />
          <span>{item.label}</span>
        </div>
      );
    });
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.5rem 0.5rem 1.5rem 0.5rem' }}>
            <div style={{ background: 'var(--primary)', padding: '0.45rem', borderRadius: '8px', display: 'flex', alignItems: 'center', boxShadow: 'var(--shadow-glow)' }}>
              <Shield size={20} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>ARCHAEOLOGIST</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-subtle)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Platform v1.0</div>
            </div>
          </div>

          <nav>{renderNavButtons()}</nav>
        </div>

        {/* User Card */}
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.85rem' }}>
                {user?.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: '0.825rem', fontWeight: 600, color: '#fff' }}>{user?.username}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>{user?.role}</div>
              </div>
            </div>
            <button onClick={logout} title="Sign Out" style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.25rem' }}>
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Panel */}
      <main className="main-content">
        <header className="top-navbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', textTransform: 'capitalize' }}>
              {currentPage.replace('-', ' ')}
            </h2>
            <span className="badge badge-success">Scan Active: {activeScanId}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button className="btn-primary" style={{ padding: '0.45rem 0.9rem', fontSize: '0.825rem' }} onClick={() => setCurrentPage('repositories')}>
              + New Repository Scan
            </button>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <div style={{ padding: '1.75rem', flex: 1, overflowY: 'auto' }}>
          <div className="animate-fade-in">
            {currentPage === 'dashboard' && <DashboardView scanId={activeScanId} />}
            {currentPage === 'repositories' && <Repositories onSelectScan={(id) => { setActiveScanId(id); setCurrentPage('dashboard'); }} />}
            {currentPage === 'architecture' && <ArchitectureView scanId={activeScanId} />}
            {currentPage === 'dependencies' && <DependencyView scanId={activeScanId} onSelectFileForImpact={handleSelectFileForImpact} />}
            {currentPage === 'impact' && <ImpactView scanId={activeScanId} targetFile={impactTargetFile} />}
            {currentPage === 'code' && <CodeExplorerView scanId={activeScanId} />}
            {currentPage === 'git-history' && <GitHistoryView scanId={activeScanId} />}
            {currentPage === 'technical-debt' && <TechnicalDebtView scanId={activeScanId} />}
            {currentPage === 'ai-assistant' && <AiAssistantView scanId={activeScanId} onSelectFile={handleSelectFileForImpact} />}
            {currentPage === 'reports' && <ReportsView scanId={activeScanId} />}
          </div>
        </div>
      </main>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
