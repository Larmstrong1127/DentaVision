import React, { useState } from 'react';

/* ── Status color palettes ─────────────────────────────────── */
const SC = {
  healthy:  { fill:'#F5F0E8', stroke:'#C8B89A', dentin:'#EDE5D5', hl:'#FDFAF5', sh:'#B8A888', root:'#D4C8A8', label:'Healthy',  badgeClass:'badge badge-healthy'  },
  moderate: { fill:'#FDE8C8', stroke:'#E07B00', dentin:'#F5D5A0', hl:'#FFF5E8', sh:'#A05800', root:'#E8C888', label:'Moderate', badgeClass:'badge badge-moderate' },
  urgent:   { fill:'#F8D4D4', stroke:'#DC3545', dentin:'#F0B8B8', hl:'#FDEAEA', sh:'#A01828', root:'#E8A0A0', label:'Urgent',   badgeClass:'badge badge-urgent'   },
  watch:    { fill:'#D8ECFB', stroke:'#1A7FD4', dentin:'#C0DCEF', hl:'#EEF7FE', sh:'#0A5A9C', root:'#A8CCE0', label:'Watch',    badgeClass:'badge badge-watch'    },
  missing:  { fill:'#E8E8E8', stroke:'#AAAAAA', dentin:'#DCDCDC', hl:'#F5F5F5', sh:'#888888', root:'#D0D0D0', label:'Missing',  badgeClass:'badge badge-gray'     },
};

const SURF_OVERLAY = '#CC220055';

const TT = {
  1:'molar',2:'molar',3:'molar',4:'premolar',5:'premolar',6:'canine',7:'incisor',8:'incisor',
  9:'incisor',10:'incisor',11:'canine',12:'premolar',13:'premolar',14:'molar',15:'molar',16:'molar',
  17:'molar',18:'molar',19:'molar',20:'premolar',21:'premolar',22:'canine',23:'incisor',24:'incisor',
  25:'incisor',26:'incisor',27:'canine',28:'premolar',29:'premolar',30:'molar',31:'molar',32:'molar',
};

const ARCH_U = [
  [1,54,68,13,10],[2,78,50,13,10],[3,104,36,13,10],[4,129,24,11,9],[5,153,18,11,9],
  [6,176,15,9,8],[7,198,14,8,7],[8,219,14,8,7],[9,241,14,8,7],[10,263,15,8,7],
  [11,286,18,9,8],[12,311,24,11,9],[13,336,36,11,9],[14,362,50,13,10],[15,388,68,13,10],[16,411,86,13,10]
];
const ARCH_L = [
  [17,411,224,13,10],[18,388,242,13,10],[19,362,258,13,10],[20,336,272,11,9],[21,311,282,11,9],
  [22,286,288,9,8],[23,263,290,8,7],[24,241,291,8,7],[25,219,291,8,7],[26,198,290,8,7],
  [27,176,288,9,8],[28,153,282,11,9],[29,129,272,11,9],[30,104,258,13,10],[31,78,242,13,10],[32,54,224,13,10]
];

function ArchTooth({ n, cx, cy, rx, ry, finding, selected }) {
  const status = finding?.priority || 'healthy';
  const c = SC[status] || SC.healthy;
  const surfs = finding?.surfaces || [];
  const sel = selected === n;
  const type = TT[n];
  const sw = sel ? 2 : 1;

  let inner = null;
  if (type === 'molar') {
    inner = <>
      <ellipse cx={cx-rx*0.28} cy={cy-ry*0.25} rx={rx*0.28} ry={ry*0.24} fill={surfs.includes('occlusal')||surfs.includes('mesial')?SURF_OVERLAY:'#FDFAF5'} stroke={c.stroke} strokeWidth="0.4" opacity="0.9"/>
      <ellipse cx={cx+rx*0.28} cy={cy-ry*0.25} rx={rx*0.28} ry={ry*0.24} fill={surfs.includes('occlusal')||surfs.includes('distal')?SURF_OVERLAY:'#FDFAF5'} stroke={c.stroke} strokeWidth="0.4" opacity="0.9"/>
      <ellipse cx={cx-rx*0.28} cy={cy+ry*0.25} rx={rx*0.28} ry={ry*0.24} fill={surfs.includes('occlusal')||surfs.includes('mesial')?SURF_OVERLAY:'#F5EFE5'} stroke={c.stroke} strokeWidth="0.4" opacity="0.85"/>
      <ellipse cx={cx+rx*0.28} cy={cy+ry*0.25} rx={rx*0.28} ry={ry*0.24} fill={surfs.includes('occlusal')||surfs.includes('distal')?SURF_OVERLAY:'#F5EFE5'} stroke={c.stroke} strokeWidth="0.4" opacity="0.85"/>
      <line x1={cx-rx*0.62} y1={cy} x2={cx+rx*0.62} y2={cy} stroke={c.sh} strokeWidth="0.5" opacity="0.4"/>
      <line x1={cx} y1={cy-ry*0.62} x2={cx} y2={cy+ry*0.62} stroke={c.sh} strokeWidth="0.5" opacity="0.4"/>
      {surfs.includes('buccal')&&<ellipse cx={cx} cy={cy-ry*0.72} rx={rx*0.7} ry={ry*0.18} fill={SURF_OVERLAY} stroke="none"/>}
      {surfs.includes('lingual')&&<ellipse cx={cx} cy={cy+ry*0.72} rx={rx*0.7} ry={ry*0.18} fill={SURF_OVERLAY} stroke="none"/>}
    </>;
  } else if (type === 'premolar') {
    inner = <>
      <ellipse cx={cx} cy={cy-ry*0.24} rx={rx*0.55} ry={ry*0.22} fill={surfs.includes('occlusal')?SURF_OVERLAY:'#FDFAF5'} stroke={c.stroke} strokeWidth="0.4" opacity="0.85"/>
      <ellipse cx={cx} cy={cy+ry*0.24} rx={rx*0.55} ry={ry*0.22} fill={surfs.includes('occlusal')?SURF_OVERLAY:'#F5EFE5'} stroke={c.stroke} strokeWidth="0.4" opacity="0.8"/>
      <line x1={cx} y1={cy-ry*0.55} x2={cx} y2={cy+ry*0.55} stroke={c.sh} strokeWidth="0.5" opacity="0.35"/>
      {surfs.includes('mesial')&&<ellipse cx={cx-rx*0.6} cy={cy} rx={rx*0.28} ry={ry*0.7} fill={SURF_OVERLAY} stroke="none"/>}
      {surfs.includes('distal')&&<ellipse cx={cx+rx*0.6} cy={cy} rx={rx*0.28} ry={ry*0.7} fill={SURF_OVERLAY} stroke="none"/>}
      {surfs.includes('buccal')&&<ellipse cx={cx} cy={cy-ry*0.72} rx={rx*0.6} ry={ry*0.18} fill={SURF_OVERLAY} stroke="none"/>}
      {surfs.includes('lingual')&&<ellipse cx={cx} cy={cy+ry*0.72} rx={rx*0.6} ry={ry*0.18} fill={SURF_OVERLAY} stroke="none"/>}
    </>;
  } else {
    inner = <>
      <ellipse cx={cx} cy={cy} rx={rx*0.55} ry={ry*0.55} fill={surfs.includes('occlusal')||surfs.includes('incisal')?SURF_OVERLAY:'#FDFAF5'} stroke={c.stroke} strokeWidth="0.4" opacity="0.7"/>
      {surfs.includes('mesial')&&<ellipse cx={cx-rx*0.62} cy={cy} rx={rx*0.26} ry={ry*0.7} fill={SURF_OVERLAY} stroke="none"/>}
      {surfs.includes('distal')&&<ellipse cx={cx+rx*0.62} cy={cy} rx={rx*0.26} ry={ry*0.7} fill={SURF_OVERLAY} stroke="none"/>}
      {(surfs.includes('facial')||surfs.includes('buccal'))&&<ellipse cx={cx} cy={cy-ry*0.68} rx={rx*0.65} ry={ry*0.2} fill={SURF_OVERLAY} stroke="none"/>}
      {surfs.includes('lingual')&&<ellipse cx={cx} cy={cy+ry*0.68} rx={rx*0.65} ry={ry*0.2} fill={SURF_OVERLAY} stroke="none"/>}
    </>;
  }

  return (
    <g>
      {sel&&<ellipse cx={cx} cy={cy} rx={rx+5} ry={ry+5} fill="none" stroke="#0F7B6C" strokeWidth="2" strokeDasharray="4,2" opacity="0.8"/>}
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={c.fill} stroke={c.stroke} strokeWidth={sw}/>
      <ellipse cx={cx-rx*0.08} cy={cy-ry*0.08} rx={rx*0.78} ry={ry*0.72} fill={c.dentin} stroke="none" opacity="0.35"/>
      {inner}
      <text x={cx} y={cy+ry+11} textAnchor="middle" fontSize="9" fill={sel?'#0F7B6C':'#999'} fontFamily="DM Sans, sans-serif" fontWeight={sel?'600':'400'}>{n}</text>
    </g>
  );
}

function FrontTooth({ n, x, y, w, h, finding, selected, lower }) {
  const status = finding?.priority || 'healthy';
  const c = SC[status] || SC.healthy;
  const surfs = finding?.surfaces || [];
  const sel = selected === n;
  const type = TT[n];
  const sw = sel ? 2 : 0.8;
  const mw = w*0.18, bh = h*0.14, ih = h*0.12;

  let crownPath, highlight;
  if (type === 'incisor') {
    crownPath = !lower
      ? `M${x+2},${y+h} L${x},${y+8} Q${x+w/2},${y-4} ${x+w},${y+8} L${x+w-2},${y+h}Z`
      : `M${x+2},${y} L${x},${y+h-8} Q${x+w/2},${y+h+4} ${x+w},${y+h-8} L${x+w-2},${y}Z`;
    highlight = !lower
      ? `M${x+3},${y+h*0.2} Q${x+w*0.35},${y+3} ${x+w*0.55},${y+2} Q${x+w*0.5},${y+h*0.08} ${x+w*0.32},${y+h*0.14}Z`
      : `M${x+3},${y+h*0.8} Q${x+w*0.35},${y+h-3} ${x+w*0.55},${y+h-2} Q${x+w*0.5},${y+h*0.92} ${x+w*0.32},${y+h*0.86}Z`;
  } else if (type === 'canine') {
    crownPath = !lower
      ? `M${x+3},${y+h} L${x},${y+10} Q${x+w*0.5},${y-6} ${x+w},${y+10} L${x+w-3},${y+h}Z`
      : `M${x+3},${y} L${x},${y+h-10} Q${x+w*0.5},${y+h+6} ${x+w},${y+h-10} L${x+w-3},${y}Z`;
    highlight = !lower
      ? `M${x+4},${y+h*0.18} Q${x+w*0.38},${y+2} ${x+w*0.52},${y+1} Q${x+w*0.5},${y+h*0.08} ${x+w*0.33},${y+h*0.15}Z`
      : `M${x+4},${y+h*0.82} Q${x+w*0.38},${y+h-2} ${x+w*0.52},${y+h-1} Q${x+w*0.5},${y+h*0.92} ${x+w*0.33},${y+h*0.85}Z`;
  } else {
    crownPath = `M${x},${y} h${w} v${h} h${-w}Z`;
    highlight = `M${x+3},${y+h*(lower?0.8:0.2)} Q${x+w*0.35},${y+(lower?h-3:3)} ${x+w*0.55},${y+(lower?h-2:2)} Q${x+w*0.5},${y+h*(lower?0.92:0.08)} ${x+w*0.32},${y+h*(lower?0.86:0.14)}Z`;
  }

  return (
    <g>
      {sel&&<rect x={x-4} y={y-4} width={w+8} height={h+8} rx="7" fill="none" stroke="#0F7B6C" strokeWidth="2" strokeDasharray="4,2" opacity="0.8"/>}
      <path d={crownPath} fill={c.fill} stroke={c.stroke} strokeWidth={sw}/>
      <rect x={x+2} y={y+2} width={w-4} height={h-4} rx="3" fill={c.dentin} stroke="none" opacity="0.28"/>
      {surfs.includes('mesial')&&<rect x={x} y={y+bh} width={mw} height={h-bh*2} rx="2" fill={SURF_OVERLAY} stroke="none"/>}
      {surfs.includes('distal')&&<rect x={x+w-mw} y={y+bh} width={mw} height={h-bh*2} rx="2" fill={SURF_OVERLAY} stroke="none"/>}
      {!lower&&(surfs.includes('buccal')||surfs.includes('facial'))&&<rect x={x+mw} y={y} width={w-mw*2} height={bh*1.4} rx="2" fill={SURF_OVERLAY} stroke="none"/>}
      {lower&&(surfs.includes('buccal')||surfs.includes('facial'))&&<rect x={x+mw} y={y+h-bh*1.4} width={w-mw*2} height={bh*1.4} rx="2" fill={SURF_OVERLAY} stroke="none"/>}
      {!lower&&surfs.includes('incisal')&&<rect x={x+mw} y={y+h-ih} width={w-mw*2} height={ih} rx="2" fill={SURF_OVERLAY} stroke="none"/>}
      {lower&&surfs.includes('incisal')&&<rect x={x+mw} y={y} width={w-mw*2} height={ih} rx="2" fill={SURF_OVERLAY} stroke="none"/>}
      {surfs.includes('occlusal')&&<rect x={x+mw} y={y+h*0.25} width={w-mw*2} height={h*0.5} rx="3" fill={SURF_OVERLAY} stroke="none"/>}
      {surfs.includes('lingual')&&<rect x={x+mw} y={y+bh} width={w-mw*2} height={h-bh*2} rx="3" fill={SURF_OVERLAY} stroke="none" opacity="0.4"/>}
      <path d={highlight} fill={c.hl} stroke="none" opacity="0.72"/>
      {type==='molar'&&<><line x1={x+w*0.33} y1={y+4} x2={x+w*0.33} y2={y+h-4} stroke={c.sh} strokeWidth="0.5" opacity="0.25"/><line x1={x+w*0.66} y1={y+4} x2={x+w*0.66} y2={y+h-4} stroke={c.sh} strokeWidth="0.5" opacity="0.25"/></>}
      {type==='premolar'&&<line x1={x+w*0.5} y1={y+4} x2={x+w*0.5} y2={y+h-4} stroke={c.sh} strokeWidth="0.5" opacity="0.22"/>}
      {type==='incisor'&&!lower&&<path d={`M${x+2},${y+h} Q${x+w*0.2},${y+h+3} ${x+w*0.35},${y+h} Q${x+w*0.5},${y+h+3} ${x+w*0.65},${y+h} Q${x+w*0.8},${y+h+3} ${x+w-2},${y+h}`} fill="none" stroke={c.stroke} strokeWidth="0.5" opacity="0.6"/>}
      {type==='incisor'&&lower&&<path d={`M${x+2},${y} Q${x+w*0.2},${y-3} ${x+w*0.35},${y} Q${x+w*0.5},${y-3} ${x+w*0.65},${y} Q${x+w*0.8},${y-3} ${x+w-2},${y}`} fill="none" stroke={c.stroke} strokeWidth="0.5" opacity="0.6"/>}
      <text x={x+w/2} y={lower?y+h+12:y-5} textAnchor="middle" fontSize="9" fill={sel?'#0F7B6C':'#999'} fontFamily="DM Sans, sans-serif" fontWeight={sel?'600':'400'}>{n}</text>
    </g>
  );
}

function SideTooth({ n, tx, isLower, finding, selected }) {
  const status = finding?.priority || 'healthy';
  const c = SC[status] || SC.healthy;
  const surfs = finding?.surfaces || [];
  const sel = selected === n;
  const type = TT[n];
  const cw = type==='molar'?56:type==='premolar'?44:type==='canine'?30:24;
  const ch = type==='molar'?36:type==='premolar'?38:type==='canine'?44:48;
  const rh = type==='molar'?64:type==='premolar'?72:type==='canine'?84:76;
  const gumLine = isLower ? 220 : 175;
  const crownTop = isLower ? gumLine : gumLine - ch;
  const crownBot = isLower ? gumLine + ch : gumLine;
  const cx = tx;
  const sw = sel ? 2 : 0.8;

  let crownD = '';
  if (type === 'molar') {
    crownD = !isLower
      ? `M${cx},${crownTop+4} Q${cx},${crownTop} ${cx+4},${crownTop} L${cx+cw-4},${crownTop} Q${cx+cw},${crownTop} ${cx+cw},${crownTop+4} L${cx+cw},${crownBot-2} Q${cx+cw*0.85},${crownBot+6} ${cx+cw*0.72},${crownBot} Q${cx+cw*0.62},${crownBot+5} ${cx+cw*0.5},${crownBot} Q${cx+cw*0.38},${crownBot+5} ${cx+cw*0.28},${crownBot} Q${cx+cw*0.15},${crownBot+6} ${cx},${crownBot-2}Z`
      : `M${cx},${crownBot-4} Q${cx},${crownBot} ${cx+4},${crownBot} L${cx+cw-4},${crownBot} Q${cx+cw},${crownBot} ${cx+cw},${crownBot-4} L${cx+cw},${crownTop+2} Q${cx+cw*0.85},${crownTop-6} ${cx+cw*0.72},${crownTop} Q${cx+cw*0.62},${crownTop-5} ${cx+cw*0.5},${crownTop} Q${cx+cw*0.38},${crownTop-5} ${cx+cw*0.28},${crownTop} Q${cx+cw*0.15},${crownTop-6} ${cx},${crownTop+2}Z`;
  } else if (type === 'premolar') {
    crownD = !isLower
      ? `M${cx},${crownTop+4} Q${cx},${crownTop} ${cx+4},${crownTop} L${cx+cw-4},${crownTop} Q${cx+cw},${crownTop} ${cx+cw},${crownTop+4} L${cx+cw},${crownBot-2} Q${cx+cw*0.75},${crownBot+5} ${cx+cw*0.5},${crownBot} Q${cx+cw*0.25},${crownBot+5} ${cx},${crownBot-2}Z`
      : `M${cx},${crownBot-4} Q${cx},${crownBot} ${cx+4},${crownBot} L${cx+cw-4},${crownBot} Q${cx+cw},${crownBot} ${cx+cw},${crownBot-4} L${cx+cw},${crownTop+2} Q${cx+cw*0.75},${crownTop-5} ${cx+cw*0.5},${crownTop} Q${cx+cw*0.25},${crownTop-5} ${cx},${crownTop+2}Z`;
  } else if (type === 'canine') {
    crownD = !isLower
      ? `M${cx+3},${crownTop+ch} L${cx},${crownTop+10} Q${cx+cw/2},${crownTop-2} ${cx+cw},${crownTop+10} L${cx+cw-3},${crownTop+ch}Z`
      : `M${cx+3},${crownTop} L${cx},${crownTop+ch-10} Q${cx+cw/2},${crownTop+ch+2} ${cx+cw},${crownTop+ch-10} L${cx+cw-3},${crownTop}Z`;
  } else {
    crownD = !isLower
      ? `M${cx+2},${crownTop+ch} L${cx},${crownTop+6} Q${cx+cw/2},${crownTop-2} ${cx+cw},${crownTop+6} L${cx+cw-2},${crownTop+ch}Z`
      : `M${cx+2},${crownTop} L${cx},${crownBot-6} Q${cx+cw/2},${crownBot+2} ${cx+cw},${crownBot-6} L${cx+cw-2},${crownTop}Z`;
  }

  const rs = c.stroke, rf = c.root;
  let roots = null;
  if (!isLower) {
    const rt = crownTop - rh;
    roots = type==='molar' ? <>
      <path d={`M${cx+5},${crownTop} Q${cx+3},${crownTop-rh*0.5} ${cx+3},${rt+10}`} fill="none" stroke={rs} strokeWidth="3.5" strokeLinecap="round" opacity="0.65"/>
      <path d={`M${cx+cw-5},${crownTop} Q${cx+cw-3},${crownTop-rh*0.5} ${cx+cw-3},${rt+14}`} fill="none" stroke={rs} strokeWidth="3.5" strokeLinecap="round" opacity="0.65"/>
      <path d={`M${cx+cw/2},${crownTop} Q${cx+cw/2},${crownTop-rh*0.55} ${cx+cw/2-1},${rt+4}`} fill="none" stroke={rs} strokeWidth="3" strokeLinecap="round" opacity="0.55"/>
      <path d={`M${cx+5},${crownTop} Q${cx+3},${crownTop-rh*0.5} ${cx+3},${rt+10}`} fill="none" stroke={rf} strokeWidth="2" strokeLinecap="round"/>
      <path d={`M${cx+cw-5},${crownTop} Q${cx+cw-3},${crownTop-rh*0.5} ${cx+cw-3},${rt+14}`} fill="none" stroke={rf} strokeWidth="2" strokeLinecap="round"/>
      <path d={`M${cx+cw/2},${crownTop} Q${cx+cw/2},${crownTop-rh*0.55} ${cx+cw/2-1},${rt+4}`} fill="none" stroke={rf} strokeWidth="1.6" strokeLinecap="round"/>
    </> : type==='premolar' ? <>
      <path d={`M${cx+7},${crownTop} Q${cx+6},${crownTop-rh*0.55} ${cx+6},${rt+8}`} fill="none" stroke={rs} strokeWidth="3" strokeLinecap="round" opacity="0.6"/>
      <path d={`M${cx+cw-7},${crownTop} Q${cx+cw-6},${crownTop-rh*0.55} ${cx+cw-6},${rt+10}`} fill="none" stroke={rs} strokeWidth="3" strokeLinecap="round" opacity="0.6"/>
      <path d={`M${cx+7},${crownTop} Q${cx+6},${crownTop-rh*0.55} ${cx+6},${rt+8}`} fill="none" stroke={rf} strokeWidth="1.8" strokeLinecap="round"/>
      <path d={`M${cx+cw-7},${crownTop} Q${cx+cw-6},${crownTop-rh*0.55} ${cx+cw-6},${rt+10}`} fill="none" stroke={rf} strokeWidth="1.8" strokeLinecap="round"/>
    </> : <>
      <path d={`M${cx+cw/2},${crownTop} Q${cx+cw/2-1},${crownTop-rh*0.6} ${cx+cw/2-1},${rt+6}`} fill="none" stroke={rs} strokeWidth="3.5" strokeLinecap="round" opacity="0.55"/>
      <path d={`M${cx+cw/2},${crownTop} Q${cx+cw/2-1},${crownTop-rh*0.6} ${cx+cw/2-1},${rt+6}`} fill="none" stroke={rf} strokeWidth="2" strokeLinecap="round"/>
    </>;
  } else {
    const rb = crownBot + rh;
    roots = type==='molar' ? <>
      <path d={`M${cx+5},${crownBot} Q${cx+3},${crownBot+rh*0.5} ${cx+3},${rb-10}`} fill="none" stroke={rs} strokeWidth="3.5" strokeLinecap="round" opacity="0.65"/>
      <path d={`M${cx+cw-5},${crownBot} Q${cx+cw-3},${crownBot+rh*0.5} ${cx+cw-3},${rb-14}`} fill="none" stroke={rs} strokeWidth="3.5" strokeLinecap="round" opacity="0.65"/>
      <path d={`M${cx+cw/2},${crownBot} Q${cx+cw/2},${crownBot+rh*0.55} ${cx+cw/2-1},${rb-4}`} fill="none" stroke={rs} strokeWidth="3" strokeLinecap="round" opacity="0.55"/>
      <path d={`M${cx+5},${crownBot} Q${cx+3},${crownBot+rh*0.5} ${cx+3},${rb-10}`} fill="none" stroke={rf} strokeWidth="2" strokeLinecap="round"/>
      <path d={`M${cx+cw-5},${crownBot} Q${cx+cw-3},${crownBot+rh*0.5} ${cx+cw-3},${rb-14}`} fill="none" stroke={rf} strokeWidth="2" strokeLinecap="round"/>
      <path d={`M${cx+cw/2},${crownBot} Q${cx+cw/2},${crownBot+rh*0.55} ${cx+cw/2-1},${rb-4}`} fill="none" stroke={rf} strokeWidth="1.6" strokeLinecap="round"/>
    </> : type==='premolar' ? <>
      <path d={`M${cx+7},${crownBot} Q${cx+6},${crownBot+rh*0.55} ${cx+6},${crownBot+rh-8}`} fill="none" stroke={rs} strokeWidth="3" strokeLinecap="round" opacity="0.6"/>
      <path d={`M${cx+cw-7},${crownBot} Q${cx+cw-6},${crownBot+rh*0.55} ${cx+cw-6},${crownBot+rh-10}`} fill="none" stroke={rs} strokeWidth="3" strokeLinecap="round" opacity="0.6"/>
      <path d={`M${cx+7},${crownBot} Q${cx+6},${crownBot+rh*0.55} ${cx+6},${crownBot+rh-8}`} fill="none" stroke={rf} strokeWidth="1.8" strokeLinecap="round"/>
      <path d={`M${cx+cw-7},${crownBot} Q${cx+cw-6},${crownBot+rh*0.55} ${cx+cw-6},${crownBot+rh-10}`} fill="none" stroke={rf} strokeWidth="1.8" strokeLinecap="round"/>
    </> : <>
      <path d={`M${cx+cw/2},${crownBot} Q${cx+cw/2-1},${crownBot+rh*0.6} ${cx+cw/2-1},${crownBot+rh-6}`} fill="none" stroke={rs} strokeWidth="3.5" strokeLinecap="round" opacity="0.55"/>
      <path d={`M${cx+cw/2},${crownBot} Q${cx+cw/2-1},${crownBot+rh*0.6} ${cx+cw/2-1},${crownBot+rh-6}`} fill="none" stroke={rf} strokeWidth="2" strokeLinecap="round"/>
    </>;
  }

  const numY = isLower ? crownBot+rh+14 : crownTop-rh-6;
  const surfW = cw*0.2;

  return (
    <g>
      {roots}
      {sel&&<rect x={cx-4} y={crownTop-4} width={cw+8} height={ch+8} rx="6" fill="none" stroke="#0F7B6C" strokeWidth="2" strokeDasharray="4,2" opacity="0.8"/>}
      <path d={crownD} fill={c.fill} stroke={c.stroke} strokeWidth={sw}/>
      <rect x={cx+2} y={crownTop+4} width={cw-4} height={ch-6} rx="2" fill={c.dentin} stroke="none" opacity="0.28"/>
      {type==='molar'&&<><line x1={cx+cw*0.33} y1={crownTop+8} x2={cx+cw*0.33} y2={crownBot-8} stroke={c.sh} strokeWidth="0.6" opacity="0.28"/><line x1={cx+cw*0.66} y1={crownTop+8} x2={cx+cw*0.66} y2={crownBot-8} stroke={c.sh} strokeWidth="0.6" opacity="0.28"/><line x1={cx+4} y1={(crownTop+crownBot)/2} x2={cx+cw-4} y2={(crownTop+crownBot)/2} stroke={c.sh} strokeWidth="0.5" opacity="0.22"/></>}
      {type==='premolar'&&<line x1={cx+cw*0.5} y1={crownTop+6} x2={cx+cw*0.5} y2={crownBot-6} stroke={c.sh} strokeWidth="0.5" opacity="0.25"/>}
      {type==='incisor'&&!isLower&&<path d={`M${cx+2},${crownBot} Q${cx+cw*0.2},${crownBot+3} ${cx+cw*0.35},${crownBot} Q${cx+cw*0.5},${crownBot+3} ${cx+cw*0.65},${crownBot} Q${cx+cw*0.8},${crownBot+3} ${cx+cw-2},${crownBot}`} fill="none" stroke={c.stroke} strokeWidth="0.5" opacity="0.6"/>}
      {type==='incisor'&&isLower&&<path d={`M${cx+2},${crownTop} Q${cx+cw*0.2},${crownTop-3} ${cx+cw*0.35},${crownTop} Q${cx+cw*0.5},${crownTop-3} ${cx+cw*0.65},${crownTop} Q${cx+cw*0.8},${crownTop-3} ${cx+cw-2},${crownTop}`} fill="none" stroke={c.stroke} strokeWidth="0.5" opacity="0.6"/>}
      {surfs.includes('mesial')&&<rect x={cx} y={crownTop+4} width={surfW} height={ch-8} rx="2" fill={SURF_OVERLAY} stroke="none"/>}
      {surfs.includes('distal')&&<rect x={cx+cw-surfW} y={crownTop+4} width={surfW} height={ch-8} rx="2" fill={SURF_OVERLAY} stroke="none"/>}
      {(surfs.includes('occlusal')||surfs.includes('incisal'))&&<rect x={cx+2} y={isLower?crownTop:crownBot-7} width={cw-4} height={8} rx="2" fill={SURF_OVERLAY} stroke="none"/>}
      {(surfs.includes('buccal')||surfs.includes('facial'))&&<rect x={cx+cw*0.15} y={crownTop+4} width={cw*0.7} height={ch-8} rx="2" fill={SURF_OVERLAY} stroke="none" opacity="0.45"/>}
      <text x={cx+cw/2} y={numY} textAnchor="middle" fontSize="9" fill={sel?'#0F7B6C':'#999'} fontFamily="DM Sans, sans-serif" fontWeight={sel?'600':'400'}>{n}</text>
    </g>
  );
}

export default function ToothChart({ findings = [], onToothSelect }) {
  const [view, setView] = useState('arch');
  const [selected, setSelected] = useState(null);

  const findingMap = {};
  findings.forEach(f => { findingMap[f.toothNumber] = f; });

  const handleClick = (n) => {
    const next = selected === n ? null : n;
    setSelected(next);
    if (onToothSelect) onToothSelect(next, next ? (findingMap[next] || null) : null);
  };

  const urgentCount   = findings.filter(f => f.priority === 'urgent').length;
  const moderateCount = findings.filter(f => f.priority === 'moderate').length;
  const watchCount    = findings.filter(f => f.priority === 'watch').length;
  const healthyCount  = findings.filter(f => f.priority === 'healthy').length;

  const SIDE_SPC = 82, SIDE_START = 10;
  const upperSide = [1,2,3,4,5,6,7,8];
  const lowerSide = [32,31,19,20,21,22,23,24];

  const upperFront = [[5,28,60,44],[6,104,50,50],[7,160,42,56],[8,208,38,62],[9,252,38,62],[10,296,42,56],[11,344,50,50],[12,400,60,44]];
  const lowerFront = [[28,28,60,44],[27,104,50,50],[26,160,42,54],[25,208,38,58],[24,252,38,58],[23,296,42,54],[22,344,50,50],[21,400,60,44]];

  return (
    <div>
      <div style={{ display:'flex', gap:'8px', marginBottom:'12px', flexWrap:'wrap' }}>
        {urgentCount>0&&<span className="badge badge-urgent">⚠ {urgentCount} urgent</span>}
        {moderateCount>0&&<span className="badge badge-moderate">● {moderateCount} moderate</span>}
        {watchCount>0&&<span className="badge badge-watch">◉ {watchCount} watch</span>}
        {healthyCount>0&&<span className="badge badge-healthy">✓ {healthyCount} healthy</span>}
      </div>

      <div style={{ display:'flex', gap:'3px', background:'var(--surface-3)', borderRadius:'var(--r-md)', padding:'3px', marginBottom:'12px' }}>
        {[['arch','Arch (top)'],['front','Front'],['side','Side profile']].map(([v,label]) => (
          <button key={v} onClick={() => setView(v)} style={{
            flex:1, padding:'7px', border:'none', cursor:'pointer', fontFamily:'var(--font-sans)',
            fontSize:'0.875rem', fontWeight:view===v?'500':'400', borderRadius:'var(--r-sm)',
            color:view===v?'var(--ink)':'var(--ink-tertiary)',
            background:view===v?'var(--surface)':'transparent',
            boxShadow:view===v?'var(--shadow-sm)':'none', transition:'all 0.15s'
          }}>{label}</button>
        ))}
      </div>

      {view === 'arch' && (
        <svg width="100%" viewBox="0 0 480 318">
          <text x="240" y="140" textAnchor="middle" fontSize="10" fill="#999" fontFamily="DM Sans, sans-serif">↑ Upper jaw — occlusal view</text>
          <text x="240" y="168" textAnchor="middle" fontSize="10" fill="#999" fontFamily="DM Sans, sans-serif">↓ Lower jaw — occlusal view</text>
          {ARCH_U.map(([n,cx,cy,rx,ry]) => (<g key={n} onClick={() => handleClick(n)} style={{cursor:'pointer'}}><ArchTooth n={n} cx={cx} cy={cy} rx={rx} ry={ry} finding={findingMap[n]} selected={selected}/></g>))}
          <line x1="54" y1="152" x2="430" y2="152" stroke="#E2E8F0" strokeWidth="0.5" strokeDasharray="3,3"/>
          <text x="446" y="155" fontSize="8" fill="#CCC" fontFamily="DM Sans, sans-serif">bite</text>
          {ARCH_L.map(([n,cx,cy,rx,ry]) => (<g key={n} onClick={() => handleClick(n)} style={{cursor:'pointer'}}><ArchTooth n={n} cx={cx} cy={cy} rx={rx} ry={ry} finding={findingMap[n]} selected={selected}/></g>))}
        </svg>
      )}

      {view === 'front' && (
        <svg width="100%" viewBox="0 0 480 310">
          <text x="240" y="12" textAnchor="middle" fontSize="10" fill="#999" fontFamily="DM Sans, sans-serif">Upper jaw — facial view · teeth 5–12</text>
          <text x="240" y="305" textAnchor="middle" fontSize="10" fill="#999" fontFamily="DM Sans, sans-serif">Lower jaw — facial view · teeth 21–28</text>
          <path d="M14,92 Q240,70 466,92 L466,110 Q240,90 14,110Z" fill="#F2C4B8" stroke="#E8A898" strokeWidth="0.5" opacity="0.65"/>
          <path d="M14,218 Q240,240 466,218 L466,200 Q240,220 14,200Z" fill="#F2C4B8" stroke="#E8A898" strokeWidth="0.5" opacity="0.65"/>
          {upperFront.map(([n,x,w,h]) => (<g key={n} onClick={() => handleClick(n)} style={{cursor:'pointer'}}><FrontTooth n={n} x={x} y={96-h} w={w} h={h} finding={findingMap[n]} selected={selected} lower={false}/></g>))}
          {lowerFront.map(([n,x,w,h]) => (<g key={n} onClick={() => handleClick(n)} style={{cursor:'pointer'}}><FrontTooth n={n} x={x} y={224} w={w} h={h} finding={findingMap[n]} selected={selected} lower={true}/></g>))}
          <text x="465" y="155" textAnchor="end" fontSize="9" fill="#CCC" fontFamily="DM Sans, sans-serif">back teeth not shown</text>
        </svg>
      )}

      {view === 'side' && (
        <svg width="100%" viewBox="0 0 680 460">
          <text x="340" y="12" textAnchor="middle" fontSize="10" fill="#999" fontFamily="DM Sans, sans-serif">Right side profile — crown and root anatomy</text>
          <path d="M6,168 Q200,155 420,153 Q560,152 672,160 L672,182 Q560,174 420,173 Q200,175 6,188Z" fill="#F2C4B8" stroke="#E8A898" strokeWidth="0.5" opacity="0.55"/>
          <path d="M6,228 Q200,241 420,243 Q560,244 672,236 L672,258 Q560,266 420,263 Q200,261 6,248Z" fill="#F2C4B8" stroke="#E8A898" strokeWidth="0.5" opacity="0.55"/>
          <line x1="6" y1="175" x2="672" y2="175" stroke="#D4C0B0" strokeWidth="0.5" strokeDasharray="3,3" opacity="0.5"/>
          <line x1="6" y1="235" x2="672" y2="235" stroke="#D4C0B0" strokeWidth="0.5" strokeDasharray="3,3" opacity="0.5"/>
          {upperSide.map((n,i) => (<g key={n} onClick={() => handleClick(n)} style={{cursor:'pointer'}}><SideTooth n={n} tx={SIDE_START+i*SIDE_SPC} isLower={false} finding={findingMap[n]} selected={selected}/></g>))}
          {lowerSide.map((n,i) => (<g key={n} onClick={() => handleClick(n)} style={{cursor:'pointer'}}><SideTooth n={n} tx={SIDE_START+i*SIDE_SPC} isLower={true} finding={findingMap[n]} selected={selected}/></g>))}
          <text x="670" y="200" textAnchor="end" fontSize="9" fill="#CCC" fontFamily="DM Sans, sans-serif">back → front</text>
        </svg>
      )}

      <div style={{ display:'flex', gap:'12px', flexWrap:'wrap', marginTop:'8px', paddingTop:'10px', borderTop:'1px solid var(--border)' }}>
        {[['#F5F0E8','#C8B89A','Healthy'],['#F8D4D4','#DC3545','Urgent'],['#FDE8C8','#E07B00','Moderate'],['#D8ECFB','#1A7FD4','Watch'],['#CC220055','#CC2200','Affected surface']].map(([bg,border,label]) => (
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
