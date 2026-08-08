import React, { useEffect, useState } from 'react';
import { AlertTriangle, Shield, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import { TechnicalDebtItem } from '../types';

export const TechnicalDebtView: React.FC<{ scanId: string }> = ({ scanId }) => {
  const [items, setItems] = useState<TechnicalDebtItem[]>([]);

  useEffect(() => {
    api.get(`/api/scans/${scanId}/technical-debt`).then((res) => {
      setItems(res.data.items || []);
    });
  }, [scanId]);

  const renderSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'CRITICAL': return <span className="badge badge-danger">CRITICAL</span>;
      case 'HIGH': return <span className="badge badge-warning">HIGH</span>;
      case 'MEDIUM': return <span className="badge badge-purple">MEDIUM</span>;
      default: return <span className="badge badge-info">LOW</span>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="glass-card">
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem' }}>
          Technical Debt Audit & Code Smell Findings
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Detected God classes, long methods, high cyclomatic complexity, hardcoded configurations, and unresolved TODO annotations.
        </p>
      </div>

      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-subtle)', textAlign: 'left' }}>
              <th style={{ padding: '0.85rem 1.25rem' }}>Severity</th>
              <th style={{ padding: '0.85rem 1.25rem' }}>Category</th>
              <th style={{ padding: '0.85rem 1.25rem' }}>File & Line</th>
              <th style={{ padding: '0.85rem 1.25rem' }}>Finding Description</th>
              <th style={{ padding: '0.85rem 1.25rem' }}>Refactoring Guidance</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Zero critical technical debt findings detected in this codebase scan.
                </td>
              </tr>
            ) : (
              items.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.85rem 1.25rem' }}>{renderSeverityBadge(item.severity)}</td>
                  <td style={{ padding: '0.85rem 1.25rem', fontWeight: 600, color: '#fff' }}>{item.category}</td>
                  <td style={{ padding: '0.85rem 1.25rem', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {item.filePath}:{item.lineNumber}
                  </td>
                  <td style={{ padding: '0.85rem 1.25rem', color: '#fff' }}>{item.description}</td>
                  <td style={{ padding: '0.85rem 1.25rem', color: 'var(--text-muted)' }}>{item.recommendation}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
