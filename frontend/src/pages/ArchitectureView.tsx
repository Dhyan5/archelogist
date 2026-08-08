import React, { useEffect, useState } from 'react';
import { Layers, ShieldCheck, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';
import { api } from '../services/api';

export const ArchitectureView: React.FC<{ scanId: string }> = ({ scanId }) => {
  const [arch, setArch] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/api/scans/${scanId}/architecture`)
      .then((res) => setArch(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [scanId]);

  if (loading || !arch) {
    return <div style={{ color: 'var(--text-muted)', padding: '2rem' }}>Analyzing repository architecture patterns...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <span className="badge badge-purple" style={{ marginBottom: '0.5rem' }}>Discovered Pattern</span>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff' }}>{arch.summary}</h2>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>CONFIDENCE SCORE</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#34d399' }}>92%</div>
          </div>
        </div>

        <div style={{ background: 'var(--bg-dark)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-cyan)', marginBottom: '0.5rem' }}>DATA FLOW PATH</div>
          <div style={{ fontSize: '0.9rem', color: '#fff', fontFamily: 'var(--font-mono)' }}>{arch.dataFlow}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div className="glass-card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '1rem' }}>Discovered Component Layers</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {(arch.components || []).map((c: string, idx: number) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: 'var(--bg-dark)', borderRadius: 'var(--radius-md)' }}>
                <CheckCircle size={18} color="#34d399" />
                <span style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 600 }}>{c}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '1rem' }}>Architecture Recommendations</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {(arch.recommendations || []).map((r: string, idx: number) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.75rem', background: 'var(--bg-dark)', borderRadius: 'var(--radius-md)' }}>
                <AlertTriangle size={18} color="#fbbf24" style={{ marginTop: '2px', flexShrink: 0 }} />
                <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{r}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
