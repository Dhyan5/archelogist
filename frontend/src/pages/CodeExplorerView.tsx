import React, { useEffect, useState } from 'react';
import { FileCode, Search, Code, Shield, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';
import { FileNode } from '../types';

export const CodeExplorerView: React.FC<{ scanId: string }> = ({ scanId }) => {
  const [files, setFiles] = useState<FileNode[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [explanation, setExplanation] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get(`/api/scans/${scanId}/structure`).then((res) => {
      const fetchedFiles = res.data.files || [];
      setFiles(fetchedFiles);
      if (fetchedFiles.length > 0) {
        handleSelectFile(fetchedFiles[0]);
      }
    });
  }, [scanId]);

  const handleSelectFile = async (file: FileNode) => {
    setSelectedFile(file);
    setLoading(true);
    try {
      const res = await api.post(`/api/scans/${scanId}/ai/explain`, { filePath: file.filePath });
      setExplanation(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredFiles = files.filter(f => f.filePath.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '1.25rem', height: 'calc(100vh - 140px)' }}>
      {/* File Tree Explorer */}
      <div className="glass-card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem', overflow: 'hidden' }}>
        <div style={{ position: 'relative' }}>
          <Search size={14} color="var(--text-subtle)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search files..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '0.45rem 0.75rem 0.45rem 2.25rem', background: 'var(--bg-dark)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: '#fff', fontSize: '0.825rem' }}
          />
        </div>

        <div style={{ overflowY: 'auto', flex: 1 }}>
          {filteredFiles.map(f => (
            <div
              key={f.id || f.filePath}
              onClick={() => handleSelectFile(f)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                background: selectedFile?.filePath === f.filePath ? 'var(--primary)' : 'transparent',
                color: selectedFile?.filePath === f.filePath ? '#fff' : 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '0.825rem',
                marginBottom: '0.25rem',
                transition: 'all 0.15s ease'
              }}
            >
              <FileCode size={16} />
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.fileName}</span>
            </div>
          ))}
        </div>
      </div>

      {/* File Detail & AST Explanation Panel */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', overflowY: 'auto' }}>
        {selectedFile && (
          <>
            <div className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>{selectedFile.fileName}</h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', fontFamily: 'var(--font-mono)' }}>{selectedFile.filePath}</div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <span className="badge badge-info">{selectedFile.componentType}</span>
                  <span className="badge badge-purple">{selectedFile.loc} LOC</span>
                </div>
              </div>

              {loading ? (
                <div style={{ color: 'var(--text-muted)', padding: '1rem' }}>Parsing AST symbols and AI explanation...</div>
              ) : explanation ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ background: 'var(--bg-dark)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-cyan)', marginBottom: '0.35rem' }}>FUNCTIONAL PURPOSE</div>
                    <div style={{ fontSize: '0.9rem', color: '#fff' }}>{explanation.purpose}</div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-subtle)', marginBottom: '0.5rem' }}>POTENTIAL CONCERNS / DEBT</div>
                    {(explanation.potentialConcerns || []).map((c: string, idx: number) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fbbf24', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                        <AlertTriangle size={14} /> {c}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
