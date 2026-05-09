import React, { useState, useEffect, useRef } from 'react';
import { PatientNav } from '../../components/shared/NavBar';
import api from '../../utils/api';

export default function PatientEducation() {
  const [topics, setTopics] = useState([]);
  const [messages, setMessages] = useState([
    { role: 'assistant', text: "Hi! I'm your dental health guide. Ask me anything about your treatment plan, procedures, or how to take better care of your teeth. I'm here to help you understand — not to replace your dentist's advice." }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    api.get('/education/topics').then(r => setTopics(r.data.topics || []));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    if (!text.trim() || loading) return;
    const question = text.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: question }]);
    setLoading(true);
    try {
      const { data } = await api.post('/education/ask', { question });
      setMessages(prev => [...prev, { role: 'assistant', text: data.answer }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Sorry, I had trouble answering that. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <PatientNav />
      <main className="container" style={{ padding: '32px 20px', maxWidth: '680px' }}>

        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontFamily: 'var(--font-sans)', fontWeight: '600', fontSize: '1.5rem', marginBottom: '4px' }}>Learn & ask</h1>
          <p style={{ color: 'var(--ink-tertiary)', fontSize: '0.875rem' }}>Plain-language answers to your dental questions</p>
        </div>

        {/* Topic chips */}
        <div style={{ marginBottom: '20px' }}>
          <p style={{ fontSize: '0.8125rem', fontWeight: '500', color: 'var(--ink-secondary)', marginBottom: '10px' }}>Quick topics</p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {topics.map(t => (
              <button key={t.id} onClick={() => sendMessage(t.question)}
                style={{ padding: '7px 14px', border: '1.5px solid var(--border)', borderRadius: '20px', background: 'var(--surface)', fontSize: '0.8125rem', cursor: 'pointer', fontFamily: 'var(--font-sans)', color: 'var(--ink-secondary)', transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--teal)'; e.currentTarget.style.color = 'var(--teal-dark)'; e.currentTarget.style.background = 'var(--teal-light)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--ink-secondary)'; e.currentTarget.style.background = 'var(--surface)'; }}>
                {t.icon} {t.title}
              </button>
            ))}
          </div>
        </div>

        {/* Chat window */}
        <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '480px' }}>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', gap: '10px', alignItems: 'flex-start' }}>
                {m.role === 'assistant' && (
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>
                    🦷
                  </div>
                )}
                <div style={{
                  maxWidth: '80%', padding: '12px 16px', borderRadius: m.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  background: m.role === 'user' ? 'var(--teal)' : 'var(--surface-3)',
                  color: m.role === 'user' ? 'white' : 'var(--ink)',
                  fontSize: '0.9375rem', lineHeight: '1.6',
                  whiteSpace: 'pre-wrap'
                }}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '10px', alignItems: 'center' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--teal)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🦷</div>
                <div style={{ background: 'var(--surface-3)', borderRadius: '18px 18px 18px 4px', padding: '12px 18px' }}>
                  <span className="spinner" style={{ width: '16px', height: '16px' }} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '14px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: '10px', background: 'var(--surface)' }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage(input))}
              placeholder="Ask anything about your dental care…"
              style={{ flex: 1, borderRadius: '20px' }}
              disabled={loading}
            />
            <button className="btn btn-primary" style={{ borderRadius: '50%', width: '44px', height: '44px', padding: 0, fontSize: '1.1rem' }}
              onClick={() => sendMessage(input)} disabled={loading || !input.trim()}>
              ↑
            </button>
          </div>
        </div>

        {/* Disclaimer */}
        <p style={{ fontSize: '0.75rem', color: 'var(--ink-tertiary)', marginTop: '10px', textAlign: 'center', lineHeight: '1.5' }}>
          DentaVision is an educational tool. Always follow your dentist's professional recommendations.
        </p>
      </main>
    </div>
  );
}
