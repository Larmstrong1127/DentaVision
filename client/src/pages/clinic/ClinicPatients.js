import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ClinicNav } from '../../components/shared/NavBar';
import api from '../../utils/api';

// ── Shared styles ─────────────────────────────────────────────
const inputStyle = {
  width: '100%', padding: '9px 12px', border: '1.5px solid var(--border)',
  borderRadius: 'var(--r-md)', fontSize: '0.9rem', fontFamily: 'var(--font-sans)',
  background: 'var(--surface)', color: 'var(--ink)', outline: 'none',
  boxSizing: 'border-box', transition: 'border-color 0.15s',
};
const labelStyle = {
  display: 'block', fontSize: '0.72rem', fontWeight: '600', color: 'var(--ink-tertiary)',
  marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.45px',
};

const EMPTY = { firstName: '', lastName: '', dob: '', preferredName: '', email: '' };

// ── Analytics computed from patient list ──────────────────────
function computeAnalytics(patients) {
  const total            = patients.length;
  const withPlan         = patients.filter(p => p.treatmentPlans?.length > 0).length;
  const withUrgent       = patients.filter(p =>
    p.treatmentPlans?.[0]?.findings?.some(f => f.priority === 'urgent')
  ).length;
  const engaged          = patients.filter(p => (p.engagement?.planViewCount || 0) > 0).length;
  const engagementRate   = withPlan > 0 ? Math.round((engaged / withPlan) * 100) : 0;
  const thirtyDaysAgo    = new Date(); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const newThisMonth     = patients.filter(p => new Date(p.createdAt) >= thirtyDaysAgo).length;

  return { total, withPlan, withUrgent, engaged, engagementRate, newThisMonth };
}

// ── Stat card ─────────────────────────────────────────────────
function StatCard({ label, value, sub, accent, icon }) {
  return (
    <div style={{
      background: 'var(--surface)', border: `1.5px solid ${accent ? accent + '33' : 'var(--border)'}`,
      borderRadius: 'var(--r-lg)', padding: '16px 18px', boxShadow: 'var(--shadow-sm)',
      borderLeft: accent ? `4px solid ${accent}` : undefined,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <p style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--ink-tertiary)',
          textTransform: 'uppercase', letterSpacing: '0.45px' }}>{label}</p>
        {icon && <span style={{ fontSize: '1rem', opacity: 0.6 }}>{icon}</span>}
      </div>
      <p style={{ fontSize: '1.8rem', fontWeight: '700', color: accent || 'var(--ink)', lineHeight: 1, marginBottom: '4px' }}>
        {value}
      </p>
      {sub && <p style={{ fontSize: '0.75rem', color: 'var(--ink-tertiary)' }}>{sub}</p>}
    </div>
  );
}

export default function ClinicPatients() {
  const [fields, setFields]         = useState(EMPTY);
  const [patients, setPatients]     = useState([]);
  const [allPatients, setAllPatients] = useState([]); // full list for analytics
  const [loading, setLoading]       = useState(true);
  const [total, setTotal]           = useState(0);
  const [searched, setSearched]     = useState(false);
  const debounceRef = useRef(null);

  const hasQuery = Object.values(fields).some(v => v.trim().length > 0);

  const fetchAll = useCallback(async () => {
    try {
      const { data } = await api.get('/clinics/patients?limit=500');
      setAllPatients(data.patients || []);
      setTotal(data.total || 0);
    } catch {}
  }, []);

  const fetchPatients = useCallback(async (f = EMPTY) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: 100 });
      if (f.firstName)     params.set('firstName', f.firstName);
      if (f.lastName)      params.set('lastName',  f.lastName);
      if (f.preferredName) params.set('preferredName', f.preferredName);
      if (f.dob)           params.set('dob', f.dob);
      if (f.email)         params.set('search', f.email);
      const { data } = await api.get(`/clinics/patients?${params}`);
      setPatients(data.patients || []);
      setSearched(true);
    } catch {
      setPatients([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    fetchPatients();
  }, [fetchAll, fetchPatients]);

  const handleChange = (key, val) => {
    const updated = { ...fields, [key]: val };
    setFields(updated);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchPatients(updated), 350);
  };

  const handleClear = () => {
    setFields(EMPTY);
    fetchPatients(EMPTY);
  };

  const urgencyColor = (p) => {
    const findings = p.treatmentPlans?.[0]?.findings || [];
    if (findings.some(f => f.priority === 'urgent'))   return 'urgent';
    if (findings.some(f => f.priority === 'moderate')) return 'moderate';
    return null;
  };

  const analytics  = computeAnalytics(allPatients);
  const recentJoined = [...allPatients]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  return (
    <div className="page">
      <ClinicNav />
      <main className="container" style={{ padding: '32px 20px', maxWidth: '1100px' }}>

        {/* ── Page header ──────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-sans)', fontWeight: '700',
              fontSize: '1.5rem', marginBottom: '4px', color: 'var(--ink)' }}>Patients</h1>
            <p style={{ color: 'var(--ink-tertiary)', fontSize: '0.875rem' }}>
              {hasQuery
                ? `${patients.length} result${patients.length !== 1 ? 's' : ''} matching your search`
                : `${total} total registered`}
            </p>
          </div>
          <Link to="/clinic/scan" className="btn btn-primary">+ Scan New Plan</Link>
        </div>

        {/* ── Analytics strip ──────────────────────────────── */}
        {allPatients.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '12px', marginBottom: '24px' }}>
            <StatCard
              label="Total patients"
              value={analytics.total}
              sub={`${analytics.newThisMonth} joined last 30 days`}
              icon="👥"
            />
            <StatCard
              label="Active plans"
              value={analytics.withPlan}
              sub={`${analytics.total - analytics.withPlan} without a plan`}
              accent="var(--teal)"
              icon="📋"
            />
            <StatCard
              label="Needs attention"
              value={analytics.withUrgent}
              sub={analytics.withUrgent > 0 ? 'patients need priority care' : 'No priority cases'}
              accent={analytics.withUrgent > 0 ? 'var(--urgent)' : undefined}
              icon="🔔"
            />
            <StatCard
              label="Plan engagement"
              value={`${analytics.engagementRate}%`}
              sub={`${analytics.engaged} of ${analytics.withPlan} patients viewed their plan`}
              accent="var(--healthy)"
              icon="📊"
            />
          </div>
        )}

        {/* ── Search panel ─────────────────────────────────── */}
        <div style={{
          background: 'var(--surface)', border: '1.5px solid var(--border)',
          borderRadius: 'var(--r-lg)', padding: '20px 20px 16px', marginBottom: '20px',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', marginBottom: '14px' }}>
            <p style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--ink)',
              display: 'flex', alignItems: 'center', gap: '6px' }}>
              🔍 Search patients
            </p>
            {hasQuery && (
              <button onClick={handleClear} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: '0.8125rem', color: 'var(--ink-tertiary)',
                padding: '4px 8px', borderRadius: 'var(--r-sm)',
              }}>
                ✕ Clear all
              </button>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div>
              <label style={labelStyle}>First Name</label>
              <input style={inputStyle} placeholder="e.g. Jane"
                value={fields.firstName} onChange={e => handleChange('firstName', e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Last Name</label>
              <input style={inputStyle} placeholder="e.g. Smith"
                value={fields.lastName} onChange={e => handleChange('lastName', e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Preferred Name</label>
              <input style={inputStyle} placeholder="e.g. Jay"
                value={fields.preferredName} onChange={e => handleChange('preferredName', e.target.value)} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Date of Birth</label>
              <input type="date" style={inputStyle}
                value={fields.dob} onChange={e => handleChange('dob', e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Email</label>
              <input style={inputStyle} placeholder="e.g. jane@example.com"
                value={fields.email} onChange={e => handleChange('email', e.target.value)} />
            </div>
          </div>

          {hasQuery && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '12px' }}>
              {Object.entries(fields).map(([key, val]) => val.trim() ? (
                <span key={key} style={{
                  display: 'inline-flex', alignItems: 'center', gap: '5px',
                  padding: '3px 10px', borderRadius: '20px', fontSize: '0.78rem',
                  background: 'var(--teal-light)', color: 'var(--teal-dark)',
                  border: '1px solid rgba(15,123,108,0.2)', fontWeight: '500',
                }}>
                  {key === 'dob' ? 'DOB' : key.replace(/([A-Z])/g, ' $1').trim()}: {val}
                  <button onClick={() => handleChange(key, '')} style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--teal-dark)', fontSize: '0.9rem', padding: '0', lineHeight: 1,
                  }}>×</button>
                </span>
              ) : null)}
            </div>
          )}
        </div>

        {/* ── Recent signups (no search active) ────────────── */}
        {!hasQuery && recentJoined.length > 0 && (
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 'var(--r-lg)', marginBottom: '16px', overflow: 'hidden',
            boxShadow: 'var(--shadow-sm)',
          }}>
            <div style={{ padding: '12px 18px', background: 'var(--surface-2)',
              borderBottom: '1px solid var(--border)', display: 'flex',
              justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ fontWeight: '600', fontSize: '0.875rem', color: 'var(--ink)' }}>
                🆕 Recently registered
              </p>
              <span style={{ fontSize: '0.75rem', color: 'var(--ink-tertiary)' }}>
                Last {recentJoined.length} patients
              </span>
            </div>
            {recentJoined.map((p, idx) => {
              const urg  = urgencyColor(p);
              const plan = p.treatmentPlans?.[0] || null;
              const joinedAgo = (() => {
                const diff = Date.now() - new Date(p.createdAt);
                const days = Math.floor(diff / 86400000);
                if (days === 0) return 'Today';
                if (days === 1) return 'Yesterday';
                return `${days} days ago`;
              })();
              return (
                <Link key={p._id} to={`/clinic/patients/${p._id}`} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 18px', textDecoration: 'none', color: 'inherit',
                  borderBottom: idx < recentJoined.length - 1 ? '1px solid var(--border)' : 'none',
                  transition: 'background 0.12s',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                      background: 'var(--teal-light)', border: '1.5px solid rgba(15,123,108,0.2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.8125rem', fontWeight: '700', color: 'var(--teal-dark)',
                    }}>
                      {p.firstName?.[0]}{p.lastName?.[0]}
                    </div>
                    <div>
                      <p style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--ink)', marginBottom: '2px' }}>
                        {p.firstName} {p.lastName}
                        {p.preferredName && (
                          <span style={{ fontWeight: '400', color: 'var(--ink-tertiary)', marginLeft: '6px', fontSize: '0.8rem' }}>
                            ({p.preferredName})
                          </span>
                        )}
                      </p>
                      <p style={{ fontSize: '0.78rem', color: 'var(--ink-tertiary)' }}>
                        {joinedAgo} · {plan ? 'Plan scanned' : 'No plan yet'}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {urg && <span className={`badge badge-${urg}`}>{urg}</span>}
                    {!plan && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--ink-tertiary)',
                        border: '1px dashed var(--border)', borderRadius: '20px',
                        padding: '2px 8px' }}>No plan</span>
                    )}
                    <span style={{ color: 'var(--teal)', fontSize: '1rem' }}>›</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* ── Results table ─────────────────────────────────── */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <span className="spinner" />
          </div>

        ) : patients.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <p style={{ fontSize: '2rem', marginBottom: '12px' }}>{hasQuery ? '🔍' : '👥'}</p>
            <p style={{ fontWeight: '600', marginBottom: '6px', fontSize: '1rem', color: 'var(--ink)' }}>
              {hasQuery ? 'No patients match your search' : 'No patients yet'}
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--ink-tertiary)', maxWidth: '340px', margin: '0 auto' }}>
              {hasQuery
                ? 'Try adjusting your search — results match on any field.'
                : 'Share your clinic registration code with patients so they can connect to your clinic.'}
            </p>
            {hasQuery && (
              <button onClick={handleClear} className="btn btn-ghost btn-sm" style={{ marginTop: '16px' }}>
                Clear search
              </button>
            )}
          </div>

        ) : (
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 'var(--r-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)',
          }}>
            <div style={{ padding: '11px 18px', background: 'var(--surface-2)',
              borderBottom: '1px solid var(--border)', fontSize: '0.8125rem',
              color: 'var(--ink-tertiary)', fontWeight: '500' }}>
              {hasQuery
                ? `${patients.length} result${patients.length !== 1 ? 's' : ''} — showing all matches`
                : `All ${patients.length} patient${patients.length !== 1 ? 's' : ''}`}
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>
                  {['Patient', 'Date of Birth', 'Last Plan', 'Engagement', 'Status', ''].map(h => (
                    <th key={h} style={{
                      padding: '10px 16px', textAlign: 'left', fontSize: '0.72rem',
                      fontWeight: '600', color: 'var(--ink-tertiary)',
                      textTransform: 'uppercase', letterSpacing: '0.45px',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {patients.map((p, idx) => {
                  const urg  = urgencyColor(p);
                  const plan = p.treatmentPlans?.[0] || null;
                  return (
                    <tr key={p._id}
                      style={{ borderBottom: idx < patients.length - 1 ? '1px solid var(--border)' : 'none' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                      onMouseLeave={e => e.currentTarget.style.background = ''}>

                      <td style={{ padding: '13px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
                          <div style={{
                            width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                            background: 'var(--teal-light)', border: '1.5px solid rgba(15,123,108,0.2)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.8125rem', fontWeight: '700', color: 'var(--teal-dark)',
                          }}>
                            {p.firstName?.[0]}{p.lastName?.[0]}
                          </div>
                          <div>
                            <p style={{ fontWeight: '600', fontSize: '0.9375rem', color: 'var(--ink)', marginBottom: '1px' }}>
                              {p.firstName} {p.lastName}
                              {p.preferredName && (
                                <span style={{ fontWeight: '400', color: 'var(--ink-tertiary)',
                                  fontSize: '0.8rem', marginLeft: '5px' }}>
                                  ({p.preferredName})
                                </span>
                              )}
                            </p>
                            <p style={{ fontSize: '0.78rem', color: 'var(--ink-tertiary)' }}>{p.email}</p>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '13px 16px', fontSize: '0.875rem', color: 'var(--ink-secondary)' }}>
                        {p.dateOfBirth
                          ? new Date(p.dateOfBirth).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                          : <span style={{ color: 'var(--ink-tertiary)' }}>—</span>}
                      </td>

                      <td style={{ padding: '13px 16px', fontSize: '0.875rem', color: 'var(--ink-tertiary)' }}>
                        {plan
                          ? new Date(plan.scanDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                          : <span style={{ color: 'var(--ink-tertiary)', fontStyle: 'italic' }}>No plan</span>}
                      </td>

                      <td style={{ padding: '13px 16px' }}>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--ink-tertiary)',
                          display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span>{p.engagement?.planViewCount || 0} plan view{p.engagement?.planViewCount !== 1 ? 's' : ''}</span>
                          <span>{p.engagement?.questionsAsked || 0} question{p.engagement?.questionsAsked !== 1 ? 's' : ''}</span>
                        </div>
                      </td>

                      <td style={{ padding: '13px 16px' }}>
                        {urg
                          ? <span className={`badge badge-${urg}`}>{urg}</span>
                          : plan
                            ? <span className="badge badge-healthy">All clear</span>
                            : <span className="badge badge-gray">No plan</span>}
                      </td>

                      <td style={{ padding: '13px 16px' }}>
                        <Link to={`/clinic/patients/${p._id}`}
                          style={{ fontSize: '0.875rem', color: 'var(--teal)',
                            fontWeight: '500', whiteSpace: 'nowrap' }}>
                          View →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
