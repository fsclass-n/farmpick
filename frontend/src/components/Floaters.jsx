import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

/** 우측 하단: AI 방제상담 + 원형 To the Top(스크롤 진행만큼 물이 차오름) */
export default function Floaters() {
  const [p, setP] = useState(0);
  const { pathname } = useLocation();
  useEffect(() => {
    const on = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setP(max > 0 ? Math.min(1, window.scrollY / max) : 0);
    };
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, [pathname]);
  const show = p > 0.04;

  return (
    <div className="fixed bottom-24 right-4 z-30 flex flex-col items-end gap-3 sm:right-6 lg:bottom-6">
      {pathname !== '/chat' && (
        <Link to="/chat" aria-label="AI 방제상담" title="AI 방제상담"
          className="btn-leaf group flex h-12 items-center gap-2 bg-ink-950 px-4 text-[13px] font-semibold text-white shadow-xl transition-colors hover:bg-forest-700">
          <i className="fa-solid fa-comments text-chloro" />
          <span className="hidden sm:inline">AI 방제상담</span>
        </Link>
      )}
      <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="최상단 이동" title={`To the Top · ${Math.round(p * 100)}%`}
        className={`group relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border-2 border-forest-600 bg-sheet text-forest-700 shadow-xl transition-all duration-300 hover:-translate-y-1 ${
          show ? 'opacity-100' : 'pointer-events-none translate-y-3 opacity-0'
        }`}>
        <span className="water" style={{ height: `${Math.max(8, p * 100)}%` }} aria-hidden />
        <i className={`fa-solid fa-arrow-up relative text-sm transition-colors ${p > 0.55 ? 'text-white' : ''}`} />
      </button>
    </div>
  );
}
