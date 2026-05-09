import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClinicNav } from '../../components/shared/NavBar';
import api from '../../utils/api';

export default function ClinicScanPage() {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [file, setFile] = useState(null);
  const [rawText, setRawText] = useState('');
  const [inputMode, setInputMode] = useState('upload'); // 'upload' | 'text'
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/clinics/patients?limit=100').then(r => setPatients(r.data.patients || []));
  }, []);

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPatient) return setError('Please select a patient');
    if (inputMode === 'upload' && !file) return setError('Please upload a file');
    if (inputMode === 'text' && !rawText.trim()) return setError('Please enter plan text');
    setError(''); setLoading(true); setResult(null);

    try {
      const formData = new FormData();
      formData.append('patientId', selectedPatient);
      if (inputMode === 'upload' && file) formData.append('plan', file);
      if (inputMode === 'text') formData.append('rawText', rawText);

      const { data } = await api.post('/scan/plan', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Scan failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <ClinicNav />
      <main className="container" style={{ padding: '32px 20px', maxWidth: '680px' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontFamily: 'var(--font-sans)', fontWeight: '600', fontSize: '1.5rem', marginBottom: '4px' }}>
            Scan treatment plan
          </h1>
          <p style={{ color: 'var(--ink-tertiary)', fontSize: '0.9rem' }}>
            Upload a photo or PDF of a printed treatment plan — AI will read CDT codes and build a visual chart for your patient.
          </p>
        </div>

        {result ? (
          <div>
            <div className="alert alert-success" style={{ marginBottom: '20px' }}>
              ✅ Plan scanned for <strong>{result.patientName}</strong> — {result.plan.appointments?.length || 0} appointment{result.plan.appointments?.length !== 1 ? 's' : ''}, {result.plan.findings?.length || 0} procedures total.
            </div>
            <div className="card" style={{ marginBottom: '16px' }}>
              <h3 style={{ fontFamily: 'var(--font-sans)', fontWeight: '600', marginBottom: '10px' }}>Summary</h3>
              <p style={{ fontSize: '0.9375rem', color: 'var(--ink-secondary)', lineHeight: '1.7' }}>{result.plan.aiSummary}</p>
            </div>
            <div className="card" style={{ marginBottom: '16px' }}>
              <h3 style={{ fontFamily: 'var(--font-sans)', fontWeight: '600', marginBottom: '14px' }}>
                Appointments ({result.plan.appointments?.length || 0})
              </h3>
              {(result.plan.appointments || []).map((appt, ai) => (
                <div key={ai} style={{ marginBottom: '14px', paddingBottom: '14px', borderBottom: ai < result.plan.appointments.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <p style={{ fontWeight: '600', fontSize: '0.9375rem' }}>Visit {appt.visitNumber} — {appt.visitLabel}</p>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--ink-tertiary)', marginTop: '2px' }}>
                        {appt.procedures?.length} procedure{appt.procedures?.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
                      <span className={`badge badge-${appt.priority}`}>{appt.priority}</span>
                    </div>
                  </div>
                  {appt.procedures?.map((p, pi) => (
                    <div key={pi} style={{ display: 'flex', padding: '6px 10px', background: 'var(--surface-2)', borderRadius: 'var(--r-sm)', marginBottom: '3px' }}>
                      <span style={{ fontSize: '0.875rem' }}>
                        {p.toothNumber ? `#${p.toothNumber} — ` : ''}{p.procedureName}
                        {p.surfaces?.length > 0 && <span style={{ color: 'var(--ink-tertiary)', marginLeft: '5px', fontSize: '0.8125rem' }}>({p.surfaces.join(', ')})</span>}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-primary" onClick={() => navigate(`/clinic/patients/${selectedPatient}`)}>
                View patient chart →
              </button>
              <button className="btn btn-ghost" onClick={() => { setResult(null); setFile(null); setRawText(''); }}>
                Scan another plan
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && <div className="alert alert-error">{error}</div>}

            {/* Patient selector */}
            <div className="form-group">
              <label className="form-label">Select patient</label>
              <select value={selectedPatient} onChange={e => setSelectedPatient(e.target.value)} required>
                <option value="">— Choose a patient —</option>
                {patients.map(p => (
                  <option key={p._id} value={p._id}>{p.firstName} {p.lastName} · {p.email}</option>
                ))}
              </select>
              {patients.length === 0 && (
                <p className="form-hint">No patients yet. Ask patients to register with your clinic code.</p>
              )}
            </div>

            {/* Input mode toggle */}
            <div className="form-group">
              <label className="form-label">Plan input method</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[['upload', '📷 Upload image / PDF'], ['text', '⌨️ Paste plan text']].map(([mode, label]) => (
                  <button key={mode} type="button" onClick={() => setInputMode(mode)} style={{
                    flex: 1, padding: '10px', border: `1.5px solid ${inputMode === mode ? 'var(--teal)' : 'var(--border)'}`,
                    borderRadius: 'var(--r-md)', background: inputMode === mode ? 'var(--teal-light)' : 'var(--surface)',
                    color: inputMode === mode ? 'var(--teal-dark)' : 'var(--ink-secondary)',
                    fontFamily: 'var(--font-sans)', fontSize: '0.875rem', fontWeight: inputMode === mode ? '500' : '400',
                    cursor: 'pointer', transition: 'all 0.15s'
                  }}>{label}</button>
                ))}
              </div>
            </div>

            {inputMode === 'upload' ? (
              <div className="form-group">
                <label className="form-label">Treatment plan image or PDF</label>
                <div
                  onDragOver={e => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('file-input').click()}
                  style={{
                    border: `2px dashed ${dragging ? 'var(--teal)' : file ? 'var(--healthy)' : 'var(--border)'}`,
                    borderRadius: 'var(--r-lg)', padding: '40px 20px', textAlign: 'center',
                    background: dragging ? 'var(--teal-light)' : file ? 'var(--healthy-bg)' : 'var(--surface-2)',
                    cursor: 'pointer', transition: 'all 0.2s'
                  }}>
                  <input id="file-input" type="file" accept="image/*,.pdf" style={{ display: 'none' }}
                    onChange={e => setFile(e.target.files[0])} />
                  {file ? (
                    <>
                      <p style={{ fontSize: '2rem', marginBottom: '8px' }}>✅</p>
                      <p style={{ fontWeight: '500', color: 'var(--healthy)' }}>{file.name}</p>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--ink-tertiary)', marginTop: '4px' }}>
                        {(file.size / 1024 / 1024).toFixed(2)} MB · Click to replace
                      </p>
                    </>
                  ) : (
                    <>
                      <p style={{ fontSize: '2.5rem', marginBottom: '10px' }}>📄</p>
                      <p style={{ fontWeight: '500', marginBottom: '4px' }}>Drop file here or click to upload</p>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--ink-tertiary)' }}>JPG, PNG, WebP, or PDF · Max 10MB</p>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="form-group">
                <label className="form-label">Paste treatment plan text</label>
                <textarea value={rawText} onChange={e => setRawText(e.target.value)}
                  placeholder={'Paste the text from a treatment plan here...\n\nExample:\nTooth #19 - D3330 Root Canal Molar - $1,100\nTooth #19 - D2740 Crown Porcelain - $1,400\nTooth #14 - D2392 Composite 2 surf - $220'}
                  rows={8} style={{ resize: 'vertical', fontFamily: 'var(--font-mono, monospace)', fontSize: '0.875rem' }} />
              </div>
            )}

            <div style={{ background: 'var(--watch-bg)', border: '1px solid var(--watch-border)', borderRadius: 'var(--r-md)', padding: '12px 14px', marginBottom: '20px' }}>
              <p style={{ fontSize: '0.8125rem', color: 'var(--watch)', lineHeight: '1.6' }}>
                <strong>AI scanning:</strong> Claude reads CDT codes, tooth numbers, and procedure notes. Review the results before sharing with your patient. Scanning typically takes 5–15 seconds.
              </p>
            </div>

            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
              {loading ? (
                <><span className="spinner" style={{ width: '18px', height: '18px' }} /> Reading treatment plan…</>
              ) : (
                '🔍 Scan & generate tooth chart'
              )}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
