import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

const GNB = [
  { to: '/diagnosis', label: 'AI 병해충 진단', icon: 'fa-microscope' },
  { to: '/trends', label: '발생 동향', icon: 'fa-chart-line' },
  { to: '/myfarm', label: '마이팜', icon: 'fa-warehouse' },
  { to: '/chat', label: 'AI 상담', icon: 'fa-robot' },
  { to: '/pests', label: '병해충 도감', icon: 'fa-book-open' },
];

function Logo({ light }) {
  return (
    <Link to="/" className={`flex items-center gap-2 font-heading text-lg font-bold tracking-tight ${light ? 'text-white' : 'text-ink-900'}`}>
      <img src="/leaf.svg" alt="farmpick" className="h-6 w-6" />
      farmpick<span className="text-forest-500">.</span>
    </Link>
  );
}

export default function MainLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 300);
    window.addEventListener('scroll', onScroll);
    api('/api/trends/alerts').then(setAlerts).catch(() => {});
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isAdmin = user && ['admin', 'admin_readonly'].includes(user.role);

  const navCls = ({ isActive }) =>
    `relative px-1 py-1 text-[13px] font-medium tracking-wide transition-colors ${
      isActive
        ? 'text-ink-950 after:absolute after:inset-x-0 after:-bottom-[13px] after:h-[2px] after:bg-ink-950'
        : 'text-ink-500 hover:text-ink-900'
    }`;

  const doSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/pests?q=${encodeURIComponent(query.trim())}`);
    setSearchOpen(false);
    setQuery('');
  };

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      {/* 발생 경보 마퀴 */}
      {alerts.length > 0 && (
        <div className="overflow-hidden bg-ink-950 py-1.5 text-[11px] tracking-wide text-white/70">
          <div className="marquee flex w-max gap-14 whitespace-nowrap px-4">
            {[...alerts, ...alerts].map((a, i) => (
              <span key={i}>
                <span className="mr-2 font-semibold text-harvest">[{a.level}]</span>
                {a.pest} — {a.region}: {a.note}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 글로벌 헤더 */}
      <header className="sticky top-0 z-40 border-b border-ink-200 bg-paper/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-[1280px] items-center justify-between px-4">
          <Logo />
          <nav className="hidden items-center gap-7 lg:flex">
            {GNB.map((m) => (
              <NavLink key={m.to} to={m.to} className={navCls}>
                {m.label}
              </NavLink>
            ))}
          </nav>
          <div className="hidden items-center gap-1 lg:flex">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="flex h-9 w-9 items-center justify-center text-ink-500 hover:text-ink-900"
              aria-label="검색"
            >
              <i className="fa-solid fa-magnifying-glass text-sm" />
            </button>
            {isAdmin && (
              <Link to="/admin" className="px-2 py-1 text-[13px] font-medium text-ink-500 hover:text-ink-900">
                관리자
              </Link>
            )}
            <span className="mx-2 h-4 w-px bg-ink-200" />
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-[13px] text-ink-700">
                  {user.name}
                  {user.role === 'admin_readonly' && (
                    <span className="ml-1.5 border border-harvest/40 px-1.5 py-0.5 text-[10px] font-medium tracking-wide text-harvest">
                      READ ONLY
                    </span>
                  )}
                </span>
                <button
                  onClick={() => { logout(); navigate('/'); }}
                  className="text-[13px] text-ink-500 underline-offset-4 hover:text-ink-900 hover:underline"
                >
                  로그아웃
                </button>
              </div>
            ) : (
              <Link to="/login" className="btn-primary rounded-md px-4 py-2 text-[13px]">
                로그인
              </Link>
            )}
          </div>
          <button
            className={`burger lg:hidden ${menuOpen ? 'open' : ''} p-2 text-ink-900`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="메뉴"
          >
            <span /><span /><span />
          </button>
        </div>
        {searchOpen && (
          <div className="fade-in border-t border-ink-100 bg-white">
            <form onSubmit={doSearch} className="mx-auto flex max-w-[1280px] gap-3 px-4 py-3">
              <i className="fa-solid fa-magnifying-glass self-center text-sm text-ink-400" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="병해충 이름·증상을 검색하세요 (예: 흰가루, 잎 뒷면 흡즙)"
                className="flex-1 bg-transparent py-1.5 text-sm outline-none placeholder:text-ink-400"
              />
              <button className="text-[13px] font-medium text-forest-600 hover:text-forest-700">검색</button>
            </form>
          </div>
        )}
      </header>

      {/* 모바일 드로어 */}
      <div
        className={`drawer fixed inset-y-0 right-0 z-50 w-72 bg-ink-950 text-white shadow-2xl lg:hidden ${
          menuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/10 p-4">
          <Logo light />
          <button onClick={() => setMenuOpen(false)} aria-label="닫기" className="p-2">
            <i className="fa-solid fa-xmark text-lg text-white/70" />
          </button>
        </div>
        <nav className="flex flex-col gap-0.5 p-4">
          {GNB.map((m) => (
            <NavLink
              key={m.to}
              to={m.to}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-3 text-sm ${
                  isActive ? 'text-white' : 'text-white/50 hover:text-white'
                }`
              }
            >
              <i className={`fa-solid ${m.icon} w-4 text-xs`} />{m.label}
            </NavLink>
          ))}
          {isAdmin && (
            <NavLink to="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-3 py-3 text-sm text-white/50 hover:text-white">
              <i className="fa-solid fa-gear w-4 text-xs" />관리자
            </NavLink>
          )}
          <div className="mt-4 border-t border-white/10 pt-4">
            {user ? (
              <button
                onClick={() => { logout(); setMenuOpen(false); navigate('/'); }}
                className="w-full border border-white/20 px-3 py-2.5 text-sm text-white/80"
              >
                로그아웃 ({user.name})
              </button>
            ) : (
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="block bg-white px-3 py-2.5 text-center text-sm font-semibold text-ink-950"
              >
                로그인
              </Link>
            )}
          </div>
        </nav>
      </div>
      {menuOpen && (
        <div className="fade-in fixed inset-0 z-40 bg-ink-950/40 lg:hidden" onClick={() => setMenuOpen(false)} />
      )}

      <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 py-10">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="furrows mt-10 bg-ink-950 text-white">
        <div className="mx-auto grid max-w-[1280px] gap-10 px-4 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo light />
            <p className="mt-4 text-[13px] leading-relaxed text-white/40">
              AI로 진단하고, 데이터로 예방하는<br />스마트팜 병해충 관리 플랫폼
            </p>
            <div className="mt-5 flex gap-2">
              <a href="https://github.com/fsclass-n/farmpick" target="_blank" rel="noreferrer" aria-label="GitHub"
                className="flex h-8 w-8 items-center justify-center border border-white/15 text-xs text-white/60 hover:border-white hover:text-white">
                <i className="fa-brands fa-github" />
              </a>
              <a href="https://fsclass-n.github.io/farmpick/" target="_blank" rel="noreferrer" aria-label="프로젝트 안내"
                className="flex h-8 w-8 items-center justify-center border border-white/15 text-xs text-white/60 hover:border-white hover:text-white">
                <i className="fa-solid fa-globe" />
              </a>
            </div>
          </div>
          {[
            ['팀 정보', ['프로젝트 farmpick', '이오리(조장) · 박미금 · 김모란 · 홍기흥', 'contact@farmpick.kr']],
            ['고객센터', ['FAQ', '1:1 문의', '공지사항']],
            ['정책·링크', ['이용약관', '개인정보처리방침']],
          ].map(([title, items]) => (
            <div key={title}>
              <h4 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">{title}</h4>
              <ul className="space-y-2 text-[13px] text-white/60">
                {items.map((it) => (
                  <li key={it}><a href="#" className="hover:text-white">{it}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-white/10 py-5 text-center text-[11px] tracking-wide text-white/30">
          데이터 출처: AI Hub · 공공데이터포털 · 농촌진흥청 · 기상청 &nbsp;|&nbsp; © 2026 farmpick. All rights reserved.
        </div>
      </footer>

      {/* AI 상담 플로팅 */}
      <Link
        to="/chat"
        className="fixed bottom-20 right-6 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-forest-600 text-white shadow-lg hover:bg-forest-700"
        aria-label="AI 상담"
      >
        <i className="fa-solid fa-robot text-sm" />
      </Link>

      {/* To the Top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="최상단 이동"
        className={`fixed bottom-6 right-6 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-ink-900 text-white shadow-lg transition-opacity duration-300 hover:bg-ink-700 ${
          showTop ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <i className="fa-solid fa-arrow-up text-sm" />
      </button>
    </div>
  );
}
