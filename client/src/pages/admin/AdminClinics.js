import React, { useEffect, useState, useCallback } from 'react';
import AdminNav from './AdminNav';
import api from '../../utils/api';

const STATUS_STYLES = {
  pending:  { background: 'var(--moderate-bg)', color: 'var(--moderate)', border: '1px solid var(--moderate-border)' },
  approved: { background: 'var(--healthy-bg)', color: 'var(--healthy)', border: '1px solid var(--healthy-border)' },
  rejected: { background: 'var(--urgent-bg)', color: 'var(--urgent)', border: '1px solid var(--urgent-border)' },
};

export default function AdminClinics() {
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [flash, setFlash] = useState(null); // { type: 'success'|'error', msg }

  const load = useCallback(() => {
    setLoading(true);
    api.get('/admin/clinics')
      .then(({ data }) => setClinics(data.clinics))
      .catch((err) => showFlash('error', err.response?.data?.error || 'Failed to load clinics'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const showFlash = (type, msg) => {
    setFlash({ type, msg });
    setTimeout(() => setFlash(null), 4000);
  };

  const handleApprove = async (id) => {
    try {
      await api.put(`/admin/clinics/${id}/approve`);
      showFlash('success', 'Clinic approved.');
      load();
    } catch (err) {
      showFlash('error', err.response?.data?.error || 'Failed to approve clinic');
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt('Reason for rejection (optional):');
    if (reason === null) return; // canceled
    try {
      await api.put(`/admin/clinics/${id}/reject`, { reason });
      showFlash('success', 'Clinic rejected.');
      load();
    } catch (err) {
      showFlash('error', err.response?.data?.error || 'Failed to reject clinic');
    }
  };

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.875rem',
  };

  const thStyle = {
    textAlign: 'left',
    padding: '10px 12px',
    borderBottom: '2px solid var(--border)',
    color: 'var(--ink-secondary)',
    fontWeight: '600',
    fontSize: '0.8125rem',
    whiteSpace: 'nowrap',
  };

  const tdStyle = {
    padding: '12px',
    borderBottom: '1px solid var(--border)',
    verticalAlign: 'middle',
  };

  const badgeStyle = (status) => ({
    display: 'inline-block',
    padding: '3px 10px',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: '600',
    ...(STATUS_STYLES[status] || STATUS_STYLES.pending),
  });

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-2)' }}>
      <AdminNav />
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 20px' }}>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '8px' }}>Clinic Management</h1>
        <p style={{ color: 'var(--ink-tertiary)', marginBottom: '24px', fontSize: '0.9rem' }}>
          Review and manage clinic registrations
        </p>

        {flash && (
          <div className={`alert alert-${flash.type === 'success' ? 'success' : 'error'}`}>
            {flash.msg}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px' }}><div className="spinner" /></div>
        ) : clinics.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--ink-tertiary)' }}>
            No clinics found.
          </div>
        ) : (
          <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Practice Name</th>
                  <th style={thStyle}>Email</th>
                  <th style={thStyle}>NPI</th>
                  <th style={thStyle}>Providers</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Plan</th>
                  <th style={thStyle}>Date Applied</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {clinics.map((c) => (
                  <tr key={c._id}>
                    <td style={tdStyle}><strong>{c.name}</strong></td>
                    <td style={tdStyle}>{c.email}</td>
                    <td style={{ ...tdStyle, color: 'var(--ink-tertiary)' }}>{c.npi || '—'}</td>
                    <td style={{ ...tdStyle, textAlign: 'center' }}>{c.providerCount ?? '—'}</td>
                    <td style={tdStyle}>
                      <span style={badgeStyle(c.status)}>{c.status}</span>
                    </td>
                    <td style={{ ...tdStyle, textTransform: 'capitalize' }}>{c.subscription?.plan || 'trial'}</td>
                    <td style={{ ...tdStyle, color: 'var(--ink-tertiary)' }}>
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {c.status !== 'approved' && (
                          <button
                            className="btn btn-sm"
                            style={{ background: 'var(--healthy-bg)', color: 'var(--healthy)', border: '1px solid var(--healthy-border)' }}
                            onClick={() => handleApprove(c._id)}
                          >
                            Approve
                          </button>
                        )}
                        {c.status !== 'rejected' && (
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleReject(c._id)}
                          >
                            Reject
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
