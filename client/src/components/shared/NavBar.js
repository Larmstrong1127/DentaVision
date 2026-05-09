import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Logo = () => (
  <Link to={useAuth().role === 'clinic' ? '/clinic' : useAuth().user ? '/my' : '/'} style={{ display:'flex', alignItems:'center', gap:'10px', textDecoration:'none' }}>
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="8" fill="#0F7B6C"/>
      <path d="M16 6C11.5 6 8 9.5 8 14C8 17 9.5 19.5 12 21L11 26H21L20 21C22.5 19.5 24 17 24 14C24 9.5 20.5 6 16 6Z" fill="white" opacity="0.9"/>
      <path d="M14 14C14 12.9 14.9 12 16 12C17.1 12 18 12.9 18 14" stroke="#0F7B6C" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
    <span style={{ fontFamily:'var(--font-serif)', fontSize:'1.25rem', color:'var(--ink)', letterSpacing:'-0.01em' }}>DentaVision</span>
  </Link>
);

export const ClinicNav = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { to: '/clinic', label: 'Dashboard' },
    { to: '/clinic/patients', label: 'Patients' },
    { to: '/clinic/scan', label: 'Scan Plan' },
  ];

  return (
    <nav style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 100 }}>
      <div className="container" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', height:'60px' }}>
        <Logo />
        <div style={{ display:'flex', alignItems:'center', gap:'4px' }}>
          {links.map(l => (
            <Link key={l.to} to={l.to} style={{
              padding: '6px 14px',
              borderRadius: 'var(--r-sm)',
              fontSize: '0.9rem',
              fontWeight: location.pathname === l.to ? '500' : '400',
              color: location.pathname === l.to ? 'var(--teal)' : 'var(--ink-secondary)',
              background: location.pathname === l.to ? 'var(--teal-light)' : 'transparent',
              textDecoration: 'none',
            }}>{l.label}</Link>
          ))}
          <div style={{ width:'1px', height:'24px', background:'var(--border)', margin:'0 8px' }} />
          <div style={{ position:'relative' }}>
            <button onClick={() => setMenuOpen(!menuOpen)} style={{
              display:'flex', alignItems:'center', gap:'8px',
              background:'var(--surface-3)', border:'none',
              borderRadius:'var(--r-sm)', padding:'6px 12px', cursor:'pointer'
            }}>
              <div style={{ width:'28px', height:'28px', borderRadius:'50%', background:'var(--teal)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:'12px', fontWeight:'600' }}>
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <span style={{ fontSize:'0.875rem', fontWeight:'500' }}>{user?.name}</span>
            </button>
            {menuOpen && (
              <div style={{ position:'absolute', right:0, top:'100%', marginTop:'6px', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--r-md)', boxShadow:'var(--shadow-md)', minWidth:'160px', overflow:'hidden', zIndex:200 }}>
                <div style={{ padding:'10px 14px', borderBottom:'1px solid var(--border)' }}>
                  <p style={{ fontSize:'0.8125rem', color:'var(--ink-tertiary)' }}>Clinic code</p>
                  <p style={{ fontSize:'0.875rem', fontWeight:'600', letterSpacing:'0.05em', color:'var(--teal)' }}>{user?.registrationCode}</p>
                </div>
                <button onClick={() => { logout(); navigate('/'); }} style={{ width:'100%', padding:'10px 14px', background:'none', border:'none', textAlign:'left', fontSize:'0.9rem', color:'var(--urgent)', cursor:'pointer' }}>
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export const PatientNav = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const links = [
    { to: '/my', label: 'Home' },
    { to: '/my/chart', label: 'My Teeth' },
    { to: '/my/treatment', label: 'Treatment' },
    { to: '/my/learn', label: 'Learn' },
  ];

  return (
    <nav style={{ background:'var(--surface)', borderBottom:'1px solid var(--border)', position:'sticky', top:0, zIndex:100 }}>
      <div className="container" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', height:'60px' }}>
        <Logo />
        <div style={{ display:'flex', alignItems:'center', gap:'4px' }}>
          {links.map(l => (
            <Link key={l.to} to={l.to} style={{
              padding:'6px 14px',
              borderRadius:'var(--r-sm)',
              fontSize:'0.9rem',
              fontWeight: location.pathname === l.to ? '500' : '400',
              color: location.pathname === l.to ? 'var(--teal)' : 'var(--ink-secondary)',
              background: location.pathname === l.to ? 'var(--teal-light)' : 'transparent',
              textDecoration:'none'
            }}>{l.label}</Link>
          ))}
          <div style={{ width:'1px', height:'24px', background:'var(--border)', margin:'0 8px' }} />
          <button onClick={() => { logout(); navigate('/'); }} style={{ background:'none', border:'1px solid var(--border)', borderRadius:'var(--r-sm)', padding:'6px 12px', fontSize:'0.875rem', color:'var(--ink-secondary)', cursor:'pointer' }}>
            Sign out
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Logo;
