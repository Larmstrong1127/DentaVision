import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AdminNav() {
  const { logout } = useAuth();
  const location = useLocation();

  const links = [
    { to: '/admin', label: 'Dashboard', icon: '📊' },
    { to: '/admin/clinics', label: 'Clinics', icon: '🏥' },
    { to: '/admin/consultations', label: 'Consultations', icon: '📋' },
  ];

  const navStyle = {
    background: 'var(--surface)',
    borderBottom: '1px solid var(--border)',
    padding: '0 24px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    height: '56px',
    flexWrap: 'wrap',
  };

  const logoStyle = {
    fontFamily: 'var(--font-serif)',
    fontSize: '1.1rem',
    color: 'var(--teal)',
    marginRight: '16px',
    whiteSpace: 'nowrap',
  };

  const linkBase = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 14px',
    borderRadius: 'var(--r-md)',
    fontSize: '0.875rem',
    fontWeight: '500',
    textDecoration: 'none',
    transition: 'background 0.15s',
  };

  const activeStyle = {
    ...linkBase,
    background: 'var(--teal-light)',
    color: 'var(--teal)',
  };

  const inactiveStyle = {
    ...linkBase,
    color: 'var(--ink-secondary)',
  };

  const isActive = (to) =>
    to === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(to);

  return (
    <nav style={navStyle}>
      <span style={logoStyle}>DentaVision Admin</span>
      {links.map(({ to, label, icon }) => (
        <Link key={to} to={to} style={isActive(to) ? activeStyle : inactiveStyle}>
          {icon} {label}
        </Link>
      ))}
      <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px', alignItems: 'center' }}>
        <Link to="/clinic" style={{ ...inactiveStyle, color: 'var(--ink-tertiary)', fontSize: '0.8125rem' }}>
          Back to Clinic Portal
        </Link>
        <button
          onClick={logout}
          style={{ ...linkBase, background: 'none', border: 'none', color: 'var(--ink-tertiary)', fontSize: '0.8125rem', cursor: 'pointer' }}
        >
          Sign out
        </button>
      </div>
    </nav>
  );
}
