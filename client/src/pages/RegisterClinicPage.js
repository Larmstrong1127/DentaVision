import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function RegisterClinicPage() {
  const [form, setForm] = useState({ name:'', email:'', password:'', phone:'', city:'', state:'' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const { data } = await api.post('/auth/clinic/register', {
        name: form.name, email: form.email, password: form.password, phone: form.phone,
        address: { city: form.city, state: form.state }
      });
      login(data.token, { ...data.user, role: 'clinic' });
      navigate('/clinic');
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

      <div className="card" style={{ width:'100%', maxWidth:'460px' }}>
        <h2 style={{ fontFamily:'var(--font-sans)', fontWeight:'600', fontSize:'1.25rem', marginBottom:'4px' }}>Register your clinic</h2>
        <p style={{ fontSize:'0.875rem', color:'var(--ink-tertiary)', marginBottom:'20px' }}>14-day free trial · No credit card required</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Practice name</label>
            <input value={form.name} onChange={set('name')} placeholder="Sunrise Dental Group" required />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" value={form.email} onChange={set('email')} placeholder="office@yourdental.com" required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" value={form.password} onChange={set('password')} placeholder="Min. 8 characters" minLength={8} required />
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
            <div className="form-group">
              <label className="form-label">Phone (optional)</label>
              <input value={form.phone} onChange={set('phone')} placeholder="(555) 000-0000" />
            </div>
            <div className="form-group">
              <label className="form-label">State</label>
              <input value={form.state} onChange={set('state')} placeholder="WA" maxLength={2} />
            </div>
          </div>

          <div style={{ background:'var(--teal-light)', border:'1px solid rgba(15,123,108,0.2)', borderRadius:'var(--r-md)', padding:'12px 14px', marginBottom:'16px' }}>
            <p style={{ fontSize:'0.8125rem', color:'var(--teal-dark)' }}>
              After registering, you'll receive a unique <strong>clinic code</strong> to share with your patients so they can link their accounts to your practice.
            </p>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width:'100%' }} disabled={loading}>
            {loading ? <><span className="spinner" style={{width:'16px',height:'16px'}} /> Creating account…</> : 'Create clinic account →'}
          </button>
        </form>

        <p style={{ textAlign:'center', fontSize:'0.875rem', color:'var(--ink-tertiary)', marginTop:'16px' }}>
          Already have an account? <Link to="/login?role=clinic">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
