import { Link } from 'react-router-dom';

// farmpick 심볼: 스캔 프레임(진단) 안의 잎(농작물) + 병반을 짚는 포인트(pick)
export function LogoMark({ size = 36, light }) {
  const frame = light ? '#c6e04f' : '#1c1915';
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden className="shrink-0">
      <g fill="none" stroke={frame} strokeWidth="2.8" strokeLinecap="round">
        <path d="M3 11V6a3 3 0 0 1 3-3h5" /><path d="M29 3h5a3 3 0 0 1 3 3v5" />
        <path d="M37 29v5a3 3 0 0 1-3 3h-5" /><path d="M11 37H6a3 3 0 0 1-3-3v-5" />
      </g>
      <path d="M9 31C9 18 18 9 31 9c0 13-9 22-22 22Z" fill={light ? '#58a04e' : '#2c6d28'} />
      <path d="M10.5 29.5 25 15" stroke={light ? '#143316' : '#c6e04f'} strokeWidth="2" strokeLinecap="round" />
      <circle cx="23.5" cy="21.5" r="3.4" fill="#c6e04f" stroke={light ? '#143316' : '#1c1915'} strokeWidth="1.6" />
    </svg>
  );
}

export default function Logo({ light, compact }) {
  return (
    <Link to="/" className="group flex items-center gap-2.5" aria-label="farmpick 홈">
      <span className="transition-transform duration-300 group-hover:-rotate-6"><LogoMark light={light} /></span>
      {!compact && (
        <span className="leading-none">
          <span className={`block font-heading text-[19px] font-bold tracking-[-0.045em] ${light ? 'text-white' : 'text-ink-950'}`}>
            farm<span className={light ? 'text-chloro' : 'text-forest-600'}>pick</span>
          </span>
          <span className={`mt-1 block text-[10px] font-medium tracking-[0.02em] ${light ? 'text-white/50' : 'text-ink-400'}`}>
            병해충 진단 연구소
          </span>
        </span>
      )}
    </Link>
  );
}
