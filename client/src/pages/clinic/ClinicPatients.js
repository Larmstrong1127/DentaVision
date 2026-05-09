import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ClinicNav } from '../../components/shared/NavBar';
import api from '../../utils/api';

export default function ClinicPatients() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const fetchPatients = async (q = '') => {
    setLoading(true);
    try {
      const { data } = await api.get(`/clinics/patients?search=${q}&limit=50`);
      setPatients(data.patients || []);
      setTotal(data.total || 0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPatients(); }, []);

  useEffect(() => {
    const t = setTimeout(() => fetchPatients(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  const urgencyColor = (p) => {
    const allFindings = p.treatmentPlans?.flatMap(pl => pl.findings || []) || [];
    if (allFindings.some(f => f.priority === 'urgent')) return 'urgent';
    if (allFindings.some(f => f.priority === 'moderate')) return 'moderate';
    return null;
  };

  return (
    <div className="page">
      <ClinicNav />
      <main className="container" style={{ padding: '32px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-sans)', fontWeight: '600', fontSize: '1.5rem', marginBottom: '4px' }}>Patients</h1>
            <p style={{ color: 'var(--ink-tertiary)', fontSize: '0.875rem' }}>{total} total registered</p>
          </div>
          <Link to="/clinic/scan" className="btn btn-primary">+ Scan New Plan</Link>
        </div>

        <div style={{ marginBottom: '20px', position: 'relative' }}>
          <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '1rem', color: 'var(--ink-tertiary)' }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            style={{ paddingLeft: '40px' }} />
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}><span className="spinner" /></div>
        ) : patients.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <p style={{ fontSize: '2rem', marginBottom: '12px' }}>👥</p>
            <p style={{ fontWeight: '500', marginBottom: '6px' }}>{search ? 'No patients match your search' : 'No patients yet'}</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--ink-tertiary)' }}>
              {!search && 'Share your clinic registration code with patients so they can link their accounts.'}
            </p>
          </div>
        ) : (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>
                  {['Patient', 'Plans', 'Last scan', 'Engagement', 'Status', ''].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.8125rem', fontWeight: '500', color: 'var(--ink-tertiary)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {patients.map(p => {
                  const urg = urgencyColor(p);
                  const lastPlan = p.treatmentPlans?.[p.treatmentPlans.length - 1];
                  return (
                    <tr key={p._id} style={{ borderBottom: '1px solid var(--border)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                      onMouseLeave={e => e.currentTarget.style.background = ''}>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'var(--teal-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8125rem', fontWeight: '600', color: 'var(--teal-dark)', flexShrink: 0 }}>
                            {p.firstName[0]}{p.lastName[0]}
                          </div>
                          <div>
                            <p style={{ fontWeight: '500', fontSize: '0.9375rem' }}>{p.firstName} {p.lastName}</p>
                            <p style={{ fontSize: '0.8125rem', color: 'var(--ink-tertiary)' }}>{p.email}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '0.9rem', color: 'var(--ink-secondary)' }}>
                        {p.treatmentPlans?.length || 0}
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '0.875rem', color: 'var(--ink-tertiary)' }}>
                        {lastPlan ? new Date(lastPlan.scanDate).toLocaleDateString() : '—'}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--ink-tertiary)' }}>
                          <span>{p.engagement?.planViewCount || 0} views</span>
                          <span style={{ margin: '0 6px' }}>·</span>
                          <span>{p.engagement?.questionsAsked || 0} Qs</span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        {urg ? <span className={`badge badge-${urg}`}>{urg}</span> : <span className="badge badge-gray">OK</span>}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <Link to={`/clinic/patients/${p._id}`} style={{ fontSize: '0.875rem', color: 'var(--teal)' }}>View →</Link>
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
