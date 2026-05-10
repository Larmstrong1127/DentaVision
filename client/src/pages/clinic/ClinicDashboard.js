import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ClinicNav } from '../../components/shared/NavBar';
import api from '../../utils/api';

// ── Helpers ───────────────────────────────────────────────────────────────────
function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function relativeDate(dateStr) {
  if (!dateStr) return '—';
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff < 30) return `${diff}d ago`;
  return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

// ── StatCard ──────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, accent }) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--r-lg)',
      padding: '18px 20px',
      boxShadow: 'var(--shadow-sm)',
      borderLeft: accent ? `4px solid ${accent}` : '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
        <span style={{ fontSize: '1.1rem' }}>{icon}</span>
        <p style={{ fontSize: '0.78rem', color: 'var(--ink-tertiary)', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {label}
        </p>
      </div>
      <p style={{ fontSize: '1.875rem', fontWeight: '700', color: 'var(--ink)', lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ fontSize: '0.78rem', color: 'var(--ink-tertiary)', marginTop: '4px' }}>{sub}</p>}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function ClinicDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/clinics/dashboard')
      .then(r => { setData(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <>
      <ClinicNav />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <span className="spinner" />
      </div>
    </>
  );

  const { clinic, stats = {}, recentPatients = [] } = data || {};
  const {
    totalPatients = 0,
    withPlan = 0,
    withUrgent = 0,
    newThisMonth = 0,
    activeThisMonth = 0,
    planEngagement = 0,
    acceptanceRate = 0,
    totalScans = 0,
  } = stats;

  const urgentAccent = withUrgent > 0 ? 'var(--urgent)' : undefined;

  return (
    <div className="page">
      <ClinicNav />
      <main className="container" style={{ padding: '32px 20px' }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-sans)', fontWeight: '600', fontSize: '1.5rem', marginBottom: '6px' }}>
              {greeting()}, {clinic?.name} 👋
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span className="badge badge-teal">Code: {clinic?.registrationCode}</span>
              {newThisMonth > 0 && (
                <span className="badge badge-healthy">+{newThisMonth} new this month</span>
              )}
            </div>
          </div>
          <Link to="/clinic/scan" className="btn btn-primary">+ New Scan</Link>
        </div>

        {/* ── Analytics Grid ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '14px', marginBottom: '28px' }}>
          <StatCard
            icon="👥"
            label="Total patients"
            value={totalPatients}
            sub={newThisMonth > 0 ? `+${newThisMonth} joined this month` : 'No new patients this month'}
          />
          <StatCard
            icon="📋"
            label="Active plans"
            value={withPlan}
            sub={`${planEngagement}% of patients have a plan`}
            accent="var(--teal)"
          />
          <StatCard
            icon="⚠️"
            label="Urgent attention"
            value={withUrgent}
            sub={withUrgent === 0 ? 'No urgent cases' : `${withUrgent} patient${withUrgent !== 1 ? 's need' : ' needs'} follow-up`}
            accent={urgentAccent}
          />
          <StatCard
            icon="🔬"
            label="Scans completed"
            value={totalScans}
            sub={`${activeThisMonth} patient${activeThisMonth !== 1 ? 's' : ''} active last 30 days`}
          />
        </div>

        {/* ── Engagement Row ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '28px' }}>
          {/* Plan coverage bar */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '18px 20px', boxShadow: 'var(--shadow-sm)' }}>
            <p style={{ fontSize: '0.78rem', color: 'var(--ink-tertiary)', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
              📊 Plan coverage
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--ink-secondary)' }}>Patients with a plan</span>
              <span style={{ fontWeight: '700', color: 'var(--teal)' }}>{planEngagement}%</span>
            </div>
            <div style={{ height: '8px', borderRadius: '4px', background: 'var(--surface-3)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${planEngagement}%`, background: 'var(--teal)', borderRadius: '4px', transition: 'width 0.6s ease' }} />
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--ink-tertiary)', marginTop: '8px' }}>
              {withPlan} of {totalPatients} registered patient{totalPatients !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Urgent breakdown */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '18px 20px', boxShadow: 'var(--shadow-sm)' }}>
            <p style={{ fontSize: '0.78rem', color: 'var(--ink-tertiary)', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
              🦷 Patient health overview
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
              {[
                { label: 'With urgent findings', count: withUrgent, color: 'var(--urgent)' },
                { label: 'With active plan', count: withPlan, color: 'var(--teal)' },
                { label: 'No plan yet', count: totalPatients - withPlan, color: 'var(--ink-tertiary)' },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: row.color, flexShrink: 0 }} />
                    <span style={{ fontSize: '0.8125rem', color: 'var(--ink-secondary)' }}>{row.label}</span>
                  </div>
                  <span style={{ fontWeight: '600', fontSize: '0.875rem', color: row.color }}>{row.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Acceptance rate */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '18px 20px', boxShadow: 'var(--shadow-sm)' }}>
            <p style={{ fontSize: '0.78rem', color: 'var(--ink-tertiary)', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
              ✅ Patient acceptance
            </p>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', marginBottom: '6px' }}>
              <span style={{ fontSize: '2rem', fontWeight: '700', color: acceptanceRate >= 60 ? 'var(--healthy)' : acceptanceRate >= 30 ? 'var(--moderate)' : 'var(--ink)', lineHeight: 1 }}>
                {acceptanceRate}%
              </span>
              <span style={{ fontSize: '0.8125rem', color: 'var(--ink-tertiary)', paddingBottom: '4px' }}>of recommended items</span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--ink-tertiary)' }}>
              {acceptanceRate >= 60 ? 'Strong engagement with recommendations' :
               acceptanceRate >= 30 ? 'Moderate acceptance — room to improve' :
               totalPatients === 0 ? 'No data yet' : 'Low acceptance — consider patient outreach'}
            </p>
          </div>
        </div>

        {/* ── Quick Actions ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '12px', marginBottom: '28px' }}>
          {[
            { to: '/clinic/scan',     icon: '📄', title: 'Scan a plan',    desc: 'Upload or photograph a treatment plan' },
            { to: '/clinic/patients', icon: '👥', title: 'View patients',  desc: 'Search and manage all registered patients' },
          ].map(a => (
            <Link key={a.to} to={a.to} style={{ textDecoration: 'none' }}>
              <div
                className="card"
                style={{ cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
              >
                <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>{a.icon}</div>
                <p style={{ fontWeight: '500', marginBottom: '4px' }}>{a.title}</p>
                <p style={{ fontSize: '0.8125rem', color: 'var(--ink-tertiary)' }}>{a.desc}</p>
              </div>
            </Link>
          ))}

          {/* Urgent shortcut — conditionally highlighted */}
          {withUrgent > 0 ? (
            <Link to="/clinic/patients" style={{ textDecoration: 'none' }}>
              <div
                style={{
                  background: 'var(--urgent-bg)', border: '1px solid var(--urgent-border)',
                  borderRadius: 'var(--r-lg)', padding: '20px', cursor: 'pointer',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
              >
                <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>🚨</div>
                <p style={{ fontWeight: '500', marginBottom: '4px', color: 'var(--urgent)' }}>Urgent follow-ups</p>
                <p style={{ fontSize: '0.8125rem', color: 'var(--urgent)', opacity: 0.8 }}>
                  {withUrgent} patient{withUrgent !== 1 ? 's require' : ' requires'} attention
                </p>
              </div>
            </Link>
          ) : (
            <div style={{
              background: 'var(--healthy-bg)', border: '1px solid var(--healthy-border)',
              borderRadius: 'var(--r-lg)', padding: '20px',
            }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>✅</div>
              <p style={{ fontWeight: '500', marginBottom: '4px', color: 'var(--healthy)' }}>All clear</p>
              <p style={{ fontSize: '0.8125rem', color: 'var(--healthy)', opacity: 0.8 }}>No urgent cases at this time</p>
            </div>
          )}
        </div>

        {/* ── Recent Patients ── */}
        <div className="card">
          <div className="card-header">
            <h3 style={{ fontFamily: 'var(--font-sans)', fontWeight: '600', fontSize: '1rem' }}>Recently registered</h3>
            <Link to="/clinic/patients" style={{ fontSize: '0.875rem' }}>View all →</Link>
          </div>

          {recentPatients.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--ink-tertiary)' }}>
              <p style={{ fontSize: '1.5rem', marginBottom: '8px' }}>🦷</p>
              <p>No patients yet.</p>
              <p style={{ fontSize: '0.875rem', marginTop: '6px' }}>
                Share your clinic code <strong style={{ color: 'var(--teal)' }}>{clinic?.registrationCode}</strong> to get started.
              </p>
            </div>
          ) : (
            <div>
              {recentPatients.map((p, i) => (
                <Link
                  key={p.id}
                  to={`/clinic/patients/${p.id}`}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '11px 0',
                    borderBottom: i < recentPatients.length - 1 ? '1px solid var(--border)' : 'none',
                    textDecoration: 'none', color: 'inherit',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '50%',
                      background: 'var(--teal-light)', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: '0.875rem', fontWeight: '600',
                      color: 'var(--teal-dark)', flexShrink: 0,
                    }}>
                      {p.name[0]}
                    </div>
                    <div>
                      <p style={{ fontWeight: '500', fontSize: '0.9375rem' }}>{p.name}</p>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--ink-tertiary)' }}>
                        Joined {relativeDate(p.joinedAt)}
                        {p.latestPlanDate ? ` · Plan: ${relativeDate(p.latestPlanDate)}` : ' · No plan yet'}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    {p.hasUrgent && <span className="badge badge-urgent">Urgent</span>}
                    {!p.planCount && <span className="badge badge-gray">No plan</span>}
                    <span style={{ color: 'var(--ink-tertiary)', fontSize: '1.1rem' }}>›</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
