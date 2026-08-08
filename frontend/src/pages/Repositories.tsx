import React, { useState, useEffect } from 'react';
import { GitBranch, UploadCloud, Play, CheckCircle2, AlertCircle, RefreshCw, FolderGit2, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import { Scan, ScanStatus } from '../types';

export const Repositories: React.FC<{ onSelectScan: (scanId: string) => void }> = ({ onSelectScan }) => {
  const [activeTab, setActiveTab] = useState<'url' | 'zip'>('url');
  const [repoUrl, setRepoUrl] = useState('https://github.com/spring-projects/spring-petclinic.git');
  const [repoName, setRepoName] = useState('spring-petclinic');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const [scans, setScans] = useState<Scan[]>([]);
  const [activeScanId, setActiveScanId] = useState<string | null>('scan-demo-001');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchScans = async () => {
    try {
      const res = await api.get('/api/scans');
      setScans(res.data);
    } catch (err) {
      console.error('Failed to load scans', err);
    }
  };

  useEffect(() => {
    fetchScans();
    const interval = setInterval(() => {
      fetchScans();
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl.trim()) return;
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/api/repositories/analyze-url', {
        repoUrl: repoUrl.trim(),
        name: repoName.trim() || undefined
      });
      setActiveScanId(res.data.scanId);
      onSelectScan(res.data.scanId);
      fetchScans();
    } catch (err: any) {
      setError(err.response?.data?.detail || err.response?.data?.message || 'Failed to submit URL');
    } finally {
      setLoading(false);
    }
  };

  const handleZipSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;
    setError('');
    setLoading(true);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const res = await api.post('/api/repositories/upload-zip', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setActiveScanId(res.data.scanId);
      onSelectScan(res.data.scanId);
      fetchScans();
    } catch (err: any) {
      setError(err.response?.data?.detail || err.response?.data?.message || 'ZIP upload failed');
    } finally {
      setLoading(false);
    }
  };

  const renderStatusBadge = (status: ScanStatus) => {
    switch (status) {
      case 'COMPLETED':
        return <span className="badge badge-success"><CheckCircle2 size={12} /> Completed</span>;
      case 'FAILED':
        return <span className="badge badge-danger"><AlertCircle size={12} /> Failed</span>;
      default:
        return <span className="badge badge-info"><RefreshCw size={12} className="spin" /> {status}</span>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: '0.35rem' }}>
          Repository Ingestion & Analysis Engine
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Submit a public GitHub URL or upload a ZIP archive. Static analysis is executed in zero-execution mode.
        </p>
      </div>

      {/* Ingestion Options Card */}
      <div className="glass-card">
        <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
          <button
            className={`btn-secondary ${activeTab === 'url' ? 'btn-primary' : ''}`}
            onClick={() => setActiveTab('url')}
            style={{ borderRadius: 'var(--radius-md)' }}
          >
            <GitBranch size={16} /> GitHub Repository URL
          </button>
          <button
            className={`btn-secondary ${activeTab === 'zip' ? 'btn-primary' : ''}`}
            onClick={() => setActiveTab('zip')}
            style={{ borderRadius: 'var(--radius-md)' }}
          >
            <UploadCloud size={16} /> Upload ZIP Archive
          </button>
        </div>

        {error && (
          <div style={{ background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.3)', color: '#f87171', padding: '0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
            {error}
          </div>
        )}

        {activeTab === 'url' ? (
          <form onSubmit={handleUrlSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                  Public GitHub Repository URL
                </label>
                <input
                  type="url"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/owner/repository.git"
                  required
                  style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--bg-dark)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: '#fff', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                  Project Name (Optional)
                </label>
                <input
                  type="text"
                  value={repoName}
                  onChange={(e) => setRepoName(e.target.value)}
                  placeholder="spring-petclinic"
                  style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--bg-dark)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: '#fff', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn-primary" disabled={loading}>
                <Play size={16} /> {loading ? 'Ingesting Repository...' : 'Start Static Scan & Analysis'}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleZipSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                Select Codebase ZIP File (Max 50MB)
              </label>
              <input
                type="file"
                accept=".zip"
                onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
                required
                style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-dark)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: '#fff', fontSize: '0.9rem' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn-primary" disabled={loading || !selectedFile}>
                <UploadCloud size={16} /> {loading ? 'Extracting & Scanning...' : 'Upload & Analyze Codebase'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Scans Table */}
      <div className="glass-card">
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FolderGit2 size={18} color="var(--primary)" /> Ingested Scan Workspace History
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-subtle)', textAlign: 'left' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Repository Name</th>
                <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                <th style={{ padding: '0.75rem 1rem' }}>Files</th>
                <th style={{ padding: '0.75rem 1rem' }}>Lines of Code</th>
                <th style={{ padding: '0.75rem 1rem' }}>Health Score</th>
                <th style={{ padding: '0.75rem 1rem' }}>Risk Score</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {scans.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No repository scans submitted yet. Enter a GitHub URL above to begin.
                  </td>
                </tr>
              ) : (
                scans.map((scan) => (
                  <tr key={scan.id || scan.repositoryId} style={{ borderBottom: '1px solid var(--border-color)', background: activeScanId === scan.id ? 'var(--bg-card-hover)' : 'transparent' }}>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#fff' }}>
                      {scan.repositoryName}
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>{renderStatusBadge(scan.status)}</td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>{scan.totalFiles || '-'}</td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>{scan.totalLoc ? scan.totalLoc.toLocaleString() : '-'}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span style={{ color: scan.healthScore > 75 ? '#34d399' : '#fbbf24', fontWeight: 700 }}>
                        {scan.healthScore ? `${scan.healthScore}/100` : '-'}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span style={{ color: scan.overallRiskScore > 60 ? '#f87171' : '#34d399', fontWeight: 700 }}>
                        {scan.overallRiskScore ? `${scan.overallRiskScore}/100` : '-'}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                      <button
                        className="btn-secondary"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                        onClick={() => {
                          setActiveScanId(scan.id);
                          onSelectScan(scan.id);
                        }}
                      >
                        Explore <ArrowRight size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
