import React, { useState } from 'react';

/* ── Color palette ───────────────────────────────────────────── */
const SC = {
  healthy:  { crown:'#F8F8F2', outline:'#C4A840', hl:'#FFFFFF', root:'#C49A20', surf:'rgba(26,127,212,0.30)'  },
  moderate: { crown:'#FDE8C8', outline:'#E07B00', hl:'#FFFAF0', root:'#D4A040', surf:'rgba(224,123,0,0.44)'   },
  urgent:   { crown:'#F8D4D4', outline:'#DC3545', hl:'#FDF5F5', root:'#E09090', surf:'rgba(220,53,69,0.50)'    },
  watch:    { crown:'#D8ECFB', outline:'#1A7FD4', hl:'#EEF7FE', root:'#A8CCE0', surf:'rgba(26,127,212,0.42)'  },
  missing:  { crown:'#EBEBEB', outline:'#AAAAAA', hl:'#F5F5F5', root:'#D0D0D0', surf:'rgba(0,0,0,0.10)'       },
};

/* ── Tooth type by universal number ─────────────────────────── */
const TT = {
   1:'molar', 2:'molar', 3:'molar', 4:'premolar', 5:'premolar',
   6:'canine', 7:'incisor', 8:'incisor', 9:'incisor',10:'incisor',
  11:'canine',12:'premolar',13:'premolar',14:'molar',15:'molar',16:'molar',
  17:'molar',18:'molar',19:'molar',20:'premolar',21:'premolar',
  22:'canine',23:'incisor',24:'incisor',25:'incisor',26:'incisor',
  27:'canine',28:'premolar',29:'premolar',30:'molar',31:'molar',32:'molar',
};

/* ── Arch (occlusal) outline paths ───────────────────────────
   Clean shapes per tooth type — no internal anatomy marks.
   Molar    : 4-cusp rectangular with groove concavities
   Premolar : asymmetric oval (buccal cusp larger)
   Canine   : shield / pointed-tip
   Incisor  : wide labial trapezoid
──────────────────────────────────────────────────────────── */
function archOutline(type, cx, cy, rx, ry) {
  switch (type) {
    case 'molar':
      return [
        `M${cx-rx*0.28},${cy-ry}`,
        `Q${cx},${cy-ry*0.88} ${cx+rx*0.28},${cy-ry}`,
        `Q${cx+rx*0.93},${cy-ry*0.87} ${cx+rx},${cy-ry*0.20}`,
        `Q${cx+rx*1.04},${cy} ${cx+rx},${cy+ry*0.20}`,
        `Q${cx+rx*0.93},${cy+ry*0.87} ${cx+rx*0.28},${cy+ry}`,
        `Q${cx},${cy+ry*0.88} ${cx-rx*0.28},${cy+ry}`,
        `Q${cx-rx*0.93},${cy+ry*0.87} ${cx-rx},${cy+ry*0.20}`,
        `Q${cx-rx*1.04},${cy} ${cx-rx},${cy-ry*0.20}`,
        `Q${cx-rx*0.93},${cy-ry*0.87} ${cx-rx*0.28},${cy-ry}Z`,
      ].join(' ');
    case 'premolar':
      return [
        `M${cx-rx*0.46},${cy-ry}`,
        `Q${cx},${cy-ry*1.04} ${cx+rx*0.46},${cy-ry}`,
        `Q${cx+rx*0.94},${cy-ry*0.52} ${cx+rx},${cy}`,
        `Q${cx+rx*0.86},${cy+ry*0.68} ${cx+rx*0.36},${cy+ry}`,
        `Q${cx},${cy+ry*1.04} ${cx-rx*0.36},${cy+ry}`,
        `Q${cx-rx*0.86},${cy+ry*0.68} ${cx-rx},${cy}`,
        `Q${cx-rx*0.94},${cy-ry*0.52} ${cx-rx*0.46},${cy-ry}Z`,
      ].join(' ');
    case 'canine':
      return [
        `M${cx},${cy-ry*1.05}`,
        `Q${cx+rx*0.68},${cy-ry*0.40} ${cx+rx},${cy+ry*0.18}`,
        `Q${cx+rx*0.78},${cy+ry*0.90} ${cx+rx*0.18},${cy+ry}`,
        `Q${cx},${cy+ry*1.05} ${cx-rx*0.18},${cy+ry}`,
        `Q${cx-rx*0.78},${cy+ry*0.90} ${cx-rx},${cy+ry*0.18}`,
        `Q${cx-rx*0.68},${cy-ry*0.40} ${cx},${cy-ry*1.05}Z`,
      ].join(' ');
    case 'incisor':
      return [
        `M${cx-rx*0.70},${cy-ry}`,
        `Q${cx},${cy-ry*1.04} ${cx+rx*0.70},${cy-ry}`,
        `Q${cx+rx*0.97},${cy-ry*0.20} ${cx+rx*0.70},${cy+ry*0.58}`,
        `Q${cx+rx*0.50},${cy+ry} ${cx},${cy+ry}`,
        `Q${cx-rx*0.50},${cy+ry} ${cx-rx*0.70},${cy+ry*0.58}`,
        `Q${cx-rx*0.97},${cy-ry*0.20} ${cx-rx*0.70},${cy-ry}Z`,
      ].join(' ');
    default:
      return `M${cx-rx},${cy} a${rx},${ry} 0 1,0 ${rx*2},0 a${rx},${ry} 0 1,0 ${-rx*2},0`;
  }
}

/* ── Arch tooth ──────────────────────────────────────────────
   Clean: base fill + surface zone overlays + single highlight.
   No internal anatomy marks.
──────────────────────────────────────────────────────────── */
function ArchTooth({ n, cx, cy, rx, ry, finding, selected }) {
  const st    = finding?.priority || 'healthy';
  const c     = SC[st] || SC.healthy;
  const surfs = finding?.surfaces || [];
  const sel   = selected === n;
  const type  = TT[n];
  const clipId = `ac${n}`;
  const path   = archOutline(type, cx, cy, rx, ry);

  return (
    <g>
      <defs><clipPath id={clipId}><path d={path}/></clipPath></defs>

      {sel && <path d={archOutline(type, cx, cy, rx+4, ry+4)}
        fill="none" stroke="#0F7B6C" strokeWidth="2" strokeDasharray="4,2" opacity="0.85"/>}

      {/* Base crown */}
      <path d={path} fill={c.crown} stroke={c.outline} strokeWidth={sel?1.8:0.9}/>

      {/* Surface zone overlays — clipped to tooth shape */}
      <g clipPath={`url(#${clipId})`}>
        {surfs.includes('mesial')                               && <rect x={cx-rx}      y={cy-ry} width={rx*0.75} height={ry*2}    fill={c.surf}/>}
        {surfs.includes('distal')                               && <rect x={cx+rx*0.25} y={cy-ry} width={rx*0.75} height={ry*2}    fill={c.surf}/>}
        {(surfs.includes('buccal')||surfs.includes('facial'))   && <rect x={cx-rx}      y={cy-ry} width={rx*2}    height={ry*0.65} fill={c.surf}/>}
        {surfs.includes('lingual')                              && <rect x={cx-rx}      y={cy+ry*0.35} width={rx*2} height={ry*0.65} fill={c.surf}/>}
        {surfs.includes('occlusal')                             && <ellipse cx={cx} cy={cy} rx={rx*0.62} ry={ry*0.58} fill={c.surf}/>}
        {surfs.includes('incisal')                              && <ellipse cx={cx} cy={cy} rx={rx*0.55} ry={ry*0.50} fill={c.surf}/>}
      </g>

      {/* Subtle specular highlight — single soft ellipse, no anatomy */}
      <ellipse cx={cx-rx*0.18} cy={cy-ry*0.22} rx={rx*0.40} ry={ry*0.28}
        fill={c.hl} stroke="none" opacity="0.30" clipPath={`url(#${clipId})`}/>

      <text x={cx} y={cy+ry+11} textAnchor="middle" fontSize="9"
        fill={sel?'#0F7B6C':'#9A9A9A'} fontFamily="DM Sans, sans-serif" fontWeight={sel?'700':'400'}>{n}</text>
    </g>
  );
}

/* ── Front / Lingual crown outline ───────────────────────────
   Clean per-type silhouette seen from buccal or lingual side.
──────────────────────────────────────────────────────────── */
function crownPath(type, x, y, w, h, lower) {
  switch (type) {
    case 'incisor':
      return lower
        ? `M${x+2},${y} Q${x+w/2},${y-5} ${x+w-2},${y} L${x+w},${y+h-8} Q${x+w/2},${y+h+5} ${x},${y+h-8}Z`
        : `M${x},${y+8} Q${x+w/2},${y-5} ${x+w},${y+8} L${x+w-2},${y+h} Q${x+w/2},${y+h+5} ${x+2},${y+h}Z`;
    case 'canine':
      return lower
        ? `M${x+3},${y} Q${x+w/2},${y-9} ${x+w-3},${y} L${x+w},${y+h-12} Q${x+w/2},${y+h+9} ${x},${y+h-12}Z`
        : `M${x},${y+12} Q${x+w/2},${y-9} ${x+w},${y+12} L${x+w-3},${y+h} Q${x+w/2},${y+h+9} ${x+3},${y+h}Z`;
    case 'premolar':
      // Two gentle cusp bumps visible from buccal
      return lower
        ? `M${x},${y} L${x+w*0.30},${y-5} Q${x+w*0.50},${y-1} ${x+w*0.70},${y-5} L${x+w},${y} L${x+w},${y+h} L${x},${y+h}Z`
        : `M${x},${y} L${x},${y+h} L${x+w},${y+h} L${x+w},${y} L${x+w*0.70},${y+5} Q${x+w*0.50},${y+1} ${x+w*0.30},${y+5}Z`;
    default: // molar (not shown in front view but as fallback)
      return `M${x},${y} h${w} v${h} h${-w}Z`;
  }
}

/* ── Front tooth (facial view) ───────────────────────────── */
function FrontTooth({ n, x, y, w, h, finding, selected, lower }) {
  const st    = finding?.priority || 'healthy';
  const c     = SC[st] || SC.healthy;
  const surfs = finding?.surfaces || [];
  const sel   = selected === n;
  const type  = TT[n];
  const clipId = `fc${n}`;
  const path   = crownPath(type, x, y, w, h, lower);
  const mw = w * 0.18;   // mesial/distal strip width
  const eh = h * 0.16;   // incisal/buccal edge height

  return (
    <g>
      <defs><clipPath id={clipId}><path d={path}/></clipPath></defs>
      {sel && <rect x={x-4} y={y-6} width={w+8} height={h+12} rx="6"
        fill="none" stroke="#0F7B6C" strokeWidth="2" strokeDasharray="4,2" opacity="0.8"/>}
      <path d={path} fill={c.crown} stroke={c.outline} strokeWidth={sel?1.8:0.9}/>

      {/* Surface zones */}
      <g clipPath={`url(#${clipId})`}>
        {surfs.includes('mesial')                                       && <rect x={x}       y={y} width={mw}      height={h}   fill={c.surf}/>}
        {surfs.includes('distal')                                       && <rect x={x+w-mw}  y={y} width={mw}      height={h}   fill={c.surf}/>}
        {(surfs.includes('buccal')||surfs.includes('facial')||surfs.includes('labial'))
          && <rect x={x+mw} y={lower?y+h-eh:y}      width={w-mw*2} height={eh} fill={c.surf}/>}
        {surfs.includes('lingual')
          && <rect x={x+mw} y={lower?y:y+h-eh}     width={w-mw*2} height={eh} fill={c.surf} opacity="0.55"/>}
        {(!lower && surfs.includes('incisal'))  && <rect x={x+mw} y={y+h-eh} width={w-mw*2} height={eh} fill={c.surf}/>}
        {( lower && surfs.includes('incisal'))  && <rect x={x+mw} y={y}      width={w-mw*2} height={eh} fill={c.surf}/>}
        {surfs.includes('occlusal')             && <rect x={x+mw} y={y+h*0.22} width={w-mw*2} height={h*0.56} fill={c.surf}/>}
      </g>

      {/* Subtle highlight */}
      <rect x={x+w*0.07} y={lower?y+h*0.52:y+h*0.07} width={w*0.26} height={h*0.32}
        rx="3" fill={c.hl} opacity="0.28" clipPath={`url(#${clipId})`}/>

      <text x={x+w/2} y={lower?y+h+12:y-5} textAnchor="middle" fontSize="9"
        fill={sel?'#0F7B6C':'#9A9A9A'} fontFamily="DM Sans, sans-serif" fontWeight={sel?'700':'400'}>{n}</text>
    </g>
  );
}

/* ── Lingual tooth (palatal / tongue-side view) ──────────── */
function LingualTooth({ n, x, y, w, h, finding, selected, lower }) {
  const st    = finding?.priority || 'healthy';
  const c     = SC[st] || SC.healthy;
  const surfs = finding?.surfaces || [];
  const sel   = selected === n;
  const type  = TT[n];
  const clipId = `lc${n}`;
  const path   = crownPath(type, x, y, w, h, lower);
  const mw = w * 0.18;
  const eh = h * 0.16;

  return (
    <g>
      <defs><clipPath id={clipId}><path d={path}/></clipPath></defs>
      {sel && <rect x={x-4} y={y-6} width={w+8} height={h+12} rx="6"
        fill="none" stroke="#0F7B6C" strokeWidth="2" strokeDasharray="4,2" opacity="0.8"/>}
      <path d={path} fill={c.crown} stroke={c.outline} strokeWidth={sel?1.8:0.9}/>

      {/* Surface zones — lingual side perspective */}
      <g clipPath={`url(#${clipId})`}>
        {surfs.includes('lingual')                              && <rect x={x+mw} y={y} width={w-mw*2} height={h}   fill={c.surf}/>}
        {surfs.includes('mesial')                               && <rect x={x}      y={y} width={mw}     height={h}   fill={c.surf}/>}
        {surfs.includes('distal')                               && <rect x={x+w-mw} y={y} width={mw}     height={h}   fill={c.surf}/>}
        {(surfs.includes('buccal')||surfs.includes('facial'))   && <rect x={x+mw} y={lower?y+h-eh:y} width={w-mw*2} height={eh} fill={c.surf} opacity="0.55"/>}
        {(!lower && (surfs.includes('occlusal')||surfs.includes('incisal'))) && <rect x={x+mw} y={y+h-eh} width={w-mw*2} height={eh} fill={c.surf}/>}
        {( lower && (surfs.includes('occlusal')||surfs.includes('incisal'))) && <rect x={x+mw} y={y}      width={w-mw*2} height={eh} fill={c.surf}/>}
      </g>

      {/* Subtle highlight */}
      <rect x={x+w*0.07} y={lower?y+h*0.52:y+h*0.07} width={w*0.26} height={h*0.32}
        rx="3" fill={c.hl} opacity="0.25" clipPath={`url(#${clipId})`}/>

      <text x={x+w/2} y={lower?y+h+12:y-5} textAnchor="middle" fontSize="9"
        fill={sel?'#0F7B6C':'#9A9A9A'} fontFamily="DM Sans, sans-serif" fontWeight={sel?'700':'400'}>{n}</text>
    </g>
  );
}

/* ── Side tooth (buccal profile with roots) ──────────────── */
function SideTooth({ n, tx, isLower, finding, selected }) {
  const st    = finding?.priority || 'healthy';
  const c     = SC[st] || SC.healthy;
  const surfs = finding?.surfaces || [];
  const sel   = selected === n;
  const type  = TT[n];

  const cw = type==='molar'?56:type==='premolar'?44:type==='canine'?30:24;
  const ch = type==='molar'?36:type==='premolar'?38:type==='canine'?44:48;
  const rh = type==='molar'?60:type==='premolar'?68:type==='canine'?80:72;
  const GL  = isLower ? 220 : 175;
  const cTop = isLower ? GL : GL - ch;
  const cBot = isLower ? GL + ch : GL;
  const X   = tx;
  const sw  = sel ? 1.8 : 0.9;
  const clipId = `sc${n}`;

  // Crown silhouette
  let crownD;
  if (type === 'molar') {
    crownD = !isLower
      ? `M${X},${cTop+4} Q${X},${cTop} ${X+4},${cTop} L${X+cw-4},${cTop} Q${X+cw},${cTop} ${X+cw},${cTop+4} L${X+cw},${cBot-2} Q${X+cw*0.82},${cBot+7} ${X+cw*0.65},${cBot} Q${X+cw*0.50},${cBot+5} ${X+cw*0.35},${cBot} Q${X+cw*0.18},${cBot+7} ${X},${cBot-2}Z`
      : `M${X},${cBot-4} Q${X},${cBot} ${X+4},${cBot} L${X+cw-4},${cBot} Q${X+cw},${cBot} ${X+cw},${cBot-4} L${X+cw},${cTop+2} Q${X+cw*0.82},${cTop-7} ${X+cw*0.65},${cTop} Q${X+cw*0.50},${cTop-5} ${X+cw*0.35},${cTop} Q${X+cw*0.18},${cTop-7} ${X},${cTop+2}Z`;
  } else if (type === 'premolar') {
    crownD = !isLower
      ? `M${X},${cTop+4} Q${X},${cTop} ${X+4},${cTop} L${X+cw-4},${cTop} Q${X+cw},${cTop} ${X+cw},${cTop+4} L${X+cw},${cBot-2} Q${X+cw*0.68},${cBot+6} ${X+cw*0.50},${cBot} Q${X+cw*0.32},${cBot+6} ${X},${cBot-2}Z`
      : `M${X},${cBot-4} Q${X},${cBot} ${X+4},${cBot} L${X+cw-4},${cBot} Q${X+cw},${cBot} ${X+cw},${cBot-4} L${X+cw},${cTop+2} Q${X+cw*0.68},${cTop-6} ${X+cw*0.50},${cTop} Q${X+cw*0.32},${cTop-6} ${X},${cTop+2}Z`;
  } else if (type === 'canine') {
    crownD = !isLower
      ? `M${X+3},${cTop+ch} L${X},${cTop+12} Q${X+cw/2},${cTop-6} ${X+cw},${cTop+12} L${X+cw-3},${cTop+ch}Z`
      : `M${X+3},${cTop} L${X},${cTop+ch-12} Q${X+cw/2},${cTop+ch+6} ${X+cw},${cTop+ch-12} L${X+cw-3},${cTop}Z`;
  } else { // incisor
    crownD = !isLower
      ? `M${X+2},${cTop+ch} L${X},${cTop+8} Q${X+cw/2},${cTop-4} ${X+cw},${cTop+8} L${X+cw-2},${cTop+ch}Z`
      : `M${X+2},${cTop} L${X},${cBot-8} Q${X+cw/2},${cBot+4} ${X+cw},${cBot-8} L${X+cw-2},${cTop}Z`;
  }

  // Roots
  const ro = c.outline, rf = c.root;
  let roots = null;
  if (!isLower) {
    const rt = cTop - rh;
    roots = type === 'molar' ? <>
      <path d={`M${X+7},${cTop} Q${X+5},${cTop-rh*0.5} ${X+5},${rt+14}`}         fill="none" stroke={ro} strokeWidth="4"   strokeLinecap="round" opacity="0.50"/>
      <path d={`M${X+cw-7},${cTop} Q${X+cw-5},${cTop-rh*0.5} ${X+cw-5},${rt+18}`} fill="none" stroke={ro} strokeWidth="4"   strokeLinecap="round" opacity="0.50"/>
      <path d={`M${X+cw/2},${cTop} Q${X+cw/2},${cTop-rh*0.52} ${X+cw/2},${rt+8}`}  fill="none" stroke={ro} strokeWidth="3.5" strokeLinecap="round" opacity="0.42"/>
      <path d={`M${X+7},${cTop} Q${X+5},${cTop-rh*0.5} ${X+5},${rt+14}`}         fill="none" stroke={rf} strokeWidth="2.2" strokeLinecap="round"/>
      <path d={`M${X+cw-7},${cTop} Q${X+cw-5},${cTop-rh*0.5} ${X+cw-5},${rt+18}`} fill="none" stroke={rf} strokeWidth="2.2" strokeLinecap="round"/>
      <path d={`M${X+cw/2},${cTop} Q${X+cw/2},${cTop-rh*0.52} ${X+cw/2},${rt+8}`}  fill="none" stroke={rf} strokeWidth="1.8" strokeLinecap="round"/>
    </> : type === 'premolar' ? <>
      <path d={`M${X+8},${cTop} Q${X+7},${cTop-rh*0.52} ${X+7},${rt+12}`}          fill="none" stroke={ro} strokeWidth="3.2" strokeLinecap="round" opacity="0.50"/>
      <path d={`M${X+cw-8},${cTop} Q${X+cw-7},${cTop-rh*0.52} ${X+cw-7},${rt+14}`} fill="none" stroke={ro} strokeWidth="3.2" strokeLinecap="round" opacity="0.50"/>
      <path d={`M${X+8},${cTop} Q${X+7},${cTop-rh*0.52} ${X+7},${rt+12}`}          fill="none" stroke={rf} strokeWidth="1.9" strokeLinecap="round"/>
      <path d={`M${X+cw-8},${cTop} Q${X+cw-7},${cTop-rh*0.52} ${X+cw-7},${rt+14}`} fill="none" stroke={rf} strokeWidth="1.9" strokeLinecap="round"/>
    </> : <>
      <path d={`M${X+cw/2},${cTop} Q${X+cw/2-2},${cTop-rh*0.56} ${X+cw/2-2},${rt+9}`} fill="none" stroke={ro} strokeWidth="4"   strokeLinecap="round" opacity="0.48"/>
      <path d={`M${X+cw/2},${cTop} Q${X+cw/2-2},${cTop-rh*0.56} ${X+cw/2-2},${rt+9}`} fill="none" stroke={rf} strokeWidth="2.2" strokeLinecap="round"/>
    </>;
  } else {
    const rb = cBot + rh;
    roots = type === 'molar' ? <>
      <path d={`M${X+7},${cBot} Q${X+5},${cBot+rh*0.5} ${X+5},${rb-14}`}           fill="none" stroke={ro} strokeWidth="4"   strokeLinecap="round" opacity="0.50"/>
      <path d={`M${X+cw-7},${cBot} Q${X+cw-5},${cBot+rh*0.5} ${X+cw-5},${rb-18}`}  fill="none" stroke={ro} strokeWidth="4"   strokeLinecap="round" opacity="0.50"/>
      <path d={`M${X+cw/2},${cBot} Q${X+cw/2},${cBot+rh*0.52} ${X+cw/2},${rb-8}`}   fill="none" stroke={ro} strokeWidth="3.5" strokeLinecap="round" opacity="0.42"/>
      <path d={`M${X+7},${cBot} Q${X+5},${cBot+rh*0.5} ${X+5},${rb-14}`}           fill="none" stroke={rf} strokeWidth="2.2" strokeLinecap="round"/>
      <path d={`M${X+cw-7},${cBot} Q${X+cw-5},${cBot+rh*0.5} ${X+cw-5},${rb-18}`}  fill="none" stroke={rf} strokeWidth="2.2" strokeLinecap="round"/>
      <path d={`M${X+cw/2},${cBot} Q${X+cw/2},${cBot+rh*0.52} ${X+cw/2},${rb-8}`}   fill="none" stroke={rf} strokeWidth="1.8" strokeLinecap="round"/>
    </> : type === 'premolar' ? <>
      <path d={`M${X+8},${cBot} Q${X+7},${cBot+rh*0.52} ${X+7},${rb-12}`}           fill="none" stroke={ro} strokeWidth="3.2" strokeLinecap="round" opacity="0.50"/>
      <path d={`M${X+cw-8},${cBot} Q${X+cw-7},${cBot+rh*0.52} ${X+cw-7},${rb-14}`}  fill="none" stroke={ro} strokeWidth="3.2" strokeLinecap="round" opacity="0.50"/>
      <path d={`M${X+8},${cBot} Q${X+7},${cBot+rh*0.52} ${X+7},${rb-12}`}           fill="none" stroke={rf} strokeWidth="1.9" strokeLinecap="round"/>
      <path d={`M${X+cw-8},${cBot} Q${X+cw-7},${cBot+rh*0.52} ${X+cw-7},${rb-14}`}  fill="none" stroke={rf} strokeWidth="1.9" strokeLinecap="round"/>
    </> : <>
      <path d={`M${X+cw/2},${cBot} Q${X+cw/2-2},${cBot+rh*0.56} ${X+cw/2-2},${rb-9}`} fill="none" stroke={ro} strokeWidth="4"   strokeLinecap="round" opacity="0.48"/>
      <path d={`M${X+cw/2},${cBot} Q${X+cw/2-2},${cBot+rh*0.56} ${X+cw/2-2},${rb-9}`} fill="none" stroke={rf} strokeWidth="2.2" strokeLinecap="round"/>
    </>;
  }

  const surfW  = cw * 0.20;
  const numY   = isLower ? cBot+rh+14 : cTop-rh-6;

  return (
    <g>
      {roots}
      <defs><clipPath id={clipId}><path d={crownD}/></clipPath></defs>
      {sel && <rect x={X-4} y={cTop-4} width={cw+8} height={ch+8} rx="6"
        fill="none" stroke="#0F7B6C" strokeWidth="2" strokeDasharray="4,2" opacity="0.8"/>}
      <path d={crownD} fill={c.crown} stroke={c.outline} strokeWidth={sw}/>

      {/* Surface zones */}
      <g clipPath={`url(#${clipId})`}>
        {surfs.includes('mesial')                                       && <rect x={X}          y={cTop} width={surfW}    height={ch} fill={c.surf}/>}
        {surfs.includes('distal')                                       && <rect x={X+cw-surfW} y={cTop} width={surfW}    height={ch} fill={c.surf}/>}
        {(surfs.includes('occlusal')||surfs.includes('incisal'))        && <rect x={X+2} y={isLower?cTop:cBot-8} width={cw-4} height={8} fill={c.surf}/>}
        {(surfs.includes('buccal')||surfs.includes('facial')||surfs.includes('labial'))
          && <rect x={X+surfW} y={cTop+2} width={cw-surfW*2} height={ch-4} fill={c.surf} opacity="0.45"/>}
        {surfs.includes('lingual')
          && <rect x={X+surfW} y={cTop+2} width={cw-surfW*2} height={ch-4} fill={c.surf} opacity="0.45"/>}
      </g>

      {/* Subtle highlight */}
      <rect x={X+cw*0.07} y={!isLower?cTop+3:cTop+ch*0.35} width={cw*0.28} height={ch*0.50}
        rx="2" fill={c.hl} opacity="0.26" clipPath={`url(#${clipId})`}/>

      <text x={X+cw/2} y={numY} textAnchor="middle" fontSize="9"
        fill={sel?'#0F7B6C':'#9A9A9A'} fontFamily="DM Sans, sans-serif" fontWeight={sel?'700':'400'}>{n}</text>
    </g>
  );
}

/* ── Layout data ──────────────────────────────────────────────
   Arch: perfectly symmetric around x=240.
   Gap-free: each pair of adjacent teeth is separated by
   sum-of-rx + 2px only. Teeth 8/9 meet at the midline.
   Quadratic arch curve: y = 10 + 0.00238 * (|cx-240|)²
──────────────────────────────────────────────────────────── */
// [n, cx, cy, rx, ry]
const ARCH_U = [
  [ 1, 59, 88,14,11],[ 2, 89, 64,14,11],[ 3,119, 45,14,11],[ 4,147, 31,12,10],
  [ 5,172, 21,11, 9],[ 6,194, 15, 9, 8],[ 7,213, 12, 8, 7],[ 8,231, 10, 8, 7],
  [ 9,249, 10, 8, 7],[10,267, 12, 8, 7],[11,286, 15, 9, 8],[12,308, 21,11, 9],
  [13,333, 31,12,10],[14,361, 45,14,11],[15,391, 64,14,11],[16,421, 88,14,11],
];
const ARCH_L = [
  [32, 59,222,14,11],[31, 89,246,14,11],[30,119,264,14,11],[29,147,278,12,10],
  [28,172,288,11, 9],[27,194,294, 9, 8],[26,213,298, 8, 7],[25,231,300, 8, 7],
  [24,249,300, 8, 7],[23,267,298, 8, 7],[22,286,294, 9, 8],[21,308,288,11, 9],
  [20,333,278,12,10],[19,361,264,14,11],[18,391,246,14,11],[17,421,222,14,11],
];

// Front/lingual: teeth 5-12 upper, 21-28 lower  [n, x, w, h]
const upperFront = [
  [ 5, 18,60,44],[ 6, 86,50,50],[ 7,144,42,56],[ 8,194,38,62],
  [ 9,242,38,62],[10,290,42,56],[11,340,50,50],[12,400,60,44],
];
const lowerFront = [
  [28, 18,60,44],[27, 86,50,50],[26,144,42,54],[25,194,38,58],
  [24,242,38,58],[23,290,42,54],[22,340,50,50],[21,400,60,44],
];

// Side view: spacing 80px, start 8px
const SPC = 80, S0 = 8;
const upperRight = [1,2,3,4,5,6,7,8];
const lowerRight = [32,31,30,29,28,27,26,25];
const upperLeft  = [16,15,14,13,12,11,10,9];
const lowerLeft  = [17,18,19,20,21,22,23,24];

/* ── Gum bands ───────────────────────────────────────────── */
const GUM_FRONT = (<>
  <path d="M14,92 Q240,70 466,92 L466,110 Q240,90 14,110Z"    fill="#EFB8B0" stroke="#DFA898" strokeWidth="0.5" opacity="0.58"/>
  <path d="M14,218 Q240,240 466,218 L466,200 Q240,220 14,200Z" fill="#EFB8B0" stroke="#DFA898" strokeWidth="0.5" opacity="0.58"/>
</>);
const GUM_SIDE = (<>
  <path d="M6,168 Q200,155 420,153 Q560,152 660,160 L660,182 Q560,174 420,173 Q200,175 6,188Z"
    fill="#EFB8B0" stroke="#DFA898" strokeWidth="0.5" opacity="0.50"/>
  <path d="M6,228 Q200,241 420,243 Q560,244 660,236 L660,258 Q560,266 420,263 Q200,261 6,248Z"
    fill="#EFB8B0" stroke="#DFA898" strokeWidth="0.5" opacity="0.50"/>
</>);

/* ── Surface Key panel ───────────────────────────────────────
   Patient-friendly reference shown beside the chart.
──────────────────────────────────────────────────────────── */
export function SurfaceKey() {
  const DT = '#C4A840';                      // tooth outline
  const DZ = 'rgba(74,144,217,0.20)';        // zone tint
  const DL = '#4A8FC8';                      // label colour

  const rows = [
    { abbr:'M', name:'Mesial',          desc:'Faces the front / midline of your mouth' },
    { abbr:'D', name:'Distal',          desc:'Faces the back of your mouth' },
    { abbr:'B', name:'Buccal / Facial', desc:'Outer surface — toward your cheek or lip' },
    { abbr:'L', name:'Lingual',         desc:'Inner surface — toward your tongue' },
    { abbr:'O', name:'Occlusal',        desc:'Chewing surface on back teeth' },
    { abbr:'I', name:'Incisal',         desc:'Biting edge on front teeth' },
  ];

  return (
    <div style={{ padding:'16px 14px' }}>

      {/* Annotated diagram — molar, top (occlusal) view */}
      <svg viewBox="0 0 100 102" width="100%" style={{ display:'block', marginBottom:'14px' }}>
        {/* Tooth body */}
        <rect x="19" y="16" width="62" height="60" rx="9" fill="#F8F8F2" stroke={DT} strokeWidth="1.5"/>
        {/* Zone tints */}
        <rect x="19" y="16" width="62" height="14" rx="6" fill={DZ}/>   {/* B — top  */}
        <rect x="19" y="62" width="62" height="14" rx="6" fill={DZ}/>   {/* L — bot  */}
        <rect x="19" y="30" width="15" height="32" fill={DZ}/>           {/* M — left */}
        <rect x="66" y="30" width="15" height="32" fill={DZ}/>           {/* D — right*/}
        <ellipse cx="50" cy="46" rx="12" ry="11" fill={DZ}/>             {/* O — mid  */}
        {/* Re-stroke outline on top */}
        <rect x="19" y="16" width="62" height="60" rx="9" fill="none" stroke={DT} strokeWidth="1.5"/>

        {/* Labels + tick lines */}
        <text x="50" y="8.5" textAnchor="middle" fontSize="10.5" fontWeight="700" fill={DL} fontFamily="DM Sans,sans-serif">B</text>
        <line x1="50" y1="11" x2="50" y2="16" stroke={DL} strokeWidth="1" opacity="0.65"/>

        <text x="50" y="98" textAnchor="middle" fontSize="10.5" fontWeight="700" fill={DL} fontFamily="DM Sans,sans-serif">L</text>
        <line x1="50" y1="76" x2="50" y2="93" stroke={DL} strokeWidth="1" opacity="0.65"/>

        <text x="7"  y="48.5" textAnchor="middle" fontSize="10.5" fontWeight="700" fill={DL} fontFamily="DM Sans,sans-serif">M</text>
        <line x1="14" y1="46" x2="19" y2="46" stroke={DL} strokeWidth="1" opacity="0.65"/>

        <text x="93" y="48.5" textAnchor="middle" fontSize="10.5" fontWeight="700" fill={DL} fontFamily="DM Sans,sans-serif">D</text>
        <line x1="81" y1="46" x2="86" y2="46" stroke={DL} strokeWidth="1" opacity="0.65"/>

        <text x="50" y="49.5" textAnchor="middle" fontSize="9.5" fontWeight="700" fill={DL} fontFamily="DM Sans,sans-serif">O</text>

        <text x="50" y="102" textAnchor="middle" fontSize="6.5" fill="#999" fontFamily="DM Sans,sans-serif">top view</text>
      </svg>

      {/* Surface list */}
      <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
        {rows.map(({ abbr, name, desc }) => (
          <div key={abbr} style={{ display:'flex', gap:'7px', alignItems:'flex-start' }}>
            <span style={{
              width:'21px', height:'21px', borderRadius:'5px', flexShrink:0,
              background:'var(--teal-light)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:'0.68rem', fontWeight:'800', color:'var(--teal-dark)',
              marginTop:'1px',
            }}>{abbr}</span>
            <div>
              <p style={{ fontSize:'0.76rem', fontWeight:'600', color:'var(--ink)', lineHeight:'1.2', marginBottom:'2px' }}>{name}</p>
              <p style={{ fontSize:'0.68rem', color:'var(--ink-tertiary)', lineHeight:'1.35' }}>{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Main export ─────────────────────────────────────────── */
export default function ToothChart({ findings = [], onToothSelect }) {
  const [view, setView]       = useState('arch');
  const [selected, setSelected] = useState(null);

  const findingMap = {};
  findings.forEach(f => { findingMap[f.toothNumber] = f; });

  const handleClick = (n) => {
    const next = selected === n ? null : n;
    setSelected(next);
    if (onToothSelect) onToothSelect(next, next ? (findingMap[next] || null) : null);
  };

  const counts = {
    urgent:   findings.filter(f => f.priority === 'urgent').length,
    moderate: findings.filter(f => f.priority === 'moderate').length,
    watch:    findings.filter(f => f.priority === 'watch').length,
    healthy:  findings.filter(f => f.priority === 'healthy').length,
  };

  const VIEWS = [
    ['arch',       'Arch (top)'],
    ['front',      'Front'],
    ['side-right', 'Right side'],
    ['side-left',  'Left side'],
    ['lingual',    'Lingual'],
  ];

  return (
    <div>
      {/* Status badges — full width */}
      <div style={{ display:'flex', gap:'8px', marginBottom:'12px', flexWrap:'wrap' }}>
        {counts.urgent   > 0 && <span className="badge badge-urgent">⚠ {counts.urgent} urgent</span>}
        {counts.moderate > 0 && <span className="badge badge-moderate">● {counts.moderate} moderate</span>}
        {counts.watch    > 0 && <span className="badge badge-watch">◉ {counts.watch} watch</span>}
        {counts.healthy  > 0 && <span className="badge badge-healthy">✓ {counts.healthy} healthy</span>}
      </div>

      {/* View tabs */}
      <div style={{ display:'flex', gap:'3px', background:'var(--surface-3)', borderRadius:'var(--r-md)', padding:'3px', marginBottom:'14px', flexWrap:'wrap' }}>
        {VIEWS.map(([v, label]) => (
          <button key={v} onClick={() => { setView(v); setSelected(null); }} style={{
            flex:1, minWidth:'58px', padding:'7px 5px', border:'none', cursor:'pointer',
            fontFamily:'var(--font-sans)', fontSize:'0.8rem', fontWeight:view===v?'600':'400',
            borderRadius:'var(--r-sm)', color:view===v?'var(--ink)':'var(--ink-tertiary)',
            background:view===v?'var(--surface)':'transparent',
            boxShadow:view===v?'var(--shadow-sm)':'none', transition:'all 0.15s', whiteSpace:'nowrap',
          }}>{label}</button>
        ))}
      </div>

      {/* ── ARCH ── */}
      {view === 'arch' && (
        <svg width="100%" viewBox="0 0 480 332" style={{ display:'block' }}>
          <text x="240" y="146" textAnchor="middle" fontSize="10" fill="#AAA" fontFamily="DM Sans, sans-serif">↑ Upper — occlusal view</text>
          <text x="240" y="180" textAnchor="middle" fontSize="10" fill="#AAA" fontFamily="DM Sans, sans-serif">↓ Lower — occlusal view</text>
          {ARCH_U.map(([n,cx,cy,rx,ry]) => (
            <g key={n} onClick={() => handleClick(n)} style={{cursor:'pointer'}}>
              <ArchTooth n={n} cx={cx} cy={cy} rx={rx} ry={ry} finding={findingMap[n]} selected={selected}/>
            </g>
          ))}
          <line x1="32" y1="162" x2="448" y2="162" stroke="#C8BCA8" strokeWidth="0.6" strokeDasharray="4,3" opacity="0.50"/>
          {ARCH_L.map(([n,cx,cy,rx,ry]) => (
            <g key={n} onClick={() => handleClick(n)} style={{cursor:'pointer'}}>
              <ArchTooth n={n} cx={cx} cy={cy} rx={rx} ry={ry} finding={findingMap[n]} selected={selected}/>
            </g>
          ))}
        </svg>
      )}

      {/* ── FRONT ── */}
      {view === 'front' && (
        <svg width="100%" viewBox="0 0 480 310" style={{ display:'block' }}>
          <text x="240" y="12" textAnchor="middle" fontSize="10" fill="#AAA" fontFamily="DM Sans, sans-serif">Upper — facial view · #5–12</text>
          <text x="240" y="305" textAnchor="middle" fontSize="10" fill="#AAA" fontFamily="DM Sans, sans-serif">Lower — facial view · #21–28</text>
          {GUM_FRONT}
          {upperFront.map(([n,x,w,h]) => (
            <g key={n} onClick={() => handleClick(n)} style={{cursor:'pointer'}}>
              <FrontTooth n={n} x={x} y={96-h} w={w} h={h} finding={findingMap[n]} selected={selected} lower={false}/>
            </g>
          ))}
          {lowerFront.map(([n,x,w,h]) => (
            <g key={n} onClick={() => handleClick(n)} style={{cursor:'pointer'}}>
              <FrontTooth n={n} x={x} y={224} w={w} h={h} finding={findingMap[n]} selected={selected} lower={true}/>
            </g>
          ))}
          <text x="465" y="155" textAnchor="end" fontSize="9" fill="#CCC" fontFamily="DM Sans, sans-serif">back teeth not shown</text>
        </svg>
      )}

      {/* ── LINGUAL ── */}
      {view === 'lingual' && (
        <svg width="100%" viewBox="0 0 480 310" style={{ display:'block' }}>
          <text x="240" y="12" textAnchor="middle" fontSize="10" fill="#AAA" fontFamily="DM Sans, sans-serif">Upper — palatal view · #5–12</text>
          <text x="240" y="305" textAnchor="middle" fontSize="10" fill="#AAA" fontFamily="DM Sans, sans-serif">Lower — lingual view · #21–28</text>
          <path d="M14,92 Q240,70 466,92 L466,110 Q240,90 14,110Z"    fill="#E5ADA4" stroke="#D09888" strokeWidth="0.5" opacity="0.50"/>
          <path d="M14,218 Q240,240 466,218 L466,200 Q240,220 14,200Z" fill="#E5ADA4" stroke="#D09888" strokeWidth="0.5" opacity="0.50"/>
          {upperFront.map(([n,x,w,h]) => (
            <g key={n} onClick={() => handleClick(n)} style={{cursor:'pointer'}}>
              <LingualTooth n={n} x={x} y={96-h} w={w} h={h} finding={findingMap[n]} selected={selected} lower={false}/>
            </g>
          ))}
          {lowerFront.map(([n,x,w,h]) => (
            <g key={n} onClick={() => handleClick(n)} style={{cursor:'pointer'}}>
              <LingualTooth n={n} x={x} y={224} w={w} h={h} finding={findingMap[n]} selected={selected} lower={true}/>
            </g>
          ))}
          <text x="465" y="155" textAnchor="end" fontSize="9" fill="#CCC" fontFamily="DM Sans, sans-serif">back teeth not shown</text>
        </svg>
      )}

      {/* ── RIGHT SIDE ── */}
      {view === 'side-right' && (
        <svg width="100%" viewBox="0 0 660 460" style={{ display:'block' }}>
          <text x="330" y="12" textAnchor="middle" fontSize="10" fill="#AAA" fontFamily="DM Sans, sans-serif">Patient's right — buccal profile · #1–8 / #25–32</text>
          {GUM_SIDE}
          {upperRight.map((n,i) => <g key={n} onClick={() => handleClick(n)} style={{cursor:'pointer'}}><SideTooth n={n} tx={S0+i*SPC} isLower={false} finding={findingMap[n]} selected={selected}/></g>)}
          {lowerRight.map((n,i) => <g key={n} onClick={() => handleClick(n)} style={{cursor:'pointer'}}><SideTooth n={n} tx={S0+i*SPC} isLower={true}  finding={findingMap[n]} selected={selected}/></g>)}
          <text x="650" y="200" textAnchor="end" fontSize="9" fill="#CCC" fontFamily="DM Sans, sans-serif">back → front</text>
        </svg>
      )}

      {/* ── LEFT SIDE ── */}
      {view === 'side-left' && (
        <svg width="100%" viewBox="0 0 660 460" style={{ display:'block' }}>
          <text x="330" y="12" textAnchor="middle" fontSize="10" fill="#AAA" fontFamily="DM Sans, sans-serif">Patient's left — buccal profile · #9–16 / #17–24</text>
          {GUM_SIDE}
          {upperLeft.map((n,i) => <g key={n} onClick={() => handleClick(n)} style={{cursor:'pointer'}}><SideTooth n={n} tx={S0+i*SPC} isLower={false} finding={findingMap[n]} selected={selected}/></g>)}
          {lowerLeft.map((n,i) => <g key={n} onClick={() => handleClick(n)} style={{cursor:'pointer'}}><SideTooth n={n} tx={S0+i*SPC} isLower={true}  finding={findingMap[n]} selected={selected}/></g>)}
          <text x="650" y="200" textAnchor="end" fontSize="9" fill="#CCC" fontFamily="DM Sans, sans-serif">back → front</text>
        </svg>
      )}

      {/* Legend */}
      <div style={{ display:'flex', gap:'12px', flexWrap:'wrap', marginTop:'10px', paddingTop:'10px', borderTop:'1px solid var(--border)' }}>
        {[
          ['#F8F8F2','#C4A840','Healthy'],
          ['#F8D4D4','#DC3545','Urgent'],
          ['#FDE8C8','#E07B00','Moderate'],
          ['#D8ECFB','#1A7FD4','Watch'],
          ['rgba(26,127,212,0.30)','#1A7FD4','Affected surface'],
        ].map(([bg,border,label]) => (
          <div key={label} style={{ display:'flex', alignItems:'center', gap:'5px', fontSize:'0.75rem', color:'var(--ink-secondary)' }}>
            <div style={{ width:'10px', height:'10px', borderRadius:'2px', background:bg, border:`1.5px solid ${border}` }}/>
            {label}
          </div>
        ))}
        <div style={{ fontSize:'0.75rem', color:'var(--ink-tertiary)', marginLeft:'auto' }}>Tap any tooth for details</div>
      </div>
    </div>
  );
}
