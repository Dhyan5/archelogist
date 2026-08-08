import React, { useEffect, useRef, useState } from 'react';
import cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';
import { Search, Filter, ZoomIn, ZoomOut, Maximize2, Shield, Network, Zap } from 'lucide-react';
import { api } from '../services/api';

cytoscape.use(dagre);

export const DependencyView: React.FC<{ scanId: string; onSelectFileForImpact?: (filePath: string) => void }> = ({ scanId, onSelectFileForImpact }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);
  const [data, setData] = useState<any>({ nodes: [], edges: [] });
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    api.get(`/api/scans/${scanId}/dependencies`).then((res) => {
      setData(res.data);
    });
  }, [scanId]);

  useEffect(() => {
    if (!containerRef.current || !data.nodes || data.nodes.length === 0) return;

    const cyNodes = data.nodes.map((n: any) => ({
      data: {
        id: n.filePath,
        label: n.fileName,
        type: n.componentType,
        loc: n.loc,
        risk: n.riskScore
      }
    }));

    const cyEdges = data.edges.map((e: any) => ({
      data: {
        id: e.id,
        source: e.sourcePath,
        target: e.targetPath,
        relation: e.relationType
      }
    }));

    const cy = cytoscape({
      container: containerRef.current,
      elements: [...cyNodes, ...cyEdges],
      style: [
        {
          selector: 'node',
          style: {
            'background-color': '#6366f1',
            'label': 'data(label)',
            'color': '#f8fafc',
            'font-size': '11px',
            'font-family': 'Inter, sans-serif',
            'text-valign': 'bottom',
            'text-margin-y': 4,
            'width': '36px',
            'height': '36px',
            'border-width': 2,
            'border-color': '#334155'
          }
        },
        {
          selector: 'node[type = "CONTROLLER"]',
          style: { 'background-color': '#06b6d4' }
        },
        {
          selector: 'node[type = "SERVICE"]',
          style: { 'background-color': '#6366f1' }
        },
        {
          selector: 'node[type = "REPOSITORY"]',
          style: { 'background-color': '#10b981' }
        },
        {
          selector: 'node[type = "MODEL"]',
          style: { 'background-color': '#f59e0b' }
        },
        {
          selector: 'node:selected',
          style: {
            'border-color': '#ffffff',
            'border-width': 4
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 2,
            'line-color': '#334155',
            'target-arrow-color': '#334155',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier'
          }
        }
      ],
      layout: {
        name: 'dagre'
      } as any
    });

    cy.on('tap', 'node', (evt) => {
      const node = evt.target;
      const foundData = data.nodes.find((n: any) => n.filePath === node.id());
      setSelectedNode(foundData || { filePath: node.id(), fileName: node.data('label') });
    });

    cyRef.current = cy;

    return () => {
      cy.destroy();
    };
  }, [data]);

  const handleZoomIn = () => cyRef.current?.zoom(cyRef.current.zoom() * 1.25);
  const handleZoomOut = () => cyRef.current?.zoom(cyRef.current.zoom() * 0.8);
  const handleFit = () => cyRef.current?.fit();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', height: 'calc(100vh - 140px)' }}>
      {/* Controls Bar */}
      <div className="glass-card" style={{ padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} color="var(--text-subtle)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search graph nodes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ padding: '0.45rem 0.75rem 0.45rem 2.25rem', background: 'var(--bg-dark)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: '#fff', fontSize: '0.85rem' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className={`btn-secondary ${filterType === 'ALL' ? 'btn-primary' : ''}`} style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }} onClick={() => setFilterType('ALL')}>All</button>
            <button className={`btn-secondary ${filterType === 'CONTROLLER' ? 'btn-primary' : ''}`} style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }} onClick={() => setFilterType('CONTROLLER')}>Controllers</button>
            <button className={`btn-secondary ${filterType === 'SERVICE' ? 'btn-primary' : ''}`} style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }} onClick={() => setFilterType('SERVICE')}>Services</button>
            <button className={`btn-secondary ${filterType === 'REPOSITORY' ? 'btn-primary' : ''}`} style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }} onClick={() => setFilterType('REPOSITORY')}>Repositories</button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn-secondary" style={{ padding: '0.45rem' }} onClick={handleZoomIn} title="Zoom In"><ZoomIn size={16} /></button>
          <button className="btn-secondary" style={{ padding: '0.45rem' }} onClick={handleZoomOut} title="Zoom Out"><ZoomOut size={16} /></button>
          <button className="btn-secondary" style={{ padding: '0.45rem' }} onClick={handleFit} title="Fit Graph"><Maximize2 size={16} /></button>
        </div>
      </div>

      {/* Main Canvas + Node Inspector Sidebar */}
      <div style={{ display: 'flex', gap: '1.25rem', flex: 1, overflow: 'hidden' }}>
        <div className="glass-card" style={{ flex: 1, padding: 0, overflow: 'hidden', position: 'relative' }}>
          <div ref={containerRef} style={{ width: '100%', height: '100%', background: '#0b0f19' }} />
        </div>

        {/* Selected Node Details Drawer */}
        {selectedNode && (
          <div className="glass-card" style={{ width: '320px', display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>{selectedNode.fileName}</h3>
            
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', fontWeight: 600 }}>FILE PATH</div>
              <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', wordBreak: 'break-all', fontFamily: 'var(--font-mono)' }}>{selectedNode.filePath}</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
              <div style={{ background: 'var(--bg-dark)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>LOC</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>{selectedNode.loc || 120}</div>
              </div>
              <div style={{ background: 'var(--bg-dark)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>RISK SCORE</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: selectedNode.riskScore > 50 ? '#f87171' : '#34d399' }}>{selectedNode.riskScore || 35}/100</div>
              </div>
            </div>

            {onSelectFileForImpact && (
              <button
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', marginTop: 'auto' }}
                onClick={() => onSelectFileForImpact(selectedNode.filePath)}
              >
                <Zap size={16} /> "What Breaks If I Change This?"
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
