import React, { useEffect, useState } from 'react';
import { Zap, AlertTriangle, ArrowRight, Shield, Layers, FileCode } from 'lucide-react';
import { api } from '../services/api';
import { ImpactResult } from '../types';

export const ImpactView: React.FC<{ scanId: string; targetFile?: string }> = ({ scanId, targetFile }) => {
  const [selectedPath, setSelectedPath] = useState(targetFile || 'src/main/java/com/archaeologist/api/service/ScanService.java');
  const [impactData, setImpactData] = useState<ImpactResult | null>(null);
  const [loading, setLoading] = useState(false);

  const calculateImpact = async (path: string) => {
    setLoading(true);
    try {
      const res = await api.get(`/api/scans/${scanId}/impact-analysis`, {
        params: { targetPath: path }
      });
      setImpactData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculateImpact(selectedPath);
  }, [scanId, selectedPath]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header & Target Input */}
      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <div style={{ background: 'rgba(244,63,94,0.15)', padding: '0.5rem', borderRadius: '10px' }}>
            <Zap size={22} color="#f43f5e" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>"What Breaks If I Change This?"</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Multi-level impact propagation engine. Predicts direct and indirect dependents across components.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.25rem' }}>
          <input
            type="text"
            value={selectedPath}
            onChange={(e) => setSelectedPath(e.target.value)}
            placeholder="Target file path (e.g., AuthService.java)"
            style={{ flex: 1, padding: '0.75rem 1rem', background: 'var(--bg-dark)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: '#fff', fontSize: '0.9rem' }}
          />
          <button className="btn-primary" onClick={() => calculateImpact(selectedPath)} disabled={loading}>
            {loading ? 'Propagating...' : 'Calculate Impact Score'}
          </button>
        </div>
      </div>

      {/* Impact Score Metrics Card */}
      {impactData && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>IMPACT SCORE</div>
            <div style={{ fontSize: '3.5rem', fontWeight: 900, color: impactData.impactScore > 60 ? '#f87171' : '#fbbf24' }}>
              {impactData.impactScore}/100
            </div>
            <span className={`badge ${impactData.impactScore > 60 ? 'badge-danger' : 'badge-warning'}`} style={{ marginTop: '0.5rem' }}>
              {impactData.impactLevel} RISK IMPACT
            </span>
          </div>

          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>Dependency Chain Breakdown</h3>

            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-cyan)', marginBottom: '0.5rem' }}>
                DIRECT DEPENDENTS ({impactData.directDependents?.length || 0})
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {(impactData.directDependents || []).map((dep) => (
                  <span key={dep} className="badge badge-info" style={{ textTransform: 'none' }}>
                    <FileCode size={12} /> {dep}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-purple)', marginBottom: '0.5rem' }}>
                INDIRECT DEPENDENTS ({impactData.indirectDependents?.length || 0})
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {(impactData.indirectDependents || []).map((dep) => (
                  <span key={dep} className="badge badge-purple" style={{ textTransform: 'none' }}>
                    <FileCode size={12} /> {dep}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
