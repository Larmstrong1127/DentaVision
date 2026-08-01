import React from 'react';

/**
 * PhiNotice — the single source of truth for the demo / PHI warning.
 *
 * DentaVision is a demonstration product. It has no signed Business Associate
 * Agreement (BAA) process, so a HIPAA covered entity cannot lawfully send it
 * Protected Health Information. Every surface where a user could enter or
 * upload patient data must show this notice. Keep the wording here so it
 * cannot drift between pages.
 */

export const PHI_HEADLINE = 'Demo only — do not upload real patient information (PHI).';
export const PHI_BODY =
  'Use the sample treatment plans provided with this demo, or your own clearly ' +
  'fictional data. HIPAA-covered use requires a signed Business Associate ' +
  'Agreement (BAA), and no BAA process exists for DentaVision today.';

export default function PhiNotice({ compact = false, style }) {
  return (
    <div
      role="note"
      aria-label="Demo only — do not upload protected health information"
      style={{
        background: 'var(--urgent-bg)',
        border: '1.5px solid var(--urgent-border)',
        borderRadius: 'var(--r-md)',
        padding: compact ? '11px 13px' : '14px 16px',
        marginBottom: '16px',
        display: 'flex',
        gap: '10px',
        alignItems: 'flex-start',
        textAlign: 'left',
        ...style,
      }}
    >
      <span style={{ fontSize: compact ? '1rem' : '1.15rem', lineHeight: 1.3, flexShrink: 0 }} aria-hidden="true">
        ⚠️
      </span>
      <div>
        <p
          style={{
            fontSize: compact ? '0.8125rem' : '0.9rem',
            fontWeight: '700',
            color: 'var(--urgent)',
            marginBottom: '4px',
            lineHeight: '1.45',
          }}
        >
          {PHI_HEADLINE}
        </p>
        <p
          style={{
            fontSize: compact ? '0.78rem' : '0.8438rem',
            color: 'var(--ink-secondary)',
            lineHeight: '1.6',
            margin: 0,
          }}
        >
          {PHI_BODY}
        </p>
      </div>
    </div>
  );
}
