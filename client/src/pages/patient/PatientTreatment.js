import React, { useState, useEffect } from 'react';
import { PatientNav } from '../../components/shared/NavBar';
import api from '../../utils/api';

const PRIORITY_COLOR = {
  urgent:   { bg: 'var(--urgent-bg)',   border: 'var(--urgent-border)',   text: 'var(--urgent)',   label: 'Urgent' },
  moderate: { bg: 'var(--moderate-bg)', border: 'var(--moderate-border)', text: 'var(--moderate)', label: 'Moderate' },
  watch:    { bg: 'var(--watch-bg)',     border: 'var(--watch-border)',     text: 'var(--watch)',    label: 'Monitor' },
  healthy:  { bg: 'var(--healthy-bg)',   border: 'var(--healthy-border)',   text: 'var(--healthy)',  label: 'Healthy' },
};

const PRIORITY_ORDER = { urgent: 0, moderate: 1, watch: 2, healthy: 3 };

function PriorityBadge({ priority }) {
  const c = PRIORITY_COLOR[priority] || PRIORITY_COLOR.healthy;
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:'4px', fontSize:'0.72rem', fontWeight:'600',
      padding:'2px 9px', borderRadius:'20px', background:c.bg, color:c.text, border:`1px solid ${c.border}` }}>
      {priority === 'urgent' ? '⚠ ' : priority === 'moderate' ? '● ' : priority === 'watch' ? '○ ' : '✓ '}
      {c.label}
    </span>
  );
}

export default function PatientTreatment() {
  const [plans, setPlans]         = useState([]);
  const [activePlan, setActivePlan] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [confirmed, setConfirmed] = useState([]); // visit numbers confirmed by patient
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);
  const [expanded, setExpanded]   = useState({}); // visitNumber → boolean

  useEffect(() => {
    api.get('/scan/my-plans').then(r => {
      const p = r.data.plans || [];
      setPlans(p);
      if (p.length > 0) {
        const latest = p[p.length - 1];
        setActivePlan(latest);
        setConfirmed(latest.acceptedVisits || []);
        // Auto-expand all visits initially
        const exp = {};
        (latest.appointments || []).forEach(a => { exp[a.visitNumber] = true; });
        setExpanded(exp);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const toggleVisit = (visitNum) => {
    setConfirmed(prev =>
      prev.includes(visitNum) ? prev.filter(v => v !== visitNum) : [...prev, visitNum]
    );
    setSaved(false);
  };

  const toggleExpand = (visitNum) => {
    setExpanded(prev => ({ ...prev, [visitNum]: !prev[visitNum] }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post(`/scan/plan/${activePlan._id}/accept`, { acceptedVisits: confirmed });
      setSaved(true);
    } catch {}
    setSaving(false);
  };

  // Sort appointments by priority then visit number
  const appointments = (activePlan?.appointments || [])
    .slice()
    .sort((a, b) => {
      const pd = (PRIORITY_ORDER[a.priority] ?? 3) - (PRIORITY_ORDER[b.priority] ?? 3);
      return pd !== 0 ? pd : a.visitNumber - b.visitNumber;
    });

  const totalVisits    = appointments.length;
  const urgentCount    = appointments.filter(a => a.priority === 'urgent').length;

  return (
    <div className="page">
      <PatientNav />
      <main className="container" style={{ padding:'32px 20px', maxWidth:'720px' }}>

        {/* Header */}
        <div style={{ marginBottom:'28px' }}>
          <h1 style={{ fontFamily:'var(--font-serif)', fontWeight:'400', fontSize:'1.75rem', marginBottom:'6px' }}>
            Your treatment plan
          </h1>
          <p style={{ color:'var(--ink-tertiary)', fontSize:'0.875rem' }}>
            Review your upcoming visits and confirm the ones you'd like to proceed with.
          </p>
        </div>

        {loading ? (
          <div style={{ display:'flex', justifyContent:'center', padding:'80px 0' }}>
            <span className="spinner" />
          </div>

        ) : activePlan ? (
          <>
            {/* AI Summary */}
            {activePlan.aiSummary && (
              <div style={{ background:'var(--teal-light)', border:'1px solid rgba(15,123,108,0.2)',
                borderRadius:'var(--r-lg)', padding:'16px 20px', marginBottom:'24px',
                display:'flex', gap:'12px', alignItems:'flex-start' }}>
                <span style={{ fontSize:'1.25rem', flexShrink:0 }}>🦷</span>
                <p style={{ fontSize:'0.9rem', lineHeight:'1.65', color:'var(--teal-dark)', margin:0 }}>
                  {activePlan.aiSummary}
                </p>
              </div>
            )}

            {/* Plan selector (multiple plans) */}
            {plans.length > 1 && (
              <div style={{ marginBottom:'20px' }}>
                <p style={{ fontSize:'0.8125rem', fontWeight:'500', color:'var(--ink-secondary)', marginBottom:'8px' }}>
                  Treatment plan history
                </p>
                <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
                  {plans.map((p, i) => (
                    <button key={p._id} onClick={() => {
                      setActivePlan(p);
                      setConfirmed(p.acceptedVisits || []);
                      setSaved(false);
                      const exp = {};
                      (p.appointments || []).forEach(a => { exp[a.visitNumber] = true; });
                      setExpanded(exp);
                    }} style={{
                      padding:'6px 14px', borderRadius:'20px', fontSize:'0.8125rem',
                      border:`1.5px solid ${activePlan._id === p._id ? 'var(--teal)' : 'var(--border)'}`,
                      background: activePlan._id === p._id ? 'var(--teal-light)' : 'var(--surface)',
                      color: activePlan._id === p._id ? 'var(--teal-dark)' : 'var(--ink-secondary)',
                      cursor:'pointer', fontWeight: activePlan._id === p._id ? '500' : '400'
                    }}>
                      Plan {i + 1} — {new Date(p.scanDate).toLocaleDateString()}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {appointments.length === 0 ? (
              <div className="card" style={{ textAlign:'center', padding:'48px 20px' }}>
                <p style={{ fontSize:'1.75rem', marginBottom:'10px' }}>✅</p>
                <p style={{ fontWeight:'500', marginBottom:'6px' }}>All clear — no treatment needed</p>
                <p style={{ fontSize:'0.875rem', color:'var(--ink-tertiary)' }}>Your latest scan shows all teeth are healthy.</p>
              </div>
            ) : (
              <>
                {/* Stats row */}
                <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:'12px', marginBottom:'24px' }}>
                  {[
                    { label:'Total visits', value: totalVisits },
                    { label:'Urgent visits', value: urgentCount, warn: urgentCount > 0 },
                  ].map(s => (
                    <div key={s.label} className="card" style={{ textAlign:'center', padding:'16px 12px' }}>
                      <p style={{ fontSize:'1.4rem', fontWeight:'700',
                        color: s.warn ? 'var(--urgent)' : 'var(--ink)' }}>{s.value}</p>
                      <p style={{ fontSize:'0.75rem', color:'var(--ink-tertiary)', marginTop:'3px' }}>{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Visit cards */}
                <div style={{ display:'flex', flexDirection:'column', gap:'12px', marginBottom:'20px' }}>
                  {appointments.map((appt) => {
                    const isConfirmed = confirmed.includes(appt.visitNumber);
                    const isOpen      = expanded[appt.visitNumber];
                    const c           = PRIORITY_COLOR[appt.priority] || PRIORITY_COLOR.healthy;

                    return (
                      <div key={appt.visitNumber} style={{
                        background: isConfirmed ? 'var(--teal-light)' : 'var(--surface)',
                        border: `1.5px solid ${isConfirmed ? 'var(--teal)' : 'var(--border)'}`,
                        borderRadius:'var(--r-lg)',
                        overflow:'hidden',
                        transition:'border-color 0.15s, background 0.15s',
                        boxShadow:'var(--shadow-sm)',
                      }}>

                        {/* Visit header — click to expand/collapse */}
                        <div onClick={() => toggleExpand(appt.visitNumber)} style={{
                          display:'flex', alignItems:'center', justifyContent:'space-between',
                          padding:'16px 20px', cursor:'pointer', gap:'12px'
                        }}>
                          <div style={{ display:'flex', alignItems:'center', gap:'14px', flex:1, minWidth:0 }}>
                            {/* Visit number circle */}
                            <div style={{
                              width:'36px', height:'36px', borderRadius:'50%', flexShrink:0,
                              background: isConfirmed ? 'var(--teal)' : c.bg,
                              border: `2px solid ${isConfirmed ? 'var(--teal)' : c.border}`,
                              display:'flex', alignItems:'center', justifyContent:'center',
                              fontSize:'0.8rem', fontWeight:'700',
                              color: isConfirmed ? 'white' : c.text
                            }}>
                              {isConfirmed ? '✓' : `V${appt.visitNumber}`}
                            </div>
                            <div style={{ minWidth:0 }}>
                              <p style={{ fontWeight:'600', fontSize:'0.9375rem',
                                color: isConfirmed ? 'var(--teal-dark)' : 'var(--ink)',
                                whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                                {appt.visitLabel || `Visit ${appt.visitNumber}`}
                              </p>
                              <div style={{ display:'flex', gap:'8px', alignItems:'center', marginTop:'4px', flexWrap:'wrap' }}>
                                <PriorityBadge priority={appt.priority} />
                                <span style={{ fontSize:'0.78rem', color:'var(--ink-tertiary)' }}>
                                  {appt.procedures?.length || 0} procedure{appt.procedures?.length !== 1 ? 's' : ''}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div style={{ display:'flex', alignItems:'center', gap:'10px', flexShrink:0 }}>
                            {/* Confirm toggle */}
                            <button onClick={e => { e.stopPropagation(); toggleVisit(appt.visitNumber); }}
                              style={{
                                padding:'6px 14px', borderRadius:'20px', fontSize:'0.8rem', fontWeight:'600',
                                border: isConfirmed ? 'none' : '1.5px solid var(--border)',
                                background: isConfirmed ? 'var(--teal)' : 'transparent',
                                color: isConfirmed ? 'white' : 'var(--ink-secondary)',
                                cursor:'pointer', transition:'all 0.15s', whiteSpace:'nowrap'
                              }}>
                              {isConfirmed ? '✓ Confirmed' : 'Confirm'}
                            </button>
                            {/* Expand chevron */}
                            <span style={{ color:'var(--ink-tertiary)', fontSize:'0.75rem',
                              transition:'transform 0.2s', display:'inline-block',
                              transform: isOpen ? 'rotate(180deg)' : 'none' }}>▼</span>
                          </div>
                        </div>

                        {/* Procedure list — collapsible */}
                        {isOpen && appt.procedures?.length > 0 && (
                          <div style={{ borderTop:`1px solid ${isConfirmed ? 'rgba(15,123,108,0.15)' : 'var(--border)'}`,
                            padding:'12px 20px 16px' }}>
                            <p style={{ fontSize:'0.75rem', fontWeight:'600', color:'var(--ink-tertiary)',
                              textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'10px' }}>
                              Procedures in this visit
                            </p>
                            <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                              {appt.procedures.map((proc, pi) => (
                                <div key={pi} style={{
                                  display:'flex', alignItems:'flex-start', gap:'12px',
                                  padding:'10px 12px', borderRadius:'var(--r-md)',
                                  background: isConfirmed ? 'rgba(15,123,108,0.06)' : 'var(--surface-2)',
                                  border:`1px solid ${isConfirmed ? 'rgba(15,123,108,0.12)' : 'var(--border)'}`,
                                }}>
                                  {/* Tooth number chip */}
                                  {proc.toothNumber && (
                                    <div style={{
                                      minWidth:'32px', height:'32px', borderRadius:'var(--r-sm)',
                                      background:'var(--surface-3)', border:'1px solid var(--border)',
                                      display:'flex', alignItems:'center', justifyContent:'center',
                                      fontSize:'0.7rem', fontWeight:'700', color:'var(--ink-secondary)',
                                      flexShrink:0
                                    }}>
                                      #{proc.toothNumber}
                                    </div>
                                  )}
                                  <div style={{ flex:1, minWidth:0 }}>
                                    <p style={{ fontWeight:'500', fontSize:'0.875rem', color:'var(--ink)', marginBottom:'2px' }}>
                                      {proc.procedureName || proc.condition || 'Procedure'}
                                    </p>
                                    <div style={{ display:'flex', gap:'8px', flexWrap:'wrap', alignItems:'center' }}>
                                      {proc.surfaces?.length > 0 && (
                                        <span style={{ fontSize:'0.75rem', color:'var(--ink-tertiary)' }}>
                                          Surfaces: {proc.surfaces.join(', ')}
                                        </span>
                                      )}
                                      {proc.cdtCodes?.length > 0 && (
                                        <span style={{ fontSize:'0.72rem', color:'var(--ink-tertiary)',
                                          background:'var(--surface-3)', padding:'1px 6px', borderRadius:'4px' }}>
                                          {proc.cdtCodes[0]}
                                        </span>
                                      )}
                                      <PriorityBadge priority={proc.priority} />
                                    </div>
                                    {proc.notes && (
                                      <p style={{ fontSize:'0.8125rem', color:'var(--ink-secondary)',
                                        marginTop:'4px', lineHeight:'1.5' }}>{proc.notes}</p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Save summary bar */}
                <div className="card" style={{ background:'var(--surface-3)', position:'sticky', bottom:'16px',
                  display:'flex', alignItems:'center', justifyContent:'space-between', gap:'16px', flexWrap:'wrap' }}>
                  <div style={{ display:'flex', gap:'20px' }}>
                    <div>
                      <p style={{ fontSize:'0.72rem', color:'var(--ink-tertiary)', marginBottom:'2px' }}>Confirmed</p>
                      <p style={{ fontWeight:'700', fontSize:'1.1rem' }}>{confirmed.length} of {totalVisits} visits</p>
                    </div>
                    <div>
                      <p style={{ fontSize:'0.72rem', color:'var(--ink-tertiary)', marginBottom:'2px' }}>Status</p>
                      <p style={{ fontWeight:'600', fontSize:'0.875rem',
                        color: saved ? 'var(--healthy)' : 'var(--ink-secondary)' }}>
                        {saved ? '✓ Shared with clinic' : 'Not yet saved'}
                      </p>
                    </div>
                  </div>
                  <button className="btn btn-primary" onClick={handleSave}
                    disabled={saving || confirmed.length === 0} style={{ flexShrink:0 }}>
                    {saving
                      ? <><span className="spinner" style={{ width:'16px', height:'16px' }} /> Saving…</>
                      : saved ? '✓ Saved' : 'Save & share with clinic'}
                  </button>
                </div>
              </>
            )}
          </>
        ) : (
          <div className="card" style={{ textAlign:'center', padding:'64px 20px' }}>
            <p style={{ fontSize:'2rem', marginBottom:'12px' }}>📋</p>
            <p style={{ fontWeight:'500', marginBottom:'8px' }}>No treatment plan yet</p>
            <p style={{ fontSize:'0.875rem', color:'var(--ink-tertiary)' }}>
              Your clinic will upload your plan after your appointment.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
