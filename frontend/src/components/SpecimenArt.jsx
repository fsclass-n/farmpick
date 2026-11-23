// 고해상도 벡터 표본 일러스트 — 부위(잎·줄기·열매) × 병징(lesion) 조합
const LESIONS = {
  powder: { fill: '#ffffff', stroke: '#e8e4d6', opacity: 0.92, blur: true },
  mold: { fill: '#8c8a83', stroke: '#6d6b64', opacity: 0.85, blur: true },
  yellow: { fill: '#e6c64a', stroke: '#c9a52a', opacity: 0.8 },
  sunken: { fill: '#5a3a22', stroke: '#c97a12', opacity: 0.95 },
  rot: { fill: '#3b2a1e', stroke: '#6b4a2e', opacity: 0.9 },
  insect: { fill: '#1c1915', stroke: '#1c1915', opacity: 1, tiny: true },
  silver: { fill: '#d9e3e6', stroke: '#b4c2c6', opacity: 0.85 },
  none: null,
};

const SPOTS = [
  [62, 70, 9], [96, 58, 6], [120, 92, 11], [80, 112, 7], [138, 128, 8], [104, 142, 5], [70, 150, 6],
];

function Lesions({ kind, clipId, scale = 1 }) {
  const l = LESIONS[kind];
  if (!l) return null;
  return (
    <g clipPath={`url(#${clipId})`}>
      {SPOTS.map(([x, y, r], i) =>
        l.tiny ? (
          <g key={i} className="lesion-pulse" style={{ animationDelay: `${i * 0.3}s` }}>
            <ellipse cx={x} cy={y} rx={2.6 * scale} ry={1.6 * scale} fill={l.fill} />
            <ellipse cx={x + 7} cy={y + 4} rx={2.2 * scale} ry={1.4 * scale} fill={l.fill} />
          </g>
        ) : (
          <circle key={i} className="lesion-pulse" style={{ animationDelay: `${i * 0.3}s` }}
            cx={x} cy={y} r={r * scale} fill={l.fill} stroke={l.stroke} strokeWidth="1.5"
            opacity={l.opacity} filter={l.blur ? 'url(#soft)' : undefined} />
        ),
      )}
    </g>
  );
}

export default function SpecimenArt({ part = 'leaf', lesion = 'none', className = '', healthy }) {
  const id = `${part}-${lesion}-${healthy ? 'h' : 'x'}`;
  const tone = healthy ? ['#58a04e', '#2c6d28'] : lesion === 'yellow' ? ['#9cb94a', '#5f7f25'] : ['#4f9445', '#235722'];
  return (
    <svg viewBox="0 0 200 200" className={className} role="img" aria-label={`${part} 표본`}>
      <defs>
        <linearGradient id={`g-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={tone[0]} />
          <stop offset="1" stopColor={tone[1]} />
        </linearGradient>
        <radialGradient id={`f-${id}`} cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#ff7a5c" />
          <stop offset="0.6" stopColor="#d63c25" />
          <stop offset="1" stopColor="#8f2414" />
        </radialGradient>
        <filter id="soft"><feGaussianBlur stdDeviation="1.4" /></filter>
        <clipPath id={`c-${id}`}>
          {part === 'leaf' && <path d="M100 18 C150 40 172 92 150 140 C132 176 104 184 100 184 C96 184 68 176 50 140 C28 92 50 40 100 18Z" />}
          {part === 'stem' && <rect x="84" y="10" width="32" height="180" rx="14" />}
          {part === 'fruit' && <circle cx="100" cy="112" r="66" />}
        </clipPath>
      </defs>

      {part === 'leaf' && (
        <g>
          <path d="M100 18 C150 40 172 92 150 140 C132 176 104 184 100 184 C96 184 68 176 50 140 C28 92 50 40 100 18Z" fill={`url(#g-${id})`} />
          <path d="M100 26 L100 182" stroke="#d7ebd2" strokeOpacity="0.55" strokeWidth="2.2" fill="none" />
          {[50, 76, 102, 128, 152].map((y, i) => (
            <g key={y} stroke="#d7ebd2" strokeOpacity="0.35" strokeWidth="1.4" fill="none">
              <path d={`M100 ${y} Q ${124 + i * 2} ${y - 6} ${142 - i * 3} ${y - 18}`} />
              <path d={`M100 ${y} Q ${76 - i * 2} ${y - 6} ${58 + i * 3} ${y - 18}`} />
            </g>
          ))}
          <Lesions kind={lesion} clipId={`c-${id}`} />
        </g>
      )}

      {part === 'stem' && (
        <g>
          <rect x="84" y="10" width="32" height="180" rx="14" fill={`url(#g-${id})`} />
          {[46, 104, 160].map((y) => <rect key={y} x="80" y={y} width="40" height="6" rx="3" fill="#235722" opacity="0.6" />)}
          <path d="M116 60 C150 50 170 30 178 18 C160 26 132 34 116 48Z" fill={`url(#g-${id})`} opacity="0.9" />
          <path d="M84 126 C50 116 32 96 22 82 C42 88 70 98 84 112Z" fill={`url(#g-${id})`} opacity="0.9" />
          <Lesions kind={lesion} clipId={`c-${id}`} scale={0.8} />
        </g>
      )}

      {part === 'fruit' && (
        <g>
          <circle cx="100" cy="112" r="66" fill={`url(#f-${id})`} />
          <ellipse cx="76" cy="84" rx="16" ry="10" fill="#fff" opacity="0.25" />
          <path d="M100 48 C92 36 80 32 70 34 C84 40 92 46 100 52 C108 46 116 40 130 34 C120 32 108 36 100 48Z" fill="#2c6d28" />
          <rect x="97" y="30" width="6" height="20" rx="3" fill="#235722" />
          <Lesions kind={lesion} clipId={`c-${id}`} />
        </g>
      )}
    </svg>
  );
}

export const severityClass = (s) =>
  ({ 상: 'sev-high', 경보: 'sev-high', 중: 'sev-mid', 주의: 'sev-mid' })[s] || 'sev-low';
