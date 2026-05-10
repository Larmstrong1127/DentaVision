import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import useTheme from '../../hooks/useTheme';

// ── Theme toggle button ───────────────────────────────────────
function ThemeToggle() {
  const { dark, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      style={{
        width: '34px', height: '34px', borderRadius: 'var(--r-sm)',
        border: '1px solid var(--border)', background: 'var(--surface-2)',
        cursor: 'pointer', display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: '1rem',
        color: 'var(--ink-secondary)', flexShrink: 0,
        transition: 'background 0.15s, border-color 0.15s',
      }}
    >
      {dark ? '☀️' : '🌙'}
    </button>
  );
}

// ── Logo ─────────────────────────────────────────────────────
const Logo = () => (
  <Link
    to={useAuth().role === 'clinic' ? '/clinic' : useAuth().user ? '/my' : '/'}
    style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}
  >
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="8" fill="#0F7B6C"/>
      <path d="M16 6C11.5 6 8 9.5 8 14C8 17 9.5 19.5 12 21L11 26H21L20 21C22.5 19.5 24 17 24 14C24 9.5 20.5 6 16 6Z" fill="white" opacity="0.9"/>
      <path d="M14 14C14 12.9 14.9 12 16 12C17.1 12 18 12.9 18 14" stroke="#0F7B6C" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
    <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: 'var(--ink)', letterSpacing: '-0.01em' }}>
      DentaVision
    </span>
  </Link>
);

// ── Clinic Nav ────────────────────────────────────────────────
export const ClinicNav = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { to: '/clinic',          label: 'Dashboard' },
    { to: '/clinic/patients', label: 'Patients'  },
    { to: '/clinic/scan',     label: 'Scan Plan'  },
  ];

  const isActive = (to) =>
    to === '/clinic' ? location.pathname === '/clinic' : location.pathname.startsWith(to);

  return (
    <nav style={{
      background: 'var(--surface)', borderBottom: '1px solid var(--border)',
      position: 'sticky', top: 0, zIndex: 100,
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px' }}>
        <Logo />

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {links.map(l => (
            <Link key={l.to} to={l.to} style={{
              padding: '6px 14px', borderRadius: 'var(--r-sm)', fontSize: '0.9rem',
              fontWeight: isActive(l.to) ? '500' : '400',
              color: isActive(l.to) ? 'var(--teal)' : 'var(--ink-secondary)',
              background: isActive(l.to) ? 'var(--teal-light)' : 'transparent',
              textDecoration: 'none',
            }}>
              {l.label}
            </Link>
          ))}

          <div style={{ width: '1px', height: '24px', background: 'var(--border)', margin: '0 8px' }} />

          {/* Theme toggle */}
          <ThemeToggle />

          <div style={{ width: '8px' }} />

          {/* User menu */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                background: 'var(--surface-3)', border: '1px solid var(--border)',
                borderRadius: 'var(--r-sm)', padding: '5px 12px', cursor: 'pointer',
              }}
            >
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%', background: 'var(--teal)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontSize: '12px', fontWeight: '700',
              }}>
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <span style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--ink)' }}>
                {user?.name}
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--ink-tertiary)' }}>▾</span>
            </button>

            {menuOpen && (
              <div style={{
                position: 'absolute', right: 0, top: 'calc(100% + 6px)',
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 'var(--r-md)', boxShadow: 'var(--shadow-md)',
                minWidth: '180px', overflow: 'hidden', zIndex: 200,
              }}>
                <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--ink-tertiary)', marginBottom: '2px' }}>Clinic code</p>
                  <p style={{ fontSize: '0.9rem', fontWeight: '700', letterSpacing: '0.08em', color: 'var(--teal)' }}>
                    {user?.registrationCode}
                  </p>
                </div>
                <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)' }}>
                  <p style={{ fontSize: '0.78rem', color: 'var(--ink-tertiary)' }}>Signed in as</p>
                  <p style={{ fontSize: '0.8125rem', fontWeight: '500', color: 'var(--ink-secondary)', marginTop: '2px' }}>
                    {user?.name}
                  </p>
                </div>
                <button
                  onClick={() => { logout(); navigate('/'); }}
                  style={{
                    width: '100%', padding: '10px 14px', background: 'none', border: 'none',
                    textAlign: 'left', fontSize: '0.9rem', color: 'var(--urgent)', cursor: 'pointer',
                  }}
                >
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

// ── Patient Nav ───────────────────────────────────────────────
export const PatientNav = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { to: '/my',           label: 'Home'      },
    { to: '/my/chart',     label: 'My Teeth'  },
    { to: '/my/treatment', label: 'Treatment' },
    { to: '/my/learn',     label: 'Learn'     },
  ];

  return (
    <nav style={{
      background: 'var(--surface)', borderBottom: '1px solid var(--border)',
      position: 'sticky', top: 0, zIndex: 100,
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px' }}>
        <Logo />

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {links.map(l => (
            <Link key={l.to} to={l.to} style={{
              padding: '6px 14px', borderRadius: 'var(--r-sm)', fontSize: '0.9rem',
              fontWeight: location.pathname === l.to ? '500' : '400',
              color: location.pathname === l.to ? 'var(--teal)' : 'var(--ink-secondary)',
              background: location.pathname === l.to ? 'var(--teal-light)' : 'transparent',
              textDecoration: 'none',
            }}>
              {l.label}
            </Link>
          ))}

          <div style={{ width: '1px', height: '24px', background: 'var(--border)', margin: '0 8px' }} />

          {/* Theme toggle */}
          <ThemeToggle />

          <div style={{ width: '8px' }} />

          {/* User menu */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                background: 'var(--surface-3)', border: '1px solid var(--border)',
                borderRadius: 'var(--r-sm)', padding: '5px 12px', cursor: 'pointer',
              }}
            >
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%', background: 'var(--teal)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontSize: '12px', fontWeight: '700',
              }}>
                {user?.firstName?.[0]?.toUpperCase()}
              </div>
              <span style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--ink)' }}>
                {user?.firstName}
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--ink-tertiary)' }}>▾</span>
            </button>

            {menuOpen && (
              <div style={{
                position: 'absolute', right: 0, top: 'calc(100% + 6px)',
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 'var(--r-md)', boxShadow: 'var(--shadow-md)',
                minWidth: '160px', overflow: 'hidden', zIndex: 200,
              }}>
                <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)' }}>
                  <p style={{ fontSize: '0.78rem', color: 'var(--ink-tertiary)' }}>Signed in as</p>
                  <p style={{ fontSize: '0.8125rem', fontWeight: '500', color: 'var(--ink-secondary)', marginTop: '2px' }}>
                    {user?.firstName} {user?.lastName}
                  </p>
                </div>
                <button
                  onClick={() => { logout(); navigate('/'); }}
                  style={{
                    width: '100%', padding: '10px 14px', background: 'none', border: 'none',
                    textAlign: 'left', fontSize: '0.9rem', color: 'var(--urgent)', cursor: 'pointer',
                  }}
                >
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

export default Logo;
