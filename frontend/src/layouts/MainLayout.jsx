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
    <Link to="/" className={`flex items-center gap-2 font-heading text-xl font-bold ${light ? 'text-sprout-400' : 'text-forest-800'}`}>
      <img src="/leaf.svg" alt="farmpick" className="h-7 w-7" />
      farmpick
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
    `rounded-full px-4 py-2 text-sm font-medium transition-all ${
      isActive
        ? 'bg-forest-800 text-sprout-300'
        : 'text-forest-800/70 hover:bg-forest-100 hover:text-forest-800'
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
        <div className="overflow-hidden bg-forest-950 py-1.5 text-xs text-sprout-300">
          <div className="marquee flex w-max gap-12 whitespace-nowrap px-4">
            {[...alerts, ...alerts].map((a, i) => (
              <span key={i}>
                <i className="fa-solid fa-triangle-exclamation mr-2 text-harvest" />
                [{a.level}] {a.pest} — {a.region}: {a.note}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 플로팅 글래스 헤더 */}
      <header className="sticky top-3 z-40 mx-auto w-full max-w-[1280px] px-4">
        <div className="glass flex h-16 items-center justify-between rounded-2xl px-4 shadow-sm">
          <Logo />
          <nav className="hidden items-center gap-1 lg:flex">
            {GNB.map((m) => (
              <NavLink key={m.to} to={m.to} className={navCls}>
                {m.label}
              </NavLink>
            ))}
          </nav>
          <div className="hidden items-center gap-2 lg:flex">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-forest-800/60 hover:bg-forest-100 hover:text-forest-800"
              aria-label="검색"
            >
              <i className="fa-solid fa-magnifying-glass" />
            </button>
            {isAdmin && (
              <Link to="/admin" className="rounded-full px-3 py-2 text-sm font-medium text-forest-800/70 hover:bg-forest-100">
                <i className="fa-solid fa-gear mr-1" />관리자
              </Link>
            )}
            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-forest-900">
                  {user.name}
                  {user.role === 'admin_readonly' && (
                    <span className="ml-1 rounded-full bg-harvest/20 px-2 py-0.5 text-xs text-amber-700">읽기 전용</span>
                  )}
                </span>
                <button
                  onClick={() => { logout(); navigate('/'); }}
                  className="rounded-full border border-forest-200 px-4 py-1.5 text-sm text-forest-800 hover:bg-forest-50"
                >
                  로그아웃
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="rounded-full bg-forest-800 px-5 py-2 text-sm font-medium text-sprout-300 hover:bg-forest-700"
              >
                로그인
              </Link>
            )}
          </div>
          <button
            className={`burger lg:hidden ${menuOpen ? 'open' : ''} p-2 text-forest-900`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="메뉴"
          >
            <span /><span /><span />
          </button>
        </div>
        {/* 검색바 확장 */}
        {searchOpen && (
          <form onSubmit={doSearch} className="fade-in glass mt-2 flex gap-2 rounded-2xl p-3">
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="병해충 이름·증상을 검색하세요 (예: 흰가루, 잎 뒷면 흡즙)"
              className="flex-1 rounded-xl border border-forest-200 bg-white px-4 py-2.5 text-sm focus:border-forest-500 focus:outline-none"
            />
            <button className="rounded-xl bg-forest-800 px-5 text-sm text-sprout-300">검색</button>
          </form>
        )}
      </header>

      {/* 모바일 드로어 */}
      <div
        className={`drawer fixed inset-y-0 right-0 z-50 w-72 bg-forest-950 text-white shadow-2xl lg:hidden ${
          menuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/10 p-4">
          <Logo light />
          <button onClick={() => setMenuOpen(false)} aria-label="닫기" className="p-2">
            <i className="fa-solid fa-xmark text-xl text-white/70" />
          </button>
        </div>
        <nav className="flex flex-col gap-1 p-4">
          {GNB.map((m) => (
            <NavLink
              key={m.to}
              to={m.to}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${
                  isActive ? 'bg-sprout-500/15 text-sprout-300' : 'text-white/70 hover:bg-white/5'
                }`
              }
            >
              <i className={`fa-solid ${m.icon} w-4`} />{m.label}
            </NavLink>
          ))}
          {isAdmin && (
            <NavLink to="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/70 hover:bg-white/5">
              <i className="fa-solid fa-gear w-4" />관리자
            </NavLink>
          )}
          <div className="mt-4 border-t border-white/10 pt-4">
            {user ? (
              <button
                onClick={() => { logout(); setMenuOpen(false); navigate('/'); }}
                className="w-full rounded-xl border border-white/20 px-3 py-2.5 text-sm text-white/80"
              >
                로그아웃 ({user.name})
              </button>
            ) : (
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="block rounded-xl bg-sprout-500 px-3 py-2.5 text-center text-sm font-bold text-forest-950"
              >
                로그인
              </Link>
            )}
          </div>
        </nav>
      </div>
      {menuOpen && (
        <div className="fade-in fixed inset-0 z-40 bg-forest-950/40 lg:hidden" onClick={() => setMenuOpen(false)} />
      )}

      {/* Content */}
      <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 py-8">
        <Outlet />
      </main>

      {/* Footer — 딥 포레스트 + 밭 이랑 */}
      <footer className="furrows mt-8 bg-forest-950 text-white">
        <div className="mx-auto grid max-w-[1280px] gap-8 px-4 py-12 md:grid-cols-4">
          <div>
            <Logo light />
            <p className="mt-3 text-sm leading-relaxed text-white/50">
              AI로 진단하고, 데이터로 예방하는<br />스마트팜 병해충 관리 플랫폼
            </p>
            <div className="mt-4 flex gap-2">
              <a href="https://github.com/fsclass-n/farmpick" target="_blank" rel="noreferrer" aria-label="GitHub"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-sprout-500 hover:text-forest-950">
                <i className="fa-brands fa-github" />
              </a>
              <a href="https://fsclass-n.github.io/farmpick/" target="_blank" rel="noreferrer" aria-label="프로젝트 안내"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-sprout-500 hover:text-forest-950">
                <i className="fa-solid fa-globe" />
              </a>
            </div>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold text-sprout-300">팀 정보</h4>
            <ul className="space-y-1.5 text-sm text-white/50">
              <li>프로젝트 farmpick</li>
              <li>이오리(조장) · 박미금 · 김모란 · 홍기흥</li>
              <li>contact@farmpick.kr</li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold text-sprout-300">고객센터</h4>
            <ul className="space-y-1.5 text-sm text-white/50">
              <li><a href="#" className="hover:text-sprout-300">FAQ</a></li>
              <li><a href="#" className="hover:text-sprout-300">1:1 문의</a></li>
              <li><a href="#" className="hover:text-sprout-300">공지사항</a></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold text-sprout-300">정책·링크</h4>
            <ul className="space-y-1.5 text-sm text-white/50">
              <li><a href="#" className="hover:text-sprout-300">이용약관 · 개인정보처리방침</a></li>
              <li className="text-xs leading-relaxed">데이터 출처: AI Hub, 공공데이터포털, 농촌진흥청, 기상청</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 py-4 text-center text-xs text-white/30">
          © 2026 farmpick. All rights reserved.
        </div>
      </footer>

      {/* AI 상담 플로팅 버튼 */}
      <Link
        to="/chat"
        className="fixed bottom-20 right-6 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-sprout-500 text-forest-950 shadow-lg shadow-sprout-500/30 hover:bg-sprout-400"
        aria-label="AI 상담"
      >
        <i className="fa-solid fa-robot" />
      </Link>

      {/* To the Top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="최상단 이동"
        className={`fixed bottom-6 right-6 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-forest-800 text-sprout-300 shadow-lg transition-opacity duration-300 hover:bg-forest-700 ${
          showTop ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <i className="fa-solid fa-arrow-up" />
      </button>
    </div>
  );
}
