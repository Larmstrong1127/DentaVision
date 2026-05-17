import React, { useEffect, useState, useCallback } from 'react';
import AdminNav from './AdminNav';
import api from '../../utils/api';

const STATUS_OPTIONS = ['new', 'contacted', 'converted', 'declined'];

const STATUS_STYLES = {
  new:       { background: 'var(--watch-bg)', color: 'var(--watch)', border: '1px solid var(--watch-border)' },
  contacted: { background: 'var(--moderate-bg)', color: 'var(--moderate)', border: '1px solid var(--moderate-border)' },
  converted: { background: 'var(--healthy-bg)', color: 'var(--healthy)', border: '1px solid var(--healthy-border)' },
  declined:  { background: 'var(--urgent-bg)', color: 'var(--urgent)', border: '1px solid var(--urgent-border)' },
};

export default function AdminConsultations() {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [flash, setFlash] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    api.get('/admin/consultations')
      .then(({ data }) => setConsultations(data.consultations))
      .catch((err) => showFlash('error', err.response?.data?.error || 'Failed to load consultations'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const showFlash = (type, msg) => {
    setFlash({ type, msg });
    setTimeout(() => setFlash(null), 4000);
  };

  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/admin/consultations/${id}/status`, { status });
      setConsultations((prev) =>
        prev.map((c) => (c._id === id ? { ...c, status } : c))
      );
      showFlash('success', 'Status updated.');
    } catch (err) {
      showFlash('error', err.response?.data?.error || 'Failed to update status');
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
    ...(STATUS_STYLES[status] || STATUS_STYLES.new),
  });

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-2)' }}>
      <AdminNav />
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 20px' }}>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '8px' }}>Consultation Requests</h1>
        <p style={{ color: 'var(--ink-tertiary)', marginBottom: '24px', fontSize: '0.9rem' }}>
          Demo and consultation requests from prospective clinics
        </p>

        {flash && (
          <div className={`alert alert-${flash.type === 'success' ? 'success' : 'error'}`}>
            {flash.msg}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px' }}><div className="spinner" /></div>
        ) : consultations.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--ink-tertiary)' }}>
            No consultation requests yet.
          </div>
        ) : (
          <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Practice Name</th>
                  <th style={thStyle}>Contact</th>
                  <th style={thStyle}>Email</th>
                  <th style={thStyle}>Phone</th>
                  <th style={thStyle}>NPI</th>
                  <th style={thStyle}>Providers</th>
                  <th style={thStyle}>Current Software</th>
                  <th style={thStyle}>Date</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Update Status</th>
                </tr>
              </thead>
              <tbody>
                {consultations.map((c) => (
                  <tr key={c._id}>
                    <td style={tdStyle}><strong>{c.practiceName}</strong></td>
                    <td style={tdStyle}>{c.contactName}</td>
                    <td style={tdStyle}>{c.email}</td>
                    <td style={{ ...tdStyle, color: 'var(--ink-tertiary)' }}>{c.phone || '—'}</td>
                    <td style={{ ...tdStyle, color: 'var(--ink-tertiary)' }}>{c.npi || '—'}</td>
                    <td style={{ ...tdStyle, textAlign: 'center' }}>{c.providerCount ?? '—'}</td>
                    <td style={{ ...tdStyle, color: 'var(--ink-tertiary)' }}>{c.currentSoftware || '—'}</td>
                    <td style={{ ...tdStyle, color: 'var(--ink-tertiary)', whiteSpace: 'nowrap' }}>
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                    <td style={tdStyle}>
                      <span style={badgeStyle(c.status)}>{c.status}</span>
                    </td>
                    <td style={tdStyle}>
                      <select
                        value={c.status}
                        onChange={(e) => handleStatusChange(c._id, e.target.value)}
                        style={{ width: 'auto', padding: '6px 10px', fontSize: '0.8125rem' }}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
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
