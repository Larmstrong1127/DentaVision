import React, { useState } from 'react';
import api from '../../utils/api';

const SURFACE_LABELS = {
  mesial: 'M', occlusal: 'O', distal: 'D', buccal: 'B', lingual: 'L', facial: 'F', incisal: 'I'
};

const TOOTH_NAMES = {
  1:'Upper right wisdom tooth',2:'Upper right 2nd molar',3:'Upper right 1st molar',
  4:'Upper right 2nd premolar',5:'Upper right 1st premolar',6:'Upper right canine',
  7:'Upper right lateral incisor',8:'Upper right central incisor',
  9:'Upper left central incisor',10:'Upper left lateral incisor',
  11:'Upper left canine',12:'Upper left 1st premolar',13:'Upper left 2nd premolar',
  14:'Upper left 1st molar',15:'Upper left 2nd molar',16:'Upper left wisdom tooth',
  17:'Lower left wisdom tooth',18:'Lower left 2nd molar',19:'Lower left 1st molar',
  20:'Lower left 2nd premolar',21:'Lower left 1st premolar',22:'Lower left canine',
  23:'Lower left lateral incisor',24:'Lower left central incisor',
  25:'Lower right central incisor',26:'Lower right lateral incisor',
  27:'Lower right canine',28:'Lower right 1st premolar',29:'Lower right 2nd premolar',
  30:'Lower right 1st molar',31:'Lower right 2nd molar',32:'Lower right wisdom tooth'
};

export default function ToothDetail({ toothNumber, finding, onClose }) {
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(false);

  if (!toothNumber) return null;

  const isHealthy = !finding || finding.priority === 'healthy';
  const priority = finding?.priority || 'healthy';

  const badgeClass = {
    urgent: 'badge badge-urgent',
    moderate: 'badge badge-moderate',
    watch: 'badge badge-watch',
    healthy: 'badge badge-healthy',
  }[priority];

  const handleLearn = async () => {
    if (explanation) return;
    setLoading(true);
    try {
      const { data } = await api.post('/education/explain', {
        procedureName: finding?.procedureName || 'dental examination',
        toothNumber,
      });
      setExplanation(data.explanation);
    } catch {
      setExplanation('Unable to load explanation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--r-lg)',
      padding: '18px',
      marginTop: '12px',
      boxShadow: 'var(--shadow-md)',
      animation: 'fadeIn 0.2s ease'
    }}>
      <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(4px); } to { opacity:1; transform:translateY(0); } }`}</style>

      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'12px' }}>
        <div>
          <p style={{ fontSize:'0.75rem', color:'var(--ink-tertiary)', marginBottom:'2px' }}>
            Tooth #{toothNumber}
          </p>
          <p style={{ fontSize:'1rem', fontWeight:'500' }}>{TOOTH_NAMES[toothNumber]}</p>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
          <span className={badgeClass}>{priority.charAt(0).toUpperCase() + priority.slice(1)}</span>
          <button onClick={onClose} style={{ background:'none', border:'none', fontSize:'1.2rem', color:'var(--ink-tertiary)', cursor:'pointer', lineHeight:1 }}>×</button>
        </div>
      </div>

      {isHealthy ? (
        <p style={{ fontSize:'0.9rem', color:'var(--ink-secondary)', background:'var(--healthy-bg)', padding:'10px 14px', borderRadius:'var(--r-md)' }}>
          ✓ No treatment needed. This tooth looks healthy — keep up the great brushing and flossing!
        </p>
      ) : (
        <>
          {finding.procedureName && (
            <div style={{ marginBottom:'10px' }}>
              <p style={{ fontSize:'0.75rem', color:'var(--ink-tertiary)', marginBottom:'4px' }}>Recommended procedure</p>
              <p style={{ fontSize:'0.9375rem', fontWeight:'500', color:'var(--ink)' }}>{finding.procedureName}</p>
            </div>
          )}

          {finding.surfaces?.length > 0 && (
            <div style={{ marginBottom:'10px' }}>
              <p style={{ fontSize:'0.75rem', color:'var(--ink-tertiary)', marginBottom:'6px' }}>Surfaces involved</p>
              <div style={{ display:'flex', gap:'5px', flexWrap:'wrap' }}>
                {['mesial','occlusal','distal','buccal','lingual'].map(s => (
                  <div key={s} style={{
                    padding:'4px 10px',
                    borderRadius:'5px',
                    fontSize:'0.8125rem',
                    fontWeight:'500',
                    background: finding.surfaces.includes(s) ? 'var(--moderate-bg)' : 'var(--surface-3)',
                    color: finding.surfaces.includes(s) ? 'var(--moderate)' : 'var(--ink-tertiary)',
                    border: `1px solid ${finding.surfaces.includes(s) ? 'var(--moderate-border)' : 'var(--border)'}`,
                  }}>
                    {SURFACE_LABELS[s]} <span style={{ fontWeight:400, fontSize:'0.75rem' }}>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {finding.visitCount && (
            <div style={{ background:'var(--surface-3)', borderRadius:'var(--r-sm)', padding:'10px 12px', marginBottom:'12px' }}>
              <p style={{ fontSize:'0.75rem', color:'var(--ink-tertiary)', marginBottom:'2px' }}>Visits needed</p>
              <p style={{ fontSize:'1rem', fontWeight:'600' }}>{finding.visitCount}</p>
            </div>
          )}

          {finding.notes && (
            <p style={{ fontSize:'0.875rem', color:'var(--ink-secondary)', marginBottom:'12px', lineHeight:'1.6' }}>{finding.notes}</p>
          )}

          {/* Learn more */}
          {!explanation && (
            <button className="btn btn-secondary btn-sm" onClick={handleLearn} disabled={loading}>
              {loading ? <><span className="spinner" style={{width:'14px',height:'14px'}} /> Loading...</> : '🎓 Learn about this procedure'}
            </button>
          )}

          {explanation && (
            <div style={{ background:'var(--watch-bg)', border:'1px solid var(--watch-border)', borderRadius:'var(--r-md)', padding:'14px', marginTop:'4px' }}>
              <p style={{ fontSize:'0.8125rem', fontWeight:'600', color:'var(--watch)', marginBottom:'8px' }}>About this procedure</p>
              <p style={{ fontSize:'0.875rem', color:'var(--ink-secondary)', lineHeight:'1.7', whiteSpace:'pre-wrap' }}>{explanation}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
