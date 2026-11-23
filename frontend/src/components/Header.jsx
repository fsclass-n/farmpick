import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { NAV, ROLE_BADGE, riskLevel, solarTerm } from '../lib/site';
import Logo from './Logo';

const WEEK = ['일', '월', '화', '수', '목', '금', '토'];

function useFieldCondition() {
  const [wc, setWc] = useState(null);
  useEffect(() => {
    api('/api/trends/weather-correlation').then(setWc).catch(() => {});
  }, []);
  return useMemo(() => {
    if (!wc) return null;
    const m = new Date().getMonth();
    const score = Math.round((wc.occurrence[m] / Math.max(...wc.occurrence)) * 100);
    return { score, humidity: wc.humidity[m], ...riskLevel(score) };
  }, [wc]);
}

/** 상단 농사력(Almanac) 바: 날짜·절기·병해충 위험지수·습도 */
function AlmanacBar({ hidden }) {
  const cond = useFieldCondition();
  const now = new Date();
  const date = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')} (${WEEK[now.getDay()]})`;
  return (
    <div className={`hidden overflow-hidden border-b border-dashed border-ink-300 bg-ink-100/70 transition-[max-height] duration-300 lg:block ${hidden ? 'max-h-0 border-b-0' : 'max-h-10'}`}>
      <div className="mx-auto flex h-9 max-w-[1280px] items-center gap-6 px-5 text-[12px] text-ink-600">
        <span className="flex items-center gap-2">
          <i className="fa-regular fa-calendar text-forest-600" />
          <span className="font-mono">{date}</span>
          <span className="rounded-sm bg-forest-600 px-1.5 py-px text-[10.5px] font-semibold text-white">{solarTerm(now)}</span>
        </span>
        {cond && (
          <>
            <span className="flex items-center gap-2">
              <span className="text-ink-500">병해충 위험지수</span>
              <span className="gauge flex items-center gap-[3px]" aria-hidden>
                {Array.from({ length: 10 }, (_, i) => (
                  <i key={i} style={i < Math.round(cond.score / 10) ? { background: cond.color } : undefined} />
                ))}
              </span>
              <b className="font-mono" style={{ color: cond.color }}>{cond.score}</b>
              <span className="rounded-full border px-1.5 text-[10.5px] font-semibold" style={{ color: cond.color, borderColor: cond.color }}>{cond.label}</span>
            </span>
            <span className="hidden items-center gap-1.5 xl:flex">
              <i className="fa-solid fa-droplet text-[#4a8fb8]" />평균 습도 <b className="font-mono text-ink-800">{cond.humidity}%</b>
              <span className="text-ink-400">· {cond.humidity >= 70 ? '결로·곰팡이병 주의' : '환기 관리 양호'}</span>
            </span>
          </>
        )}
        <span className="ml-auto flex items-center gap-4">
          <Link to="/trends" className="hover:text-ink-950">발생 예찰 정보</Link>
          <Link to="/chat" className="hover:text-ink-950">고객센터</Link>
          <a href="mailto:contact@farmpick.kr" className="hover:text-ink-950">제휴 문의</a>
        </span>
      </div>
    </div>
  );
}

function Sprout() {
  return (
    <svg className="sprout absolute -top-[7px] left-1/2 -translate-x-1/2" width="18" height="12" viewBox="0 0 18 12" aria-hidden>
      <path d="M9 12V5" stroke="#2c6d28" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M9 6C9 2.5 11.5 1 16 1c0 3.5-2.5 5-7 5Z" fill="#58a04e" />
      <path d="M9 7C9 4 7 2.5 2 2.5c0 3 2 4.5 7 4.5Z" fill="#84bd79" />
    </svg>
  );
}

function SearchBox({ q, setQ, onSubmit, className = '' }) {
  return (
    <form onSubmit={onSubmit} className={`relative ${className}`}>
      <i className="fa-solid fa-magnifying-glass pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[12px] text-ink-400" />
      <input value={q} onChange={(e) => setQ(e.target.value)} aria-label="병해충 검색"
        placeholder="증상·병해충 검색"
        className="w-full rounded-full border border-ink-200 bg-sheet py-2 pl-9 pr-3 text-[13px] outline-none transition-colors placeholder:text-ink-400 focus:border-forest-500" />
    </form>
  );
}

export default function Header() {
  const { user, logout, isAdmin, isReadOnly } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [compact, setCompact] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [mobileSearch, setMobileSearch] = useState(false);
  const [q, setQ] = useState('');

  useEffect(() => {
    const on = () => setCompact(window.scrollY > 40);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  useEffect(() => { setSheet(false); setMobileSearch(false); }, [pathname]);

  const search = (e) => {
    e.preventDefault();
    if (!q.trim()) return;
    navigate(`/pests?q=${encodeURIComponent(q.trim())}`);
    setQ('');
    setMobileSearch(false);
  };
  const doLogout = () => { logout(); navigate('/'); };
  const [badge, badgeCls] = ROLE_BADGE[user?.role] || [];

  return (
    <>
      <header className="sticky top-0 z-40">
        <AlmanacBar hidden={compact} />
        <div className={`border-b-2 border-dashed border-ink-200 bg-paper/90 backdrop-blur-md transition-shadow ${compact ? 'shadow-[0_8px_24px_-16px_rgba(28,25,21,0.35)]' : ''}`}>
          <div className="mx-auto flex h-[68px] max-w-[1280px] items-center gap-6 px-5">
            <Logo />
            <nav className="ml-6 hidden h-full items-center gap-1 lg:flex" aria-label="주요 메뉴">
              {NAV.map((m) => (
                <NavLink key={m.to} to={m.to}
                  className={({ isActive }) => `relative flex h-full items-center px-3.5 text-[14.5px] font-semibold transition-colors ${
                    isActive ? 'text-forest-700' : 'text-ink-600 hover:text-ink-950'
                  }`}>
                  {({ isActive }) => (
                    <span className="relative">
                      {isActive && <Sprout />}
                      {m.label}
                      {isActive && <span className="absolute -bottom-[25px] left-0 right-0 h-[3px] rounded-t-full bg-forest-600" />}
                    </span>
                  )}
                </NavLink>
              ))}
            </nav>

            <div className="ml-auto hidden items-center gap-2.5 lg:flex">
              <SearchBox q={q} setQ={setQ} onSubmit={search} className="w-48 xl:w-56" />
              <Link to="/diagnosis" className="btn-leaf inline-flex items-center gap-2 bg-chloro px-4 py-2.5 text-[13px] font-bold text-ink-950 transition-colors hover:bg-forest-600 hover:text-white">
                <i className="fa-solid fa-camera" />사진 진단
              </Link>
              {isAdmin && (
                <NavLink to="/admin" title="관리 콘솔"
                  className={({ isActive }) => `flex h-10 w-10 items-center justify-center rounded-full border transition-colors ${
                    isActive ? 'border-forest-600 bg-forest-600 text-white' : 'border-ink-200 text-ink-600 hover:border-ink-900'
                  }`}>
                  <i className={`fa-solid ${isReadOnly ? 'fa-eye' : 'fa-shield-halved'} text-sm`} />
                </NavLink>
              )}
              {user ? (
                <div className="group relative">
                  <button className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 hover:bg-ink-100">
                    <span className="leaf-r flex h-9 w-9 items-center justify-center bg-forest-700 text-[13px] font-bold text-white">{user.name.slice(0, 1)}</span>
                    <span className="text-left leading-tight">
                      <span className="block text-[13px] font-semibold text-ink-900">{user.name}</span>
                      <span className={`mt-0.5 inline-block rounded px-1.5 text-[10px] font-semibold ${badgeCls}`}>{badge}</span>
                    </span>
                    <i className="fa-solid fa-chevron-down text-[10px] text-ink-400" />
                  </button>
                  <div className="invisible absolute right-0 top-full z-50 w-52 translate-y-1 pt-2 opacity-0 transition-all group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                    <div className="leaf-r overflow-hidden border border-ink-200 bg-sheet py-2 shadow-xl">
                      <p className="px-4 pb-2 font-mono text-[10.5px] text-ink-400">{user.email}</p>
                      <Link to="/myfarm" className="flex items-center gap-2.5 px-4 py-2 text-[13px] text-ink-700 hover:bg-forest-50"><i className="fa-solid fa-warehouse w-4 text-forest-600" />마이팜</Link>
                      {isAdmin && <Link to="/admin" className="flex items-center gap-2.5 px-4 py-2 text-[13px] text-ink-700 hover:bg-forest-50"><i className="fa-solid fa-shield-halved w-4 text-forest-600" />관리 콘솔</Link>}
                      <button onClick={doLogout} className="flex w-full items-center gap-2.5 border-t border-dashed border-ink-200 px-4 py-2.5 text-[13px] text-blight hover:bg-[#fbebe6]">
                        <i className="fa-solid fa-arrow-right-from-bracket w-4" />로그아웃
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <Link to="/login" className="px-2 text-[13.5px] font-semibold text-ink-800 underline-offset-4 hover:underline">로그인</Link>
              )}
            </div>

            <div className="ml-auto flex items-center gap-1 lg:hidden">
              <button onClick={() => setMobileSearch((s) => !s)} aria-label="검색" className="flex h-10 w-10 items-center justify-center rounded-full text-ink-700 hover:bg-ink-100">
                <i className={`fa-solid ${mobileSearch ? 'fa-xmark' : 'fa-magnifying-glass'}`} />
              </button>
              <button onClick={() => setSheet(true)} aria-label="전체 메뉴" className="flex h-10 w-10 items-center justify-center rounded-full text-ink-700 hover:bg-ink-100">
                <i className="fa-solid fa-grip" />
              </button>
            </div>
          </div>
          {mobileSearch && <div className="fade-in px-5 pb-3 lg:hidden"><SearchBox q={q} setQ={setQ} onSubmit={search} /></div>}
        </div>

        {isReadOnly && (
          <div>
            <div className="hazard h-1" />
            <div className="bg-[#fff4e0] px-4 py-1.5 text-center text-[12px] text-ink-800">
              <i className="fa-solid fa-lock mr-1.5 text-harvest" />
              <b>테스트 관리자 · 읽기 전용</b><span className="hidden sm:inline"> — 관리자 화면 열람은 가능하지만 생성·수정·삭제 요청은 차단됩니다.</span>
            </div>
          </div>
        )}
      </header>

      {/* 모바일 하단 탭바 — 가운데 카메라 진단 */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-ink-200 bg-sheet/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden" aria-label="하단 메뉴">
        <div className="mx-auto grid h-16 max-w-md grid-cols-5 items-end">
          {[NAV[1], NAV[2], null, NAV[3], NAV[4]].map((m) =>
            m === null ? (
              <Link key="cam" to="/diagnosis" aria-label="사진 진단" className="flex flex-col items-center">
                <span className="leaf-r -mt-6 flex h-14 w-14 items-center justify-center bg-forest-600 text-white shadow-lg ring-4 ring-paper">
                  <i className="fa-solid fa-camera text-lg" />
                </span>
                <span className="mb-2 mt-1 text-[10.5px] font-semibold text-forest-700">진단</span>
              </Link>
            ) : (
              <NavLink key={m.to} to={m.to} className={({ isActive }) => `flex flex-col items-center gap-1 pb-2.5 text-[10.5px] font-medium ${isActive ? 'text-forest-700' : 'text-ink-400'}`}>
                <i className={`fa-solid ${m.icon} text-[17px]`} />{m.label}
              </NavLink>
            ),
          )}
        </div>
      </nav>

      {/* 모바일 바텀시트 메뉴 */}
      <div className={`fixed inset-0 z-50 bg-ink-950/45 backdrop-blur-sm transition-opacity lg:hidden ${sheet ? 'opacity-100' : 'pointer-events-none opacity-0'}`} onClick={() => setSheet(false)} />
      <aside className={`fixed inset-x-0 bottom-0 z-50 rounded-t-[28px] bg-paper p-5 pb-8 shadow-2xl transition-transform duration-300 lg:hidden ${sheet ? 'translate-y-0' : 'translate-y-full'}`}
        aria-hidden={!sheet} inert={!sheet}>
        <div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-ink-200" />
        <div className="flex items-center justify-between">
          <Logo />
          <button onClick={() => setSheet(false)} aria-label="닫기" className="flex h-10 w-10 items-center justify-center rounded-full bg-ink-100"><i className="fa-solid fa-xmark" /></button>
        </div>
        <div className="mt-6 grid grid-cols-3 gap-3">
          {[...NAV, ...(isAdmin ? [{ to: '/admin', label: '관리 콘솔', icon: 'fa-shield-halved' }] : [])].map((m) => (
            <NavLink key={m.to} to={m.to} className={({ isActive }) => `leaf-r flex flex-col items-center gap-2 border p-4 text-[12.5px] font-semibold ${
              isActive ? 'border-forest-600 bg-forest-50 text-forest-700' : 'border-ink-200 bg-sheet text-ink-700'
            }`}>
              <i className={`fa-solid ${m.icon} text-lg`} />{m.label}
            </NavLink>
          ))}
        </div>
        <div className="mt-6">
          {user ? (
            <button onClick={doLogout} className="btn-leaf w-full border border-ink-300 py-3 text-sm font-semibold text-ink-700">
              로그아웃 · {user.name} ({badge})
            </button>
          ) : (
            <Link to="/login" className="btn-leaf block w-full bg-ink-950 py-3 text-center text-sm font-semibold text-white">로그인 / 회원가입</Link>
          )}
        </div>
      </aside>
    </>
  );
}
