import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function RegisterPatientPage() {
  const { code: urlCode } = useParams();
  const [form, setForm] = useState({ firstName:'', lastName:'', email:'', password:'', clinicCode: urlCode || '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const { data } = await api.post('/auth/patient/register', form);
      login(data.token, { ...data.user, role: 'patient' });
      navigate('/my');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'20px', background:'var(--surface-2)' }}>
      <Link to="/" style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'28px', textDecoration:'none' }}>
        <svg width="30" height="30" viewBox="0 0 32 32" fill="none"><rect width="32" height="32" rx="8" fill="#0F7B6C"/><path d="M16 6C11.5 6 8 9.5 8 14C8 17 9.5 19.5 12 21L11 26H21L20 21C22.5 19.5 24 17 24 14C24 9.5 20.5 6 16 6Z" fill="white" opacity="0.9"/></svg>
        <span style={{ fontFamily:'var(--font-serif)', fontSize:'1.2rem', color:'var(--ink)' }}>DentaVision</span>
      </Link>

      <div className="card" style={{ width:'100%', maxWidth:'440px' }}>
        <h2 style={{ fontFamily:'var(--font-sans)', fontWeight:'600', fontSize:'1.25rem', marginBottom:'4px' }}>Create your account</h2>
        <p style={{ fontSize:'0.875rem', color:'var(--ink-tertiary)', marginBottom:'20px' }}>View your treatment plan and learn about your dental care</p>

        {urlCode && (
          <div className="alert alert-success" style={{ marginBottom:'16px' }}>
            🏥 You've been invited by a dental clinic. Your clinic code is pre-filled below.
          </div>
        )}

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
            <div className="form-group">
              <label className="form-label">First name</label>
              <input value={form.firstName} onChange={set('firstName')} placeholder="Sarah" required />
            </div>
            <div className="form-group">
              <label className="form-label">Last name</label>
              <input value={form.lastName} onChange={set('lastName')} placeholder="Miller" required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" value={form.email} onChange={set('email')} placeholder="sarah@example.com" required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" value={form.password} onChange={set('password')} placeholder="Min. 8 characters" minLength={8} required />
          </div>
          <div className="form-group">
            <label className="form-label">Clinic code <span style={{ color:'var(--ink-tertiary)', fontWeight:'400' }}>(from your dental office)</span></label>
            <input value={form.clinicCode} onChange={set('clinicCode')} placeholder="e.g. SUNRIS48" style={{ textTransform:'uppercase', letterSpacing:'0.05em' }} />
            <p className="form-hint">You can add this later if you don't have it yet</p>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width:'100%' }} disabled={loading}>
            {loading ? <><span className="spinner" style={{width:'16px',height:'16px'}} /> Creating account…</> : 'Create account →'}
          </button>
        </form>

        <p style={{ textAlign:'center', fontSize:'0.875rem', color:'var(--ink-tertiary)', marginTop:'16px' }}>
          Already have an account? <Link to="/login?role=patient">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
