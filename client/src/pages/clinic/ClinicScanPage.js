import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClinicNav } from '../../components/shared/NavBar';
import PhiNotice from '../../components/shared/PhiNotice';
import api from '../../utils/api';

// ── CDT surface requirement map ───────────────────────────────
// D2xxx = restorative (fillings/crowns) — surfaces apply to actual fillings
const FILLING_PREFIXES = ['D214', 'D215', 'D216', 'D233', 'D239'];
const isFillingCode = (code) => {
  const upper = (code || '').toUpperCase();
  return FILLING_PREFIXES.some(p => upper.startsWith(p));
};

const SURFACES = [
  { key: 'mesial',   label: 'Mesial',   abbr: 'M' },
  { key: 'distal',   label: 'Distal',   abbr: 'D' },
  { key: 'occlusal', label: 'Occlusal', abbr: 'O' },
  { key: 'buccal',   label: 'Buccal',   abbr: 'B' },
  { key: 'lingual',  label: 'Lingual',  abbr: 'L' },
  { key: 'facial',   label: 'Facial',   abbr: 'F' },
  { key: 'incisal',  label: 'Incisal',  abbr: 'I' },
];

// ── Format structured visits → rawText for the AI ────────────
function visitsToRawText(visits) {
  return visits
    .filter(v => v.length > 0)
    .map(visit =>
      visit.map(p => {
        let line = `Tooth #${p.toothNum} - ${p.code.toUpperCase()}`;
        if (p.surfaces.length > 0) line += ` - ${p.surfaces.join(' ')}`;
        if (p.notes) line += ` (${p.notes})`;
        return line;
      }).join('\n')
    )
    .join('\n\n');
}

// ── Patient Search Component ──────────────────────────────────
function PatientSearch({ onSelect }) {
  const [fields, setFields] = useState({ firstName: '', lastName: '', dob: '', preferredName: '' });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selected, setSelected] = useState(null);
  const debounceRef = useRef(null);

  const hasQuery = Object.values(fields).some(v => v.trim().length > 0);

  const doSearch = useCallback(async (f) => {
    const params = new URLSearchParams({ limit: 50 });
    if (f.firstName)    params.set('firstName', f.firstName);
    if (f.lastName)     params.set('lastName', f.lastName);
    if (f.preferredName) params.set('preferredName', f.preferredName);
    if (f.dob)          params.set('dob', f.dob);
    setLoading(true);
    try {
      const { data } = await api.get(`/clinics/patients?${params}`);
      setResults(data.patients || []);
      setSearched(true);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (key, val) => {
    const updated = { ...fields, [key]: val };
    setFields(updated);
    setSelected(null);
    onSelect(null, null);
    clearTimeout(debounceRef.current);
    if (Object.values(updated).some(v => v.trim().length > 0)) {
      debounceRef.current = setTimeout(() => doSearch(updated), 350);
    } else {
      setResults([]);
      setSearched(false);
    }
  };

  const handleSelect = (patient) => {
    setSelected(patient);
    onSelect(patient._id, `${patient.firstName} ${patient.lastName}`);
    setResults([]);
    setSearched(false);
  };

  const handleClear = () => {
    setSelected(null);
    setFields({ firstName: '', lastName: '', dob: '', preferredName: '' });
    setResults([]);
    setSearched(false);
    onSelect(null, null);
  };

  const inputStyle = {
    width: '100%', padding: '9px 12px', border: '1.5px solid var(--border)',
    borderRadius: 'var(--r-md)', fontSize: '0.9rem', fontFamily: 'var(--font-sans)',
    background: 'var(--surface)', color: 'var(--ink)', outline: 'none',
    boxSizing: 'border-box',
  };
  const labelStyle = {
    display: 'block', fontSize: '0.75rem', fontWeight: '600',
    color: 'var(--ink-tertiary)', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.4px'
  };

  if (selected) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px', background: 'var(--teal-light)',
        border: '1.5px solid var(--teal)', borderRadius: 'var(--r-md)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%', background: 'var(--teal)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: '700', fontSize: '0.9rem', flexShrink: 0
          }}>
            {selected.firstName?.[0]}{selected.lastName?.[0]}
          </div>
          <div>
            <p style={{ fontWeight: '600', color: 'var(--teal-dark)', fontSize: '0.9375rem' }}>
              {selected.firstName} {selected.lastName}
              {selected.preferredName && ` (${selected.preferredName})`}
            </p>
            <p style={{ fontSize: '0.8rem', color: 'var(--ink-tertiary)' }}>
              {selected.email}
              {selected.dateOfBirth && ` · DOB: ${new Date(selected.dateOfBirth).toLocaleDateString()}`}
            </p>
          </div>
        </div>
        <button onClick={handleClear} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--ink-tertiary)', fontSize: '1.1rem', padding: '4px 8px',
          borderRadius: 'var(--r-sm)'
        }} title="Change patient">✕</button>
      </div>
    );
  }

  return (
    <div>
      {/* Search fields grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
        <div>
          <label style={labelStyle}>First Name</label>
          <input
            style={inputStyle}
            placeholder="e.g. Jane"
            value={fields.firstName}
            onChange={e => handleChange('firstName', e.target.value)}
          />
        </div>
        <div>
          <label style={labelStyle}>Last Name</label>
          <input
            style={inputStyle}
            placeholder="e.g. Smith"
            value={fields.lastName}
            onChange={e => handleChange('lastName', e.target.value)}
          />
        </div>
        <div>
          <label style={labelStyle}>Date of Birth</label>
          <input
            type="date"
            style={inputStyle}
            value={fields.dob}
            onChange={e => handleChange('dob', e.target.value)}
          />
        </div>
        <div>
          <label style={labelStyle}>Preferred Name</label>
          <input
            style={inputStyle}
            placeholder="e.g. Jay"
            value={fields.preferredName}
            onChange={e => handleChange('preferredName', e.target.value)}
          />
        </div>
      </div>

      {/* Results */}
      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 0',
          color: 'var(--ink-tertiary)', fontSize: '0.875rem' }}>
          <span className="spinner" style={{ width: '14px', height: '14px' }} />
          Searching…
        </div>
      )}

      {!loading && searched && results.length === 0 && hasQuery && (
        <div style={{ padding: '14px 16px', background: 'var(--surface-2)',
          borderRadius: 'var(--r-md)', border: '1px solid var(--border)',
          fontSize: '0.875rem', color: 'var(--ink-tertiary)', textAlign: 'center' }}>
          No patients found. Try different search terms or ask the patient to register with your clinic code.
        </div>
      )}

      {!loading && results.length > 0 && (
        <div style={{ border: '1.5px solid var(--border)', borderRadius: 'var(--r-md)',
          overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
          <p style={{ padding: '8px 14px', fontSize: '0.72rem', fontWeight: '600',
            color: 'var(--ink-tertiary)', textTransform: 'uppercase', letterSpacing: '0.4px',
            background: 'var(--surface-2)', borderBottom: '1px solid var(--border)', margin: 0 }}>
            {results.length} patient{results.length !== 1 ? 's' : ''} found — select one
          </p>
          <div style={{ maxHeight: '260px', overflowY: 'auto' }}>
            {results.map((p, i) => (
              <button
                key={p._id}
                onClick={() => handleSelect(p)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '12px 14px', background: 'var(--surface)', border: 'none',
                  borderBottom: i < results.length - 1 ? '1px solid var(--border)' : 'none',
                  cursor: 'pointer', textAlign: 'left', transition: 'background 0.12s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--teal-light)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--surface)'}
              >
                <div style={{
                  width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0,
                  background: 'var(--surface-3)', border: '1.5px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.8rem', fontWeight: '700', color: 'var(--ink-secondary)'
                }}>
                  {p.firstName?.[0]}{p.lastName?.[0]}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--ink)', marginBottom: '2px' }}>
                    {p.firstName} {p.lastName}
                    {p.preferredName && (
                      <span style={{ fontWeight: '400', color: 'var(--ink-tertiary)', marginLeft: '6px' }}>
                        ({p.preferredName})
                      </span>
                    )}
                  </p>
                  <p style={{ fontSize: '0.78rem', color: 'var(--ink-tertiary)', margin: 0 }}>
                    {p.email}
                    {p.dateOfBirth && ` · DOB: ${new Date(p.dateOfBirth).toLocaleDateString()}`}
                  </p>
                </div>
                <span style={{ color: 'var(--teal)', fontSize: '0.875rem', flexShrink: 0 }}>Select →</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {!hasQuery && (
        <p style={{ fontSize: '0.8125rem', color: 'var(--ink-tertiary)', marginTop: '4px' }}>
          Search by any combination of fields above.
        </p>
      )}
    </div>
  );
}

// ── Structured Procedure Form ─────────────────────────────────
function StructuredPlanForm({ visits, setVisits }) {
  const [form, setForm] = useState({ code: '', toothNum: '', surfaces: [], notes: '' });
  const [formError, setFormError] = useState('');
  const [activeVisit, setActiveVisit] = useState(0);

  const showSurfaces = isFillingCode(form.code);

  const toggleSurface = (key) => {
    setForm(prev => ({
      ...prev,
      surfaces: prev.surfaces.includes(key)
        ? prev.surfaces.filter(s => s !== key)
        : [...prev.surfaces, key]
    }));
  };

  const addProcedure = () => {
    if (!form.code.trim()) return setFormError('CDT procedure code is required (e.g. D2392)');
    if (!form.toothNum) return setFormError('Tooth number is required (1–32)');
    const num = parseInt(form.toothNum);
    if (isNaN(num) || num < 1 || num > 32) return setFormError('Tooth number must be between 1 and 32');
    setFormError('');
    const proc = {
      code: form.code.trim().toUpperCase(),
      toothNum: num,
      surfaces: [...form.surfaces],
      notes: form.notes.trim(),
    };
    setVisits(prev => {
      const updated = prev.map((v, i) => i === activeVisit ? [...v, proc] : v);
      return updated;
    });
    setForm({ code: '', toothNum: '', surfaces: [], notes: '' });
  };

  const addVisit = () => {
    setVisits(prev => [...prev, []]);
    setActiveVisit(visits.length);
  };

  const removeProc = (visitIdx, procIdx) => {
    setVisits(prev => prev.map((v, i) =>
      i === visitIdx ? v.filter((_, pi) => pi !== procIdx) : v
    ));
  };

  const inputStyle = {
    padding: '9px 12px', border: '1.5px solid var(--border)', borderRadius: 'var(--r-md)',
    fontSize: '0.9rem', fontFamily: 'var(--font-sans)', background: 'var(--surface)',
    color: 'var(--ink)', outline: 'none',
  };
  const labelStyle = {
    display: 'block', fontSize: '0.75rem', fontWeight: '600',
    color: 'var(--ink-tertiary)', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.4px'
  };

  return (
    <div>
      {/* Visit tabs */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: '0.78rem', fontWeight: '600', color: 'var(--ink-tertiary)',
          textTransform: 'uppercase', letterSpacing: '0.4px', marginRight: '4px' }}>Adding to:</span>
        {visits.map((v, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActiveVisit(i)}
            style={{
              padding: '5px 14px', borderRadius: '20px', fontSize: '0.8125rem', cursor: 'pointer',
              border: `1.5px solid ${activeVisit === i ? 'var(--teal)' : 'var(--border)'}`,
              background: activeVisit === i ? 'var(--teal-light)' : 'var(--surface)',
              color: activeVisit === i ? 'var(--teal-dark)' : 'var(--ink-secondary)',
              fontWeight: activeVisit === i ? '600' : '400',
            }}
          >
            Visit {i + 1} <span style={{ opacity: 0.6 }}>({v.length})</span>
          </button>
        ))}
        <button
          type="button"
          onClick={addVisit}
          style={{
            padding: '5px 12px', borderRadius: '20px', fontSize: '0.8125rem', cursor: 'pointer',
            border: '1.5px dashed var(--border)', background: 'transparent',
            color: 'var(--ink-tertiary)', fontWeight: '400',
          }}
        >
          + New visit
        </button>
      </div>

      {/* Procedure entry row */}
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)',
        borderRadius: 'var(--r-lg)', padding: '16px', marginBottom: '14px' }}>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px', marginBottom: '10px' }}>
          <div>
            <label style={labelStyle}>CDT Code <span style={{ color: 'var(--urgent)' }}>*</span></label>
            <input
              style={{ ...inputStyle, width: '100%', boxSizing: 'border-box', textTransform: 'uppercase', letterSpacing: '0.05em' }}
              placeholder="e.g. D2392"
              value={form.code}
              maxLength={6}
              onChange={e => {
                setForm(prev => ({ ...prev, code: e.target.value.toUpperCase(), surfaces: [] }));
                setFormError('');
              }}
              onKeyDown={e => e.key === 'Enter' && addProcedure()}
            />
          </div>
          <div>
            <label style={labelStyle}>Tooth # <span style={{ color: 'var(--urgent)' }}>*</span></label>
            <input
              style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }}
              type="number"
              placeholder="1–32"
              min={1} max={32}
              value={form.toothNum}
              onChange={e => { setForm(prev => ({ ...prev, toothNum: e.target.value })); setFormError(''); }}
              onKeyDown={e => e.key === 'Enter' && addProcedure()}
            />
          </div>
        </div>

        {/* Surface checkboxes — only for fillings */}
        {showSurfaces && (
          <div style={{ marginBottom: '10px' }}>
            <label style={labelStyle}>Tooth Surfaces</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {SURFACES.map(s => {
                const checked = form.surfaces.includes(s.key);
                return (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => toggleSurface(s.key)}
                    style={{
                      padding: '4px 12px', borderRadius: '20px', cursor: 'pointer',
                      border: `1.5px solid ${checked ? 'var(--teal)' : 'var(--border)'}`,
                      background: checked ? 'var(--teal-light)' : 'var(--surface)',
                      color: checked ? 'var(--teal-dark)' : 'var(--ink-secondary)',
                      fontSize: '0.8125rem', fontWeight: checked ? '600' : '400',
                    }}
                  >
                    {s.abbr} — {s.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Notes */}
        <div style={{ marginBottom: '12px' }}>
          <label style={labelStyle}>Notes <span style={{ color: 'var(--ink-tertiary)', fontWeight: '400' }}>(optional)</span></label>
          <input
            style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }}
            placeholder="e.g. distal caries, watch area"
            value={form.notes}
            onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
            onKeyDown={e => e.key === 'Enter' && addProcedure()}
          />
        </div>

        {formError && (
          <p style={{ fontSize: '0.8125rem', color: 'var(--urgent)', marginBottom: '10px' }}>⚠ {formError}</p>
        )}

        <button
          type="button"
          onClick={addProcedure}
          style={{
            padding: '9px 20px', borderRadius: 'var(--r-md)', cursor: 'pointer',
            background: 'var(--teal)', color: 'white', border: 'none',
            fontSize: '0.875rem', fontWeight: '600',
          }}
        >
          + Add to Visit {activeVisit + 1}
        </button>
      </div>

      {/* Visit summary */}
      {visits.some(v => v.length > 0) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {visits.map((visit, vi) => visit.length > 0 && (
            <div key={vi} style={{ border: '1px solid var(--border)', borderRadius: 'var(--r-md)', overflow: 'hidden' }}>
              <div style={{ padding: '8px 14px', background: 'var(--surface-2)',
                borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: '600', fontSize: '0.875rem' }}>Visit {vi + 1}</span>
                <span style={{ fontSize: '0.78rem', color: 'var(--ink-tertiary)' }}>
                  {visit.length} procedure{visit.length !== 1 ? 's' : ''}
                </span>
              </div>
              {visit.map((proc, pi) => (
                <div key={pi} style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '9px 14px', borderBottom: pi < visit.length - 1 ? '1px solid var(--border)' : 'none',
                  background: 'var(--surface)',
                }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--ink-secondary)',
                    background: 'var(--surface-3)', border: '1px solid var(--border)',
                    borderRadius: 'var(--r-sm)', padding: '2px 7px', flexShrink: 0 }}>
                    #{proc.toothNum}
                  </span>
                  <span style={{ fontSize: '0.78rem', fontWeight: '600', color: 'var(--teal-dark)',
                    background: 'var(--teal-light)', borderRadius: 'var(--r-sm)', padding: '2px 7px', flexShrink: 0 }}>
                    {proc.code}
                  </span>
                  {proc.surfaces.length > 0 && (
                    <span style={{ fontSize: '0.78rem', color: 'var(--ink-tertiary)', flexShrink: 0 }}>
                      {proc.surfaces.map(s => SURFACES.find(x => x.key === s)?.abbr || s).join('-')}
                    </span>
                  )}
                  {proc.notes && (
                    <span style={{ fontSize: '0.78rem', color: 'var(--ink-tertiary)', flex: 1,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {proc.notes}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeProc(vi, pi)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--ink-tertiary)', fontSize: '1rem', padding: '0 4px',
                      flexShrink: 0, lineHeight: 1 }}
                    title="Remove"
                  >×</button>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Confirmation Modal ────────────────────────────────────────
function ConfirmModal({ patientName, patientStatus, onConfirm, onCancel, loading }) {
  const { hasPlan, lastScanDate, scansRemainingToday } = patientStatus || {};
  const formattedDate = lastScanDate
    ? new Date(lastScanDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : null;

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '20px'
    }}>
      <div style={{
        background: 'var(--surface)', borderRadius: 'var(--r-xl)',
        padding: '28px 28px 24px', maxWidth: '440px', width: '100%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
        animation: 'fadeIn 0.15s ease'
      }}>
        {/* Icon + title */}
        <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', marginBottom: '18px' }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '50%', flexShrink: 0,
            background: hasPlan ? 'var(--watch-bg)' : 'var(--teal-light)',
            border: `2px solid ${hasPlan ? 'var(--watch-border)' : 'var(--teal)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem'
          }}>
            {hasPlan ? '⚠️' : '📋'}
          </div>
          <div>
            <h3 style={{ fontWeight: '700', fontSize: '1.05rem', marginBottom: '4px', color: 'var(--ink)' }}>
              {hasPlan ? 'Replace existing plan?' : 'Confirm new treatment plan'}
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--ink-secondary)' }}>
              For <strong>{patientName}</strong>
            </p>
          </div>
        </div>

        {/* Warning body */}
        <div style={{
          background: hasPlan ? 'var(--watch-bg)' : 'var(--surface-2)',
          border: `1px solid ${hasPlan ? 'var(--watch-border)' : 'var(--border)'}`,
          borderRadius: 'var(--r-md)', padding: '14px 16px', marginBottom: '20px',
          fontSize: '0.875rem', lineHeight: '1.6', color: 'var(--ink-secondary)'
        }}>
          {hasPlan ? (
            <>
              <p style={{ marginBottom: '6px' }}>
                This patient already has an active treatment plan
                {formattedDate && <> (last updated <strong>{formattedDate}</strong>)</>}.
              </p>
              <p>
                Submitting will replace their current plan with this one.
                Only proceed if this reflects the most up-to-date version of their treatment.
              </p>
            </>
          ) : (
            <p>
              This will create a new treatment plan for this patient.
              Make sure the information you've entered is correct before proceeding.
            </p>
          )}
        </div>

        {/* Demo / PHI reminder — last checkpoint before anything is submitted */}
        <PhiNotice compact style={{ marginBottom: '16px' }} />

        {/* Scans remaining notice */}
        {scansRemainingToday !== undefined && (
          <p style={{
            fontSize: '0.78rem', color: scansRemainingToday <= 1 ? 'var(--watch)' : 'var(--ink-tertiary)',
            marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '6px'
          }}>
            {scansRemainingToday <= 1 ? '⚠ ' : 'ℹ '}
            {scansRemainingToday === 0
              ? 'This will use your last allowed scan for this patient today.'
              : `${scansRemainingToday} scan${scansRemainingToday !== 1 ? 's' : ''} remaining for this patient today.`}
          </p>
        )}

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={onCancel}
            disabled={loading}
            style={{
              flex: 1, padding: '11px', borderRadius: 'var(--r-md)', cursor: 'pointer',
              border: '1.5px solid var(--border)', background: 'var(--surface)',
              color: 'var(--ink-secondary)', fontSize: '0.9rem', fontWeight: '500'
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            style={{
              flex: 2, padding: '11px', borderRadius: 'var(--r-md)', cursor: 'pointer',
              border: 'none',
              background: hasPlan ? 'var(--watch)' : 'var(--teal)',
              color: 'white', fontSize: '0.9rem', fontWeight: '600',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
            }}
          >
            {loading
              ? <><span className="spinner" style={{ width: '16px', height: '16px', borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} /> Scanning…</>
              : hasPlan ? 'Yes, replace with this plan' : 'Yes, create plan'
            }
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function ClinicScanPage() {
  const [selectedPatient, setSelectedPatient] = useState('');
  const [selectedPatientName, setSelectedPatientName] = useState('');
  const [file, setFile] = useState(null);
  const [inputMode, setInputMode] = useState('upload'); // 'upload' | 'structured'
  const [visits, setVisits] = useState([[]]); // structured mode visits
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);

  // Confirmation modal state
  const [showConfirm, setShowConfirm] = useState(false);
  const [patientStatus, setPatientStatus] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);

  const navigate = useNavigate();

  const handlePatientSelect = (id, name) => {
    setSelectedPatient(id || '');
    setSelectedPatientName(name || '');
    setPatientStatus(null);
    setError('');
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  };

  // Step 1 — validate form, fetch patient status, show confirmation modal
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPatient) return setError('Please select a patient first');
    if (inputMode === 'upload' && !file) return setError('Please upload a file');
    if (inputMode === 'structured' && visits.every(v => v.length === 0))
      return setError('Please add at least one procedure');
    setError('');
    setStatusLoading(true);
    try {
      const { data } = await api.get(`/scan/patient-status/${selectedPatient}`);
      setPatientStatus(data);
      setShowConfirm(true);
    } catch (err) {
      // If rate-limited, surface that error immediately
      setError(err.response?.data?.error || 'Could not verify patient status. Please try again.');
    } finally {
      setStatusLoading(false);
    }
  };

  // Step 2 — user confirmed in modal, actually run the scan
  const handleConfirmedScan = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('patientId', selectedPatient);
      if (inputMode === 'upload' && file) {
        formData.append('plan', file);
      } else {
        formData.append('rawText', visitsToRawText(visits));
      }
      const { data } = await api.post('/scan/plan', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setShowConfirm(false);
      setResult(data);
    } catch (err) {
      setShowConfirm(false);
      setError(err.response?.data?.error || 'Scan failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null); setFile(null);
    setVisits([[]]); setError('');
    setPatientStatus(null); setShowConfirm(false);
  };

  return (
    <div className="page">
      <ClinicNav />

      {/* Confirmation modal */}
      {showConfirm && (
        <ConfirmModal
          patientName={selectedPatientName}
          patientStatus={patientStatus}
          loading={loading}
          onConfirm={handleConfirmedScan}
          onCancel={() => setShowConfirm(false)}
        />
      )}

      <main className="container" style={{ padding: '32px 20px', maxWidth: '720px' }}>

        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontFamily: 'var(--font-sans)', fontWeight: '600',
            fontSize: '1.5rem', marginBottom: '4px' }}>
            Scan treatment plan
          </h1>
          <p style={{ color: 'var(--ink-tertiary)', fontSize: '0.9rem' }}>
            Upload a sample plan photo or PDF, or enter procedures manually — AI will build a visual chart.
          </p>
        </div>

        {/* Demo / PHI notice — must stay above the upload surface, not in a footer */}
        <PhiNotice style={{ marginBottom: '20px' }} />

        {result ? (
          /* ── Result view ── */
          <div>
            <div className="alert alert-success" style={{ marginBottom: '20px' }}>
              ✅ Plan scanned for <strong>{result.patientName || selectedPatientName}</strong> —{' '}
              {result.plan.appointments?.length || 0} visit{result.plan.appointments?.length !== 1 ? 's' : ''},{' '}
              {result.plan.findings?.length || 0} procedures total.
            </div>

            {/* AI Summary */}
            {result.plan.aiSummary && (
              <div className="card" style={{ marginBottom: '16px' }}>
                <h3 style={{ fontFamily: 'var(--font-sans)', fontWeight: '600', marginBottom: '10px' }}>Summary</h3>
                <p style={{ fontSize: '0.9375rem', color: 'var(--ink-secondary)', lineHeight: '1.7' }}>
                  {result.plan.aiSummary}
                </p>
              </div>
            )}

            {/* Appointments */}
            <div className="card" style={{ marginBottom: '16px' }}>
              <h3 style={{ fontFamily: 'var(--font-sans)', fontWeight: '600', marginBottom: '14px' }}>
                Visits ({result.plan.appointments?.length || 0})
              </h3>
              {(result.plan.appointments || []).map((appt, ai) => (
                <div key={ai} style={{
                  marginBottom: '14px', paddingBottom: '14px',
                  borderBottom: ai < result.plan.appointments.length - 1 ? '1px solid var(--border)' : 'none'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between',
                    alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <p style={{ fontWeight: '600', fontSize: '0.9375rem' }}>
                        Visit {appt.visitNumber} — {appt.visitLabel}
                      </p>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--ink-tertiary)', marginTop: '2px' }}>
                        {appt.procedures?.length} procedure{appt.procedures?.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <span className={`badge badge-${appt.priority}`}>{appt.priority}</span>
                  </div>
                  {appt.procedures?.map((p, pi) => (
                    <div key={pi} style={{
                      display: 'flex', padding: '6px 10px', background: 'var(--surface-2)',
                      borderRadius: 'var(--r-sm)', marginBottom: '3px', gap: '8px'
                    }}>
                      {p.toothNumber && (
                        <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--ink-secondary)',
                          background: 'var(--surface-3)', border: '1px solid var(--border)',
                          borderRadius: 'var(--r-sm)', padding: '1px 6px', flexShrink: 0 }}>
                          #{p.toothNumber}
                        </span>
                      )}
                      <span style={{ fontSize: '0.875rem', flex: 1 }}>
                        {p.procedureName}
                        {p.surfaces?.length > 0 && (
                          <span style={{ color: 'var(--ink-tertiary)', marginLeft: '5px', fontSize: '0.8125rem' }}>
                            ({p.surfaces.join(', ')})
                          </span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <button className="btn btn-primary"
                onClick={() => navigate(`/clinic/patients/${selectedPatient}`)}>
                View patient chart →
              </button>
              <button className="btn btn-ghost" onClick={handleReset}>
                Scan another plan
              </button>
            </div>
          </div>

        ) : (
          /* ── Input form ── */
          <form onSubmit={handleSubmit}>
            {error && <div className="alert alert-error" style={{ marginBottom: '16px' }}>{error}</div>}

            {/* Patient search */}
            <div className="form-group">
              <label className="form-label" style={{ marginBottom: '10px', display: 'block' }}>
                Find patient
              </label>
              <PatientSearch onSelect={handlePatientSelect} />
            </div>

            {/* Input mode toggle */}
            <div className="form-group">
              <label className="form-label">Plan input method</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[
                  ['upload', '📷 Upload image / PDF'],
                  ['structured', '📋 Enter procedures'],
                ].map(([mode, label]) => (
                  <button key={mode} type="button" onClick={() => setInputMode(mode)} style={{
                    flex: 1, padding: '10px', cursor: 'pointer',
                    border: `1.5px solid ${inputMode === mode ? 'var(--teal)' : 'var(--border)'}`,
                    borderRadius: 'var(--r-md)',
                    background: inputMode === mode ? 'var(--teal-light)' : 'var(--surface)',
                    color: inputMode === mode ? 'var(--teal-dark)' : 'var(--ink-secondary)',
                    fontFamily: 'var(--font-sans)', fontSize: '0.875rem',
                    fontWeight: inputMode === mode ? '600' : '400',
                    transition: 'all 0.15s'
                  }}>{label}</button>
                ))}
              </div>
            </div>

            {/* Upload mode */}
            {inputMode === 'upload' && (
              <div className="form-group">
                <label className="form-label">Treatment plan image or PDF</label>
                <PhiNotice compact style={{ marginBottom: '10px' }} />
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
                      <p style={{ fontWeight: '500', marginBottom: '4px' }}>Drop a sample plan here or click to upload</p>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--ink-tertiary)' }}>
                        JPG, PNG, WebP, or PDF · Max 10MB · Sample data only — no real PHI
                      </p>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Structured entry mode */}
            {inputMode === 'structured' && (
              <div className="form-group">
                <label className="form-label" style={{ marginBottom: '12px', display: 'block' }}>
                  Enter procedures
                </label>
                <PhiNotice compact style={{ marginBottom: '12px' }} />
                <StructuredPlanForm visits={visits} setVisits={setVisits} />
              </div>
            )}

            {/* AI note */}
            <div style={{
              background: 'var(--watch-bg)', border: '1px solid var(--watch-border)',
              borderRadius: 'var(--r-md)', padding: '12px 14px', marginBottom: '20px'
            }}>
              <p style={{ fontSize: '0.8125rem', color: 'var(--watch)', lineHeight: '1.6' }}>
                <strong>AI scanning:</strong> whatever you submit is sent to Anthropic's Claude API for
                parsing, so it must not contain real patient information. Claude reads CDT codes, tooth
                numbers, and procedure notes; review all results before relying on them. Scanning
                typically takes 5–15 seconds.
              </p>
            </div>

            <button type="submit" className="btn btn-primary btn-lg"
              style={{ width: '100%' }} disabled={loading || statusLoading}>
              {statusLoading ? (
                <><span className="spinner" style={{ width: '18px', height: '18px' }} /> Checking patient…</>
              ) : loading ? (
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
