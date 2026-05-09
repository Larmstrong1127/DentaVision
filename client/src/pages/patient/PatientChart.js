import React, { useState, useEffect } from 'react';
import { PatientNav } from '../../components/shared/NavBar';
import ToothChart from '../../components/chart/ToothChart';
import ToothDetail from '../../components/chart/ToothDetail';
import api from '../../utils/api';

export default function PatientChart() {
  const [plans, setPlans] = useState([]);
  const [activePlan, setActivePlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTooth, setSelectedTooth] = useState(null);
  const [selectedFinding, setSelectedFinding] = useState(null);

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
      <main className="container" style={{ padding: '32px 20px', maxWidth: '680px' }}>

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
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}><span className="spinner" /></div>
        ) : activePlan ? (
          <>
            <div className="card" style={{ marginBottom: '16px' }}>
              <ToothChart
                findings={activePlan.findings}
                onToothSelect={(n, f) => { setSelectedTooth(n); setSelectedFinding(f); }} />
              {selectedTooth && (
                <ToothDetail
                  toothNumber={selectedTooth}
                  finding={selectedFinding}
                  onClose={() => { setSelectedTooth(null); setSelectedFinding(null); }} />
              )}
            </div>

            {activePlan.aiSummary && (
              <div className="card">
                <p style={{ fontSize: '0.75rem', color: 'var(--ink-tertiary)', marginBottom: '6px' }}>Your dentist's summary</p>
                <p style={{ fontSize: '0.9375rem', color: 'var(--ink-secondary)', lineHeight: '1.7' }}>{activePlan.aiSummary}</p>
              </div>
            )}
          </>
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <p style={{ fontSize: '2rem', marginBottom: '12px' }}>🦷</p>
            <p style={{ fontWeight: '500', marginBottom: '8px' }}>No treatment plan scanned yet</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--ink-tertiary)' }}>Ask your dental office to scan your plan into DentaVision.</p>
          </div>
        )}
      </main>
    </div>
  );
}
