import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ClinicNav } from '../../components/shared/NavBar';
import api from '../../utils/api';

export default function ClinicDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/clinics/dashboard').then(r => { setData(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <><ClinicNav /><div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'60vh'}}><span className="spinner" /></div></>;

  const { clinic, stats, recentPatients = [] } = data || {};

  return (
    <div className="page">
      <ClinicNav />
      <main className="container" style={{ padding:'32px 20px' }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'28px', flexWrap:'wrap', gap:'12px' }}>
          <div>
            <h1 style={{ fontFamily:'var(--font-sans)', fontWeight:'600', fontSize:'1.5rem', marginBottom:'4px' }}>
              Good morning, {clinic?.name} 👋
            </h1>
            <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
              <span className="badge badge-teal">Code: {clinic?.registrationCode}</span>
              <span className={`badge badge-${clinic?.subscription?.status === 'active' || clinic?.subscription?.status === 'trialing' ? 'healthy' : 'urgent'}`}>
                {clinic?.subscription?.plan} · {clinic?.subscription?.status}
              </span>
            </div>
          </div>
          <Link to="/clinic/scan" className="btn btn-primary">+ Scan Treatment Plan</Link>
        </div>

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px,1fr))', gap:'14px', marginBottom:'28px' }}>
          {[
            { label:'Total patients', value: stats?.totalPatients || 0 },
            { label:'Plans scanned', value: stats?.totalScans || 0 },
            { label:'Acceptance rate', value: `${stats?.acceptanceRate || 0}%` },
            { label:'Accepted value', value: `$${(stats?.totalTreatmentValue || 0).toLocaleString()}` },
          ].map(s => (
            <div key={s.label} style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--r-lg)', padding:'18px 20px', boxShadow:'var(--shadow-sm)' }}>
              <p style={{ fontSize:'0.8125rem', color:'var(--ink-tertiary)', marginBottom:'6px' }}>{s.label}</p>
              <p style={{ fontSize:'1.75rem', fontWeight:'600', color:'var(--ink)', lineHeight:1 }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px,1fr))', gap:'12px', marginBottom:'28px' }}>
          {[
            { to:'/clinic/scan', icon:'📄', title:'Scan a plan', desc:'Upload or photograph a treatment plan' },
            { to:'/clinic/patients', icon:'👥', title:'View patients', desc:'See all your registered patients' },
            { to:'/clinic/billing', icon:'💳', title:'Manage billing', desc:'Upgrade, downgrade, or update payment' },
          ].map(a => (
            <Link key={a.to} to={a.to} style={{ textDecoration:'none' }}>
              <div className="card" style={{ cursor:'pointer', transition:'transform 0.15s, box-shadow 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='var(--shadow-md)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow=''; }}>
                <div style={{ fontSize:'1.5rem', marginBottom:'8px' }}>{a.icon}</div>
                <p style={{ fontWeight:'500', marginBottom:'4px' }}>{a.title}</p>
                <p style={{ fontSize:'0.8125rem', color:'var(--ink-tertiary)' }}>{a.desc}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Recent patients */}
        <div className="card">
          <div className="card-header">
            <h3 style={{ fontFamily:'var(--font-sans)', fontWeight:'600', fontSize:'1rem' }}>Recent patients</h3>
            <Link to="/clinic/patients" style={{ fontSize:'0.875rem' }}>View all →</Link>
          </div>
          {recentPatients.length === 0 ? (
            <div style={{ textAlign:'center', padding:'40px 0', color:'var(--ink-tertiary)' }}>
              <p style={{ fontSize:'1.5rem', marginBottom:'8px' }}>🦷</p>
              <p>No patients yet. Share your clinic code <strong>{clinic?.registrationCode}</strong> to get started.</p>
            </div>
          ) : (
            <div>
              {recentPatients.map(p => (
                <Link key={p.id} to={`/clinic/patients/${p.id}`} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 0', borderBottom:'1px solid var(--border)', textDecoration:'none', color:'inherit' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                    <div style={{ width:'36px', height:'36px', borderRadius:'50%', background:'var(--teal-light)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.875rem', fontWeight:'600', color:'var(--teal-dark)', flexShrink:0 }}>
                      {p.name[0]}
                    </div>
                    <div>
                      <p style={{ fontWeight:'500', fontSize:'0.9375rem' }}>{p.name}</p>
                      <p style={{ fontSize:'0.8125rem', color:'var(--ink-tertiary)' }}>{p.planCount} plan{p.planCount !== 1 ? 's' : ''} · {p.latestPlanDate ? new Date(p.latestPlanDate).toLocaleDateString() : 'No scans yet'}</p>
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:'6px', alignItems:'center' }}>
                    {p.hasUrgent && <span className="badge badge-urgent">Urgent items</span>}
                    <span style={{ color:'var(--ink-tertiary)', fontSize:'1.1rem' }}>›</span>
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
