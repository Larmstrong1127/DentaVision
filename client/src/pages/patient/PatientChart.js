import React, { useState, useEffect } from 'react';
import { PatientNav } from '../../components/shared/NavBar';
import ToothChart, { SurfaceKey } from '../../components/chart/ToothChart';
import ToothDetail from '../../components/chart/ToothDetail';
import api from '../../utils/api';

export default function PatientChart() {
  const [plans, setPlans] = useState([]);
  const [activePlan, setActivePlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTooth, setSelectedTooth] = useState(null);
  const [selectedFinding, setSelectedFinding] = useState(null);
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    api.get('/scan/my-plans').then(r => {
      const p = r.data.plans || [];
      setPlans(p);
      if (p.length > 0) setActivePlan(p[p.length - 1]);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      <PatientNav />
      <main className="container" style={{ padding: '32px 20px', maxWidth: '900px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-sans)', fontWeight: '600', fontSize: '1.5rem', marginBottom: '4px' }}>My teeth</h1>
            <p style={{ color: 'var(--ink-tertiary)', fontSize: '0.875rem' }}>Tap any tooth to see details</p>
          </div>
          {plans.length > 1 && (
            <select value={activePlan?._id} onChange={e => {
              const p = plans.find(pl => pl._id === e.target.value);
              setActivePlan(p); setSelectedTooth(null);
            }} style={{ width: 'auto', fontSize: '0.875rem', padding: '6px 12px' }}>
              {[...plans].reverse().map(pl => (
                <option key={pl._id} value={pl._id}>{new Date(pl.scanDate).toLocaleDateString()}</option>
              ))}
            </select>
          )}
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
            <span className="spinner" />
          </div>
        ) : (
          <>
            {/* No-plan banner */}
            {!activePlan && (
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: '12px',
                background: 'var(--watch-bg)', border: '1px solid var(--watch-border)',
                borderRadius: 'var(--r-md)', padding: '14px 16px', marginBottom: '16px',
              }}>
                <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>🦷</span>
                <div>
                  <p style={{ fontWeight: '500', color: 'var(--watch)', marginBottom: '2px' }}>No treatment plan on file yet</p>
                  <p style={{ fontSize: '0.875rem', color: 'var(--ink-secondary)', lineHeight: '1.5' }}>
                    Your chart is shown below with all teeth healthy by default. Once your clinic scans in a treatment plan, this chart will update to reflect your actual findings. Tap any tooth to learn about it.
                  </p>
                </div>
              </div>
            )}

            {/* Chart card + surface key side by side */}
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', marginBottom: '16px' }}>

              {/* Chart card */}
              <div className="card" style={{ flex: 1, minWidth: 0 }}>
                <ToothChart
                  findings={activePlan?.findings || []}
                  onToothSelect={(n, f) => { setSelectedTooth(n); setSelectedFinding(f); }} />
                {selectedTooth && (
                  <ToothDetail
                    toothNumber={selectedTooth}
                    finding={selectedFinding}
                    onClose={() => { setSelectedTooth(null); setSelectedFinding(null); }} />
                )}
              </div>

              {/* Collapsible surface key — sits right beside the chart */}
              <div style={{ width: '190px', flexShrink: 0 }}>
                <div style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--r-lg)',
                  boxShadow: 'var(--shadow-sm)',
                  overflow: 'hidden',
                }}>
                  <button
                    onClick={() => setShowKey(k => !k)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '13px 14px', background: 'none', border: 'none',
                      cursor: 'pointer', textAlign: 'left', color: 'var(--ink)',
                      fontFamily: 'var(--font-sans)',
                    }}
                  >
                    <span style={{ fontSize: '1.05rem', lineHeight: 1 }}>🦷</span>
                    <span style={{ flex: 1, fontSize: '0.8rem', fontWeight: '600', lineHeight: '1.35' }}>
                      Learn about<br />tooth surfaces
                    </span>
                    <svg width="13" height="13" viewBox="0 0 14 14" fill="none"
                      style={{ flexShrink: 0, transition: 'transform 0.22s', transform: showKey ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                      <path d="M2 4.5L7 9.5L12 4.5" stroke="var(--ink-tertiary)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>

                  {showKey && (
                    <div style={{ borderTop: '1px solid var(--border)' }}>
                      <SurfaceKey />
                    </div>
                  )}
                </div>
              </div>

            </div>{/* end chart + key row */}

            {activePlan?.aiSummary && (
              <div className="card">
                <p style={{ fontSize: '0.75rem', color: 'var(--ink-tertiary)', marginBottom: '6px' }}>Your dentist's summary</p>
                <p style={{ fontSize: '0.9375rem', color: 'var(--ink-secondary)', lineHeight: '1.7' }}>{activePlan.aiSummary}</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
