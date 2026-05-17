import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const PROVIDER_OPTIONS = ['1', '2-5', '6-10', '10+'];

export default function RequestDemoPage() {
  const [form, setForm] = useState({
    practiceName: '',
    contactName: '',
    email: '',
    phone: '',
    npi: '',
    providerCount: '',
    currentSoftware: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const { data } = await api.post('/consultations', form);
      setSuccess(data.message);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-2)' }}>
      {/* Nav */}
      <nav style={{ padding: '0 40px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="#0F7B6C"/>
            <path d="M16 6C11.5 6 8 9.5 8 14C8 17 9.5 19.5 12 21L11 26H21L20 21C22.5 19.5 24 17 24 14C24 9.5 20.5 6 16 6Z" fill="white" opacity="0.9"/>
          </svg>
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', color: 'var(--ink)' }}>DentaVision</span>
        </Link>
        <Link to="/login" className="btn btn-ghost btn-sm">Sign in</Link>
      </nav>

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '48px 20px' }}>
        {success ? (
          <div className="card" style={{ textAlign: 'center', padding: '48px 32px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>✅</div>
            <h2 style={{ marginBottom: '12px' }}>Request received!</h2>
            <p style={{ color: 'var(--ink-secondary)', marginBottom: '24px', lineHeight: '1.7' }}>
              {success}
            </p>
            <Link to="/" className="btn btn-primary">Back to home</Link>
          </div>
        ) : (
          <>
            <div style={{ textAlign: 'center', marginBottom: '36px' }}>
              <div className="badge badge-teal" style={{ marginBottom: '14px' }}>Request a Demo</div>
              <h1 style={{ fontSize: 'clamp(1.5rem,4vw,2.25rem)', marginBottom: '12px' }}>See DentaVision in action</h1>
              <p style={{ color: 'var(--ink-secondary)', lineHeight: '1.7', maxWidth: '480px', margin: '0 auto' }}>
                Fill out the form below and a member of our team will reach out within 1 business day to schedule your personalized demo.
              </p>
            </div>

            <div className="card">
              {error && <div className="alert alert-error">{error}</div>}

              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Practice Name <span style={{ color: 'var(--urgent)' }}>*</span></label>
                    <input
                      name="practiceName"
                      value={form.practiceName}
                      onChange={handleChange}
                      placeholder="Bright Smiles Dental"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Contact Name <span style={{ color: 'var(--urgent)' }}>*</span></label>
                    <input
                      name="contactName"
                      value={form.contactName}
                      onChange={handleChange}
                      placeholder="Dr. Jane Smith"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email <span style={{ color: 'var(--urgent)' }}>*</span></label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="jane@brightsmiles.com"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="(555) 000-0000"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">NPI Number</label>
                    <input
                      name="npi"
                      value={form.npi}
                      onChange={handleChange}
                      placeholder="1234567890"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Number of Providers</label>
                    <select name="providerCount" value={form.providerCount} onChange={handleChange}>
                      <option value="">Select...</option>
                      {PROVIDER_OPTIONS.map((o) => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Current Practice Software</label>
                    <input
                      name="currentSoftware"
                      value={form.currentSoftware}
                      onChange={handleChange}
                      placeholder="Dentrix, Eaglesoft, Open Dental, etc."
                    />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Anything else you'd like us to know?</label>
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Tell us about your practice goals, challenges, or specific questions..."
                      rows={4}
                      style={{ resize: 'vertical' }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%', marginTop: '8px' }}
                  disabled={submitting}
                >
                  {submitting ? <><span className="spinner" style={{ width: '16px', height: '16px' }} /> Sending...</> : 'Request my demo →'}
                </button>
                <p style={{ textAlign: 'center', fontSize: '0.8125rem', color: 'var(--ink-tertiary)', marginTop: '12px' }}>
                  No commitment required. We'll reach out within 1 business day.
                </p>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
