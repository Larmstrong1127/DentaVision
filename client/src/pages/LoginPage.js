import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function LoginPage() {
  const [params] = useSearchParams();
  const [role, setRole] = useState(params.get('role') || 'patient');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const { data } = await api.post(`/auth/${role}/login`, { email, password });
      login(data.token, { ...data.user, role });
      navigate(role === 'clinic' ? '/clinic' : '/my');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'20px', background:'var(--surface-2)' }}>
      <Link to="/" style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'32px', textDecoration:'none' }}>
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <rect width="32" height="32" rx="8" fill="#0F7B6C"/>
          <path d="M16 6C11.5 6 8 9.5 8 14C8 17 9.5 19.5 12 21L11 26H21L20 21C22.5 19.5 24 17 24 14C24 9.5 20.5 6 16 6Z" fill="white" opacity="0.9"/>
        </svg>
        <span style={{ fontFamily:'var(--font-serif)', fontSize:'1.3rem', color:'var(--ink)' }}>DentaVision</span>
      </Link>

      <div className="card" style={{ width:'100%', maxWidth:'420px' }}>
        <h2 style={{ fontFamily:'var(--font-sans)', fontWeight:'600', fontSize:'1.25rem', marginBottom:'6px' }}>Sign in</h2>
        <p style={{ fontSize:'0.875rem', color:'var(--ink-tertiary)', marginBottom:'20px' }}>Welcome back</p>

        {/* Role toggle */}
        <div style={{ display:'flex', background:'var(--surface-3)', borderRadius:'var(--r-md)', padding:'3px', marginBottom:'20px' }}>
          {['patient','clinic'].map(r => (
            <button key={r} onClick={() => setRole(r)} style={{
              flex:1, padding:'8px', border:'none', borderRadius:'var(--r-sm)', cursor:'pointer',
              fontSize:'0.875rem', fontWeight: role===r ? '500' : '400',
              background: role===r ? 'var(--surface)' : 'transparent',
              color: role===r ? 'var(--ink)' : 'var(--ink-tertiary)',
              boxShadow: role===r ? 'var(--shadow-sm)' : 'none',
              fontFamily: 'var(--font-sans)',
              transition:'all 0.15s'
            }}>
              {r === 'patient' ? '🦷 Patient' : '🏥 Clinic / Practice'}
            </button>
          ))}
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width:'100%', marginTop:'4px' }} disabled={loading}>
            {loading ? <><span className="spinner" style={{width:'16px',height:'16px'}} /> Signing in…</> : 'Sign in →'}
          </button>
        </form>

        <p style={{ textAlign:'center', fontSize:'0.875rem', color:'var(--ink-tertiary)', marginTop:'16px' }}>
          {role === 'clinic' ? (
            <>No account? <Link to="/register/clinic">Start free trial</Link></>
          ) : (
            <>No account? <Link to="/register/patient">Create patient account</Link></>
          )}
        </p>
      </div>
    </div>
  );
}
