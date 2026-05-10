import React, { useState, useRef } from 'react';
import { PatientNav } from '../../components/shared/NavBar';
import api from '../../utils/api';

/* ── Static quick-topic answers (no API call needed) ──────── */
const QUICK_TOPICS = [
  {
    id: 'root-canal',
    title: 'Root canal treatment',
    icon: '🦷',
    answer: `A root canal removes infected tissue from inside your tooth to save it — instead of pulling it out.\n\nYour dentist numbs the area completely, removes the infected pulp, cleans and seals the canal, then usually places a crown on top.\n\nMost people say it feels no worse than a regular filling. It actually relieves the throbbing pain caused by the infection. Your dentist will guide you on what to expect for your specific recovery.`
  },
  {
    id: 'cavity-filling',
    title: 'Cavity fillings',
    icon: '🔩',
    answer: `A filling restores a tooth damaged by decay. Your dentist removes the decayed area and fills it with a material chosen to best fit your needs — options vary and your dentist will recommend what's right for you.\n\nYour mouth will be numb throughout the procedure, so you should feel comfortable the entire time.\n\nMild sensitivity to hot and cold afterward is normal. Your dentist can advise on what to expect based on your specific situation.`
  },
  {
    id: 'crown',
    title: 'Dental crowns',
    icon: '👑',
    answer: `A crown is a custom cap that fits over your entire tooth. It's used when a tooth is too damaged for a filling alone — after a root canal, a large crack, or severe decay.\n\nYour dentist shapes the tooth, takes a mold, and places a temporary crown while your permanent one is crafted. The permanent crown is then cemented in place.\n\nHow long a crown holds up depends on your oral hygiene habits and individual factors — your dentist is the best person to speak with about what to expect.`
  },
  {
    id: 'gum-disease',
    title: 'Gum disease',
    icon: '🩸',
    answer: `Gum disease starts as gingivitis — red, puffy gums that bleed when you brush. At this stage it's fully reversible with better brushing, flossing, and a professional cleaning.\n\nIf untreated, it can progress to periodontitis, where gums pull away from teeth and bone is gradually lost. This stage requires a deep cleaning and more frequent checkups.\n\nEarly treatment makes a big difference — don't wait if your gums bleed regularly.`
  },
  {
    id: 'extraction',
    title: 'Tooth extraction',
    icon: '✂️',
    answer: `A tooth is extracted when it's too damaged to save — from decay, fracture, infection, or overcrowding.\n\nYour dentist numbs the area fully before removal. You'll feel pressure but no sharp pain. Afterward, biting on gauze helps a clot form to protect the site.\n\nAvoid straws, smoking, and hard foods while healing — this protects the clot and prevents a painful condition called dry socket. Your dentist will let you know what to watch for and when to follow up.`
  },
  {
    id: 'implant',
    title: 'Dental implants',
    icon: '⚙️',
    answer: `An implant is a small post placed into your jawbone, acting as an artificial tooth root. A custom crown is attached on top — it looks and feels like a natural tooth.\n\nThe process involves multiple stages: the post is placed, your bone fuses around it, then the crown is attached. It's considered one of the most durable tooth replacement options available.\n\nYour dentist can walk you through the material options, full process, and what to expect based on your individual case.`
  },
  {
    id: 'deep-cleaning',
    title: 'Deep cleaning (SRP)',
    icon: '✨',
    answer: `Scaling and root planing (SRP) goes deeper than a regular cleaning. It's done when gum disease has caused pockets to form between your teeth and gums.\n\nScaling removes plaque and tartar below the gumline. Root planing smooths root surfaces so gums can reattach and bacteria have less place to hide.\n\nYour mouth will be numb during the procedure. Some tenderness afterward is normal. Follow-up appointments will track how well your gums are responding.`
  },
  {
    id: 'prevention',
    title: 'Preventing cavities',
    icon: '🛡️',
    answer: `The basics work best:\n\n• Brush twice a day with fluoride toothpaste\n• Floss once a day — it reaches where brushing can't\n• Limit sugary and acidic drinks (soda, juice, sports drinks)\n• Drink fluoridated water when possible\n• Keep up with your regular dental checkups and cleanings\n\nDental sealants can also protect back teeth from decay. Consistency matters more than any fancy product.`
  },
];

/* ── Toothy — friendly cartoon tooth avatar ─────────────── */
function ToothyAvatar({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 46" fill="none">
      {/* Tooth body */}
      <path
        d="M6,20 C6,7 11,2 20,2 C29,2 34,7 34,20 L34,30 C34,39 30,45 27,43 C24,41 22,40 20,40 C18,40 16,41 13,43 C10,45 6,39 6,30 Z"
        fill="#F8F8F2" stroke="#C4A840" strokeWidth="1.8" strokeLinejoin="round"
      />
      {/* Eyes */}
      <ellipse cx="15.5" cy="18" rx="2.6" ry="2.8" fill="#1C3A5C"/>
      <ellipse cx="24.5" cy="18" rx="2.6" ry="2.8" fill="#1C3A5C"/>
      {/* Eye shine */}
      <circle cx="16.4" cy="16.6" r="1" fill="white"/>
      <circle cx="25.4" cy="16.6" r="1" fill="white"/>
      {/* Rosy cheeks */}
      <ellipse cx="11"  cy="24" rx="3.8" ry="2.2" fill="rgba(255,130,110,0.28)"/>
      <ellipse cx="29"  cy="24" rx="3.8" ry="2.2" fill="rgba(255,130,110,0.28)"/>
      {/* Smile */}
      <path d="M14,26 Q20,32 26,26" fill="none" stroke="#1C3A5C" strokeWidth="1.9" strokeLinecap="round"/>
    </svg>
  );
}

function ToothyBubble({ size = 36 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: 'linear-gradient(145deg, #0FA890, #0C7B6C)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 2px 8px rgba(12,123,108,0.36)',
    }}>
      <ToothyAvatar size={Math.round(size * 0.72)}/>
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────── */
export default function PatientEducation() {
  const [messages, setMessages] = useState([{
    role: 'assistant',
    text: "Hi! I'm Toothy, your friendly dental guide 😊\n\nAsk me anything about your treatment plan, procedures, or how to take better care of your teeth. I'm here to help you understand — not to replace your dentist's advice.",
  }]);
  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addMsg = (role, text) => setMessages(prev => [...prev, { role, text }]);

  // Topic buttons use local pre-built answers — zero API cost, instant response
  const handleTopicClick = (topic) => {
    if (loading) return;
    addMsg('user', topic.title);
    setTimeout(() => addMsg('assistant', topic.answer), 320);
  };

  // Free-text questions call Claude Haiku
  const sendMessage = async (text) => {
    if (!text.trim() || loading) return;
    const question = text.trim();
    setInput('');
    addMsg('user', question);
    setLoading(true);
    try {
      const { data } = await api.post('/education/ask', { question });
      addMsg('assistant', data.answer);
    } catch (err) {
      if (err.response?.status === 429) {
        addMsg('assistant', err.response.data?.message ||
          "You've reached today's question limit. Come back tomorrow — Toothy will be here! 😊");
      } else {
        addMsg('assistant', "Sorry, I had trouble with that one — please try again!");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <PatientNav />
      <main className="container" style={{ padding: '32px 20px', maxWidth: '680px' }}>

        {/* Header with Toothy */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
          <ToothyBubble size={54}/>
          <div>
            <h1 style={{ fontFamily: 'var(--font-sans)', fontWeight: '700', fontSize: '1.5rem', marginBottom: '2px' }}>
              Ask Toothy
            </h1>
            <p style={{ color: 'var(--ink-tertiary)', fontSize: '0.875rem' }}>
              Plain-language answers to your dental questions
            </p>
          </div>
        </div>

        {/* Quick topic chips */}
        <div style={{ marginBottom: '20px' }}>
          <p style={{ fontSize: '0.8125rem', fontWeight: '500', color: 'var(--ink-secondary)', marginBottom: '10px' }}>
            Quick topics — tap for an instant answer
          </p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {QUICK_TOPICS.map(t => (
              <button
                key={t.id}
                onClick={() => handleTopicClick(t)}
                disabled={loading}
                style={{
                  padding: '7px 14px', border: '1.5px solid var(--border)',
                  borderRadius: '20px', background: 'var(--surface)',
                  fontSize: '0.8125rem', cursor: loading ? 'default' : 'pointer',
                  fontFamily: 'var(--font-sans)', color: 'var(--ink-secondary)',
                  transition: 'all 0.15s', opacity: loading ? 0.55 : 1,
                }}
                onMouseEnter={e => { if (!loading) {
                  e.currentTarget.style.borderColor = 'var(--teal)';
                  e.currentTarget.style.color = 'var(--teal-dark)';
                  e.currentTarget.style.background = 'var(--teal-light)';
                }}}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.color = 'var(--ink-secondary)';
                  e.currentTarget.style.background = 'var(--surface)';
                }}
              >
                {t.icon} {t.title}
              </button>
            ))}
          </div>
        </div>

        {/* Chat window */}
        <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '480px' }}>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {messages.map((m, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-end', gap: '10px',
                justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
              }}>
                {m.role === 'assistant' && <ToothyBubble size={34}/>}
                <div style={{
                  maxWidth: '78%', padding: '11px 15px',
                  borderRadius: m.role === 'user' ? '18px 18px 4px 18px' : '4px 18px 18px 18px',
                  background: m.role === 'user' ? 'var(--teal)' : 'var(--surface-3)',
                  color: m.role === 'user' ? 'white' : 'var(--ink)',
                  fontSize: '0.9375rem', lineHeight: '1.65', whiteSpace: 'pre-wrap',
                }}>
                  {m.text}
                </div>
              </div>
            ))}

            {/* Animated typing dots */}
            {loading && (
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
                <ToothyBubble size={34}/>
                <div style={{
                  background: 'var(--surface-3)', borderRadius: '4px 18px 18px 18px',
                  padding: '14px 18px', display: 'flex', gap: '5px', alignItems: 'center',
                }}>
                  {[0,1,2].map(d => (
                    <span key={d} style={{
                      display: 'block', width: '7px', height: '7px',
                      borderRadius: '50%', background: 'var(--ink-tertiary)',
                      animation: 'toothyBounce 1.1s ease-in-out infinite',
                      animationDelay: `${d * 0.17}s`,
                    }}/>
                  ))}
                </div>
              </div>
            )}

            <div ref={bottomRef}/>
          </div>

          {/* Input bar */}
          <div style={{
            padding: '12px 14px', borderTop: '1px solid var(--border)',
            display: 'flex', gap: '10px', alignItems: 'center',
            background: 'var(--surface)',
          }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage(input))}
              placeholder="Ask Toothy anything about your dental care…"
              style={{ flex: 1, borderRadius: '20px' }}
              disabled={loading}
            />
            <button
              className="btn btn-primary"
              style={{ borderRadius: '50%', width: '42px', height: '42px', padding: 0, fontSize: '1.1rem', flexShrink: 0 }}
              onClick={() => sendMessage(input)}
              disabled={loading || !input.trim()}
            >↑</button>
          </div>
        </div>

        {/* Disclaimer */}
        <p style={{ fontSize: '0.75rem', color: 'var(--ink-tertiary)', marginTop: '10px', textAlign: 'center', lineHeight: '1.7', maxWidth: '520px', margin: '10px auto 0' }}>
          Toothy is an educational tool only and does not provide medical advice. Always follow your dentist's professional recommendations. Procedures, materials, timelines, and available resources may vary by provider, clinic, and individual patient needs. For questions specific to your care, please contact your dental office directly.
        </p>

      </main>

      <style>{`
        @keyframes toothyBounce {
          0%, 60%, 100% { transform: translateY(0);    opacity: 0.35; }
          30%            { transform: translateY(-6px); opacity: 1;    }
        }
      `}</style>
    </div>
  );
}
