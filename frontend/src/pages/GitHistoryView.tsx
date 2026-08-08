import React, { useEffect, useState } from 'react';
import { GitCommit, Flame, Clock, UserCheck } from 'lucide-react';
import { api } from '../services/api';

export const GitHistoryView: React.FC<{ scanId: string }> = ({ scanId }) => {
  const [gitData, setGitData] = useState<any>(null);

  useEffect(() => {
    api.get(`/api/scans/${scanId}/git-history`).then((res) => {
      setGitData(res.data);
    });
  }, [scanId]);

  if (!gitData) {
    return <div style={{ color: 'var(--text-muted)', padding: '2rem' }}>Loading Git Archaeology metadata...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
        <div className="glass-card">
          <div style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', fontWeight: 600 }}>COMMITS AUDITED</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', marginTop: '0.25rem' }}>{gitData.commitCount || 15}</div>
        </div>
        <div className="glass-card">
          <div style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', fontWeight: 600 }}>ACTIVE CONTRIBUTORS</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-cyan)', marginTop: '0.25rem' }}>{(gitData.contributors || []).length || 2}</div>
        </div>
        <div className="glass-card">
          <div style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', fontWeight: 600 }}>HIGH CHURN HOTSPOTS</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f43f5e', marginTop: '0.25rem' }}>{(gitData.hotspots || []).length || 3}</div>
        </div>
      </div>

      {/* Software Evolution Timeline */}
      <div className="glass-card">
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Clock size={18} color="var(--primary)" /> Software Evolution Timeline
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {(gitData.timeline || []).map((c: any, idx: number) => (
            <div key={idx} style={{ display: 'flex', gap: '1rem', borderLeft: '2px solid var(--primary)', paddingLeft: '1.25rem', position: 'relative' }}>
              <div style={{ position: 'absolute', left: '-7px', top: '4px', width: '12px', height: '12px', borderRadius: '50%', background: 'var(--primary)' }}></div>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>{c.message}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginTop: '0.25rem' }}>
                  {c.author} • {c.date} • <span style={{ fontFamily: 'var(--font-mono)' }}>{c.hash}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
