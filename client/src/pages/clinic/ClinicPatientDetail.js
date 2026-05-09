import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ClinicNav } from '../../components/shared/NavBar';
import ToothChart from '../../components/chart/ToothChart';
import ToothDetail from '../../components/chart/ToothDetail';
import api from '../../utils/api';

export default function ClinicPatientDetail() {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activePlan, setActivePlan] = useState(null);
  const [selectedTooth, setSelectedTooth] = useState(null);
  const [selectedFinding, setSelectedFinding] = useState(null);

  useEffect(() => {
    api.get(`/clinics/patients/${id}`).then(r => {
      setPatient(r.data.patient);
      if (r.data.patient.treatmentPlans?.length > 0) {
        setActivePlan(r.data.patient.treatmentPlans[r.data.patient.treatmentPlans.length - 1]);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  if (loading) return <><ClinicNav /><div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}><span className="spinner" /></div></>;
  if (!patient) return <><ClinicNav /><div className="container" style={{ padding: '40px 20px' }}><p>Patient not found.</p></div></>;

  return (
    <div className="page">
      <ClinicNav />
      <main className="container" style={{ padding: '32px 20px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <Link to="/clinic/patients" style={{ fontSize: '0.875rem', color: 'var(--ink-tertiary)', display: 'inline-flex', alignItems: 'center', gap: '4px', marginBottom: '8px', textDecoration: 'none' }}>
              ← Back to patients
            </Link>
            <h1 style={{ fontFamily: 'var(--font-sans)', fontWeight: '600', fontSize: '1.5rem', marginBottom: '4px' }}>
              {patient.firstName} {patient.lastName}
            </h1>
            <p style={{ color: 'var(--ink-tertiary)', fontSize: '0.875rem' }}>{patient.email} · {patient.phone || 'No phone'}</p>
          </div>
          <Link to={`/clinic/scan?patient=${id}`} className="btn btn-primary">+ Scan New Plan</Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px', alignItems: 'start' }}>

          {/* Left: chart */}
          <div>
            {activePlan ? (
              <>
                <div className="card" style={{ marginBottom: '16px' }}>
                  <div className="card-header">
                    <h3 style={{ fontFamily: 'var(--font-sans)', fontWeight: '600', fontSize: '1rem' }}>Tooth chart</h3>
                    <select value={activePlan._id} onChange={e => {
                      const p = patient.treatmentPlans.find(pl => pl._id === e.target.value);
                      setActivePlan(p); setSelectedTooth(null);
                    }} style={{ width: 'auto', fontSize: '0.8125rem', padding: '5px 10px' }}>
                      {[...patient.treatmentPlans].reverse().map(pl => (
                        <option key={pl._id} value={pl._id}>
                          {new Date(pl.scanDate).toLocaleDateString()}
                        </option>
                      ))}
                    </select>
                  </div>
                  <ToothChart findings={activePlan.findings} onToothSelect={(n, f) => { setSelectedTooth(n); setSelectedFinding(f); }} />
                  {selectedTooth && (
                    <ToothDetail toothNumber={selectedTooth} finding={selectedFinding} onClose={() => setSelectedTooth(null)} />
                  )}
                </div>

                {/* AI Summary */}
                {activePlan.aiSummary && (
                  <div className="card" style={{ marginBottom: '16px' }}>
                    <h3 style={{ fontFamily: 'var(--font-sans)', fontWeight: '600', fontSize: '1rem', marginBottom: '10px' }}>AI summary</h3>
                    <p style={{ fontSize: '0.9375rem', color: 'var(--ink-secondary)', lineHeight: '1.7' }}>{activePlan.aiSummary}</p>
                  </div>
                )}

                {/* Treatment list */}
                <div className="card">
                  <div className="card-header">
                    <h3 style={{ fontFamily: 'var(--font-sans)', fontWeight: '600', fontSize: '1rem' }}>Treatment items</h3>
                  </div>
                  {activePlan.findings.filter(f => f.priority !== 'healthy').sort((a, b) => {
                    const order = { urgent: 0, moderate: 1, watch: 2 };
                    return (order[a.priority] ?? 3) - (order[b.priority] ?? 3);
                  }).map((f, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                      <div>
                        <p style={{ fontWeight: '500', fontSize: '0.9375rem' }}>
                          Tooth #{f.toothNumber} — {f.procedureName || f.condition}
                        </p>
                        {f.surfaces?.length > 0 && (
                          <p style={{ fontSize: '0.8125rem', color: 'var(--ink-tertiary)', marginTop: '2px' }}>
                            Surfaces: {f.surfaces.join(', ')} · {f.visitCount || 1} visit{f.visitCount !== 1 ? 's' : ''}
                          </p>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
                        <span className={`badge badge-${f.priority}`}>{f.priority}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
                <p style={{ fontSize: '2rem', marginBottom: '12px' }}>📄</p>
                <p style={{ fontWeight: '500', marginBottom: '8px' }}>No treatment plans yet</p>
                <Link to="/clinic/scan" className="btn btn-primary btn-sm">Scan first plan</Link>
              </div>
            )}
          </div>

          {/* Right: patient info */}
          <div>
            <div className="card" style={{ marginBottom: '14px' }}>
              <h3 style={{ fontFamily: 'var(--font-sans)', fontWeight: '600', fontSize: '0.9375rem', marginBottom: '12px' }}>Engagement</h3>
              {[
                { label: 'Plan views', value: patient.engagement?.planViewCount || 0 },
                { label: 'Questions asked', value: patient.engagement?.questionsAsked || 0 },
                { label: 'Total logins', value: patient.engagement?.totalLogins || 0 },
                { label: 'Last login', value: patient.engagement?.lastLogin ? new Date(patient.engagement.lastLogin).toLocaleDateString() : 'Never' },
              ].map(s => (
                <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--ink-tertiary)' }}>{s.label}</span>
                  <span style={{ fontWeight: '500' }}>{s.value}</span>
                </div>
              ))}
            </div>

            <div className="card" style={{ marginBottom: '14px' }}>
              <h3 style={{ fontFamily: 'var(--font-sans)', fontWeight: '600', fontSize: '0.9375rem', marginBottom: '12px' }}>Education topics viewed</h3>
              {patient.engagement?.educationTopicsViewed?.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {patient.engagement.educationTopicsViewed.map(t => (
                    <span key={t} className="badge badge-gray" style={{ fontSize: '0.75rem' }}>{t}</span>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: '0.875rem', color: 'var(--ink-tertiary)' }}>No topics viewed yet</p>
              )}
            </div>

            <div className="card">
              <h3 style={{ fontFamily: 'var(--font-sans)', fontWeight: '600', fontSize: '0.9375rem', marginBottom: '12px' }}>Plan history</h3>
              {patient.treatmentPlans?.length > 0 ? [...patient.treatmentPlans].reverse().map(pl => (
                <button key={pl._id} onClick={() => setActivePlan(pl)} style={{
                  width: '100%', textAlign: 'left', padding: '10px 12px', border: `1.5px solid ${activePlan?._id === pl._id ? 'var(--teal)' : 'var(--border)'}`,
                  borderRadius: 'var(--r-md)', background: activePlan?._id === pl._id ? 'var(--teal-light)' : 'var(--surface)',
                  cursor: 'pointer', marginBottom: '8px', fontFamily: 'var(--font-sans)'
                }}>
                  <p style={{ fontWeight: '500', fontSize: '0.875rem', color: activePlan?._id === pl._id ? 'var(--teal-dark)' : 'var(--ink)' }}>
                    {new Date(pl.scanDate).toLocaleDateString()}
                  </p>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--ink-tertiary)' }}>
                    {pl.findings?.length || 0} findings · ${(pl.totalEstimate || 0).toLocaleString()}
                  </p>
                </button>
              )) : <p style={{ fontSize: '0.875rem', color: 'var(--ink-tertiary)' }}>No plans scanned yet</p>}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
