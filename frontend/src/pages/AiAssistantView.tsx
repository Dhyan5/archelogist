import React, { useState } from 'react';
import { Bot, Send, Shield, FileCode, Sparkles } from 'lucide-react';
import { api } from '../services/api';

export const AiAssistantView: React.FC<{ scanId: string; onSelectFile?: (filePath: string) => void }> = ({ scanId, onSelectFile }) => {
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string; citations?: any[] }>>([
    {
      sender: 'ai',
      text: 'Hello! I am your Software Archaeology AI Assistant. Ask me anything about this repository\'s architecture, database, security, or dependencies.'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sampleQuestions = [
    "What database does this project use?",
    "Where is authentication implemented?",
    "Which module has the highest risk and technical debt?",
    "What happens when a user logs in?"
  ];

  const handleSend = async (questionText?: string) => {
    const q = questionText || input;
    if (!q.trim()) return;

    const userMsg = { sender: 'user' as const, text: q };
    setMessages(prev => [...prev, userMsg]);
    if (!questionText) setInput('');
    setLoading(true);

    try {
      const res = await api.post(`/api/scans/${scanId}/ai/query`, { question: q });
      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: res.data.answer,
          citations: res.data.evidenceCitations
        }
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', height: 'calc(100vh - 140px)' }}>
      {/* Header */}
      <div className="glass-card" style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: 'var(--primary)', padding: '0.5rem', borderRadius: '10px', display: 'flex' }}>
            <Bot size={22} color="#fff" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>Evidence-Grounded AI Repository Assistant</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Answers reference actual repository files with zero hallucinations.</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {sampleQuestions.map((sq, idx) => (
            <button key={idx} className="btn-secondary" style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }} onClick={() => handleSend(sq)}>
              {sq}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="glass-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', padding: '1.5rem' }}>
        {messages.map((m, idx) => (
          <div key={idx} style={{ display: 'flex', gap: '0.75rem', justifyContent: m.sender === 'user' ? 'flex-end' : 'flex-start' }}>
            {m.sender === 'ai' && (
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Bot size={18} color="#fff" />
              </div>
            )}

            <div style={{
              maxWidth: '650px',
              padding: '1rem 1.25rem',
              borderRadius: 'var(--radius-lg)',
              background: m.sender === 'user' ? 'var(--primary)' : 'var(--bg-card-hover)',
              color: '#fff',
              fontSize: '0.9rem',
              border: m.sender === 'ai' ? '1px solid var(--border-color)' : 'none'
            }}>
              <div>{m.text}</div>

              {m.citations && m.citations.length > 0 && (
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', marginTop: '0.75rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: '0.5rem' }}>
                    EVIDENCE CITATIONS ({m.citations.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    {m.citations.map((c, cIdx) => (
                      <div
                        key={cIdx}
                        onClick={() => onSelectFile && onSelectFile(c.filePath)}
                        style={{
                          fontSize: '0.8rem',
                          fontFamily: 'var(--font-mono)',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem'
                        }}
                      >
                        <FileCode size={14} color="var(--primary)" />
                        <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{c.filePath}:{c.line}</span> — {c.snippet}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input Form */}
      <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} style={{ display: 'flex', gap: '0.75rem' }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask a question about this codebase..."
          style={{ flex: 1, padding: '0.85rem 1.25rem', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: '#fff', fontSize: '0.95rem', outline: 'none' }}
        />
        <button type="submit" className="btn-primary" disabled={loading || !input.trim()}>
          <Send size={18} /> {loading ? 'Thinking...' : 'Send Query'}
        </button>
      </form>
    </div>
  );
};
