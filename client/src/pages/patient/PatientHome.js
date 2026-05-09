import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PatientNav } from '../../components/shared/NavBar';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

export default function PatientHome() {
  const { user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [clinic, setClinic] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/scan/my-plans').then(r => {
      setPlans(r.data.plans || []);
      setClinic(r.data.clinic);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const latestPlan = plans[plans.length - 1];
  const urgentCount = latestPlan?.findings?.filter(f => f.priority === 'urgent').length || 0;
  const moderateCount = latestPlan?.findings?.filter(f => f.priority === 'moderate').length || 0;

  return (
    <div className="page">
      <PatientNav />
      <main className="container" style={{ padding: '32px 20px', maxWidth: '680px' }}>

        {/* Greeting */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontFamily: 'var(--font-sans)', fontWeight: '600', fontSize: '1.5rem', marginBottom: '4px' }}>
            Hi, {user?.firstName} 👋
          </h1>
          {clinic ? (
            <p style={{ color: 'var(--ink-tertiary)', fontSize: '0.9rem' }}>
              Patient at <strong>{clinic.name}</strong>
            </p>
          ) : (
            <p style={{ color: 'var(--ink-tertiary)', fontSize: '0.9rem' }}>Your dental health dashboard</p>
          )}
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}><span className="spinner" /></div>
        ) : latestPlan ? (
          <>
            {/* Status card */}
            {urgentCount > 0 && (
              <div style={{ background: 'var(--urgent-bg)', border: '1px solid var(--urgent-border)', borderRadius: 'var(--r-lg)', padding: '16px 18px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontWeight: '600', color: 'var(--urgent)', marginBottom: '2px' }}>⚠ Attention needed</p>
                  <p style={{ fontSize: '0.875rem', color: 'var(--ink-secondary)' }}>
                    {urgentCount} urgent item{urgentCount !== 1 ? 's' : ''} on your latest treatment plan
                  </p>
                </div>
                <Link to="/my/treatment" className="btn btn-sm" style={{ background: 'var(--urgent)', color: 'white', border: 'none' }}>View →</Link>
              </div>
            )}

            {/* AI summary */}
            {latestPlan.aiSummary && (
              <div className="card" style={{ marginBottom: '16px' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--ink-tertiary)', marginBottom: '6px' }}>
                  From your latest plan · {new Date(latestPlan.scanDate).toLocaleDateString()}
                </p>
                <p style={{ fontSize: '0.9375rem', color: 'var(--ink-secondary)', lineHeight: '1.7' }}>{latestPlan.aiSummary}</p>
              </div>
            )}

            {/* Quick stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '20px' }}>
              {[
                { label: 'Urgent', value: urgentCount, color: 'var(--urgent)', bg: 'var(--urgent-bg)' },
                { label: 'Moderate', value: moderateCount, color: 'var(--moderate)', bg: 'var(--moderate-bg)' },
              ].map(s => (
                <div key={s.label} style={{ background: s.bg, borderRadius: 'var(--r-md)', padding: '14px', textAlign: 'center' }}>
                  <p style={{ fontSize: '1.5rem', fontWeight: '700', color: s.color, lineHeight: 1 }}>{s.value}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--ink-tertiary)', marginTop: '4px' }}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* Navigation cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
              {[
                { to: '/my/chart', icon: '🦷', title: 'My tooth chart', desc: 'See all 32 teeth with 3 angle views' },
                { to: '/my/treatment', icon: '📋', title: 'Treatment plan', desc: 'View and understand your procedures' },
                { to: '/my/learn', icon: '🎓', title: 'Learn & ask', desc: 'Plain-language dental education' },
              ].map(c => (
                <Link key={c.to} to={c.to} style={{ textDecoration: 'none', gridColumn: c.to === '/my/learn' ? 'span 2' : undefined }}>
                  <div className="card" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', transition: 'transform 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = ''}>
                    <span style={{ fontSize: '1.5rem' }}>{c.icon}</span>
                    <div>
                      <p style={{ fontWeight: '500', marginBottom: '2px' }}>{c.title}</p>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--ink-tertiary)' }}>{c.desc}</p>
                    </div>
                    <span style={{ marginLeft: 'auto', color: 'var(--ink-tertiary)' }}>›</span>
                  </div>
                </Link>
              ))}
            </div>
          </>
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: '50px 20px' }}>
            <p style={{ fontSize: '2.5rem', marginBottom: '14px' }}>🦷</p>
            <h2 style={{ fontFamily: 'var(--font-sans)', fontWeight: '600', fontSize: '1.1rem', marginBottom: '8px' }}>
              No treatment plans yet
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--ink-secondary)', lineHeight: '1.6', maxWidth: '320px', margin: '0 auto 20px' }}>
              Ask your dental office to scan your treatment plan into DentaVision, or make sure you've entered your clinic code.
            </p>
            {!clinic && (
              <Link to="/my" className="btn btn-secondary btn-sm">Add clinic code</Link>
            )}
          </div>
        )}

        {/* No clinic linked */}
        {!clinic && (
          <div style={{ background: 'var(--watch-bg)', border: '1px solid var(--watch-border)', borderRadius: 'var(--r-lg)', padding: '16px 18px', marginTop: '16px' }}>
            <p style={{ fontWeight: '500', color: 'var(--watch)', marginBottom: '4px' }}>Link your dental clinic</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--ink-secondary)', marginBottom: '12px' }}>
              Enter the code from your dental office to connect your treatment plans.
            </p>
            <LinkClinicInline />
          </div>
        )}
      </main>
    </div>
  );
}

function LinkClinicInline() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleLink = async () => {
    if (!code.trim()) return;
    setLoading(true); setError('');
    try {
      const { data } = await api.post('/patients/link-clinic', { code });
      setSuccess(`Linked to ${data.clinic.name}!`);
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Code not found');
    } finally {
      setLoading(false);
    }
  };

  if (success) return <p style={{ color: 'var(--healthy)', fontWeight: '500' }}>✓ {success}</p>;

  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      <input value={code} onChange={e => setCode(e.target.value.toUpperCase())}
        placeholder="e.g. SUNRIS48" style={{ textTransform: 'uppercase', letterSpacing: '0.08em', flex: 1 }} />
      <button className="btn btn-primary btn-sm" onClick={handleLink} disabled={loading}>
        {loading ? <span className="spinner" style={{ width: '14px', height: '14px' }} /> : 'Link'}
      </button>
    </div>
  );
}
