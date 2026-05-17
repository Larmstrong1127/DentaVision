import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminNav from './AdminNav';
import api from '../../utils/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats')
      .then(({ data }) => setStats(data))
      .catch((err) => setError(err.response?.data?.error || 'Failed to load stats'))
      .finally(() => setLoading(false));
  }, []);

  const statCards = stats ? [
    { label: 'Total Clinics', value: stats.totalClinics, color: 'var(--teal)' },
    { label: 'Pending Review', value: stats.pendingClinics, color: 'var(--moderate)' },
    { label: 'Total Consultations', value: stats.totalConsultations, color: 'var(--watch)' },
    { label: 'New Consultations', value: stats.newConsultations, color: 'var(--healthy)' },
  ] : [];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-2)' }}>
      <AdminNav />
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '32px 20px' }}>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '8px' }}>Admin Dashboard</h1>
        <p style={{ color: 'var(--ink-tertiary)', marginBottom: '32px', fontSize: '0.9rem' }}>
          Overview of DentaVision platform activity
        </p>

        {error && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px' }}><div className="spinner" /></div>
        ) : (
          <>
            {/* Stat cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
              {statCards.map(({ label, value, color }) => (
                <div key={label} className="card" style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2.5rem', fontWeight: '700', color, lineHeight: '1' }}>{value}</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--ink-secondary)', marginTop: '8px' }}>{label}</div>
                </div>
              ))}
            </div>

            {/* Quick links */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px,1fr))', gap: '16px' }}>
              <div className="card">
                <h3 style={{ fontFamily: 'var(--font-sans)', fontWeight: '600', marginBottom: '8px', fontSize: '1rem' }}>
                  Clinic Management
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--ink-secondary)', marginBottom: '16px' }}>
                  Review pending clinic applications, approve or reject registrations.
                </p>
                <Link to="/admin/clinics" className="btn btn-primary btn-sm">Manage Clinics →</Link>
              </div>
              <div className="card">
                <h3 style={{ fontFamily: 'var(--font-sans)', fontWeight: '600', marginBottom: '8px', fontSize: '1rem' }}>
                  Consultation Requests
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--ink-secondary)', marginBottom: '16px' }}>
                  Follow up on demo requests and track lead status.
                </p>
                <Link to="/admin/consultations" className="btn btn-primary btn-sm">View Consultations →</Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
