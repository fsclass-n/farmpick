import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

const GNB = [
  { to: '/diagnosis', label: 'AI 진단', code: '01', icon: 'fa-microscope' },
  { to: '/pests', label: '병해충 도감', code: '02', icon: 'fa-book-open' },
  { to: '/trends', label: '발생 동향', code: '03', icon: 'fa-chart-line' },
  { to: '/myfarm', label: '마이팜', code: '04', icon: 'fa-warehouse' },
  { to: '/chat', label: 'AI 상담', code: '05', icon: 'fa-robot' },
];

const ROLE_BADGE = {
  farmer: ['농가', 'bg-forest-100 text-forest-700'],
  company: ['기업', 'bg-ink-100 text-ink-700'],
  admin: ['ADMIN', 'bg-forest-600 text-white'],
  admin_readonly: ['READ ONLY', 'bg-harvest text-white'],
};

export function Logo({ light }) {
  return (
    <Link to="/" className={`group flex items-center gap-2.5 ${light ? 'text-white' : 'text-ink-950'}`}>
      <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-forest-600 text-white transition-transform group-hover:rotate-12">
        <i className="fa-solid fa-leaf text-[13px]" />
        <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-paper bg-chloro" />
      </span>
      <span className="leading-none">
        <span className="block font-heading text-[17px] font-bold tracking-tight">farmpick</span>
        <span className={`tag-code block !text-[9px] ${light ? '!text-white/40' : ''}`}>CROP · PEST · LAB</span>
      </span>
    </Link>
  );
}

function ToTop() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? window.scrollY / max : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const C = 2 * Math.PI * 22;
  const visible = progress > 0.05;
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="최상단 이동"
      title="To the Top"
      className={`fixed bottom-6 right-6 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-ink-950 text-white shadow-xl transition-all duration-300 hover:-translate-y-1 hover:bg-forest-700 ${
        visible ? 'opacity-100' : 'pointer-events-none translate-y-3 opacity-0'
      }`}
    >
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 48 48" aria-hidden>
        <circle cx="24" cy="24" r="22" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />
        <circle cx="24" cy="24" r="22" fill="none" stroke="#c6e04f" strokeWidth="2" strokeLinecap="round"
          strokeDasharray={C} strokeDashoffset={C * (1 - progress)} />
      </svg>
      <i className="fa-solid fa-arrow-up relative text-sm" />
    </button>
  );
}

export default function MainLayout() {
  const { user, logout, isAdmin, isReadOnly } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    api('/api/trends/alerts').then(setAlerts).catch(() => {});
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    setMenuOpen(false);
  }, [pathname]);

  const navCls = ({ isActive }) =>
    `group flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[13.5px] font-medium transition-colors ${
      isActive ? 'bg-ink-950 text-white' : 'text-ink-600 hover:bg-ink-100 hover:text-ink-950'
    }`;

  const doSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/pests?q=${encodeURIComponent(query.trim())}`);
    setSearchOpen(false);
    setQuery('');
  };

  const doLogout = () => { logout(); navigate('/'); };
  const [badge, badgeCls] = ROLE_BADGE[user?.role] || [];

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      {/* 병해충 발생 경보 스트립 */}
      {alerts.length > 0 && (
        <div className="flex items-stretch overflow-hidden bg-ink-950 text-[12px] text-white/75">
          <span className="z-10 flex shrink-0 items-center gap-2 bg-blight px-4 font-mono text-[10.5px] font-semibold tracking-[0.14em] text-white">
            <span className="pulse-dot">LIVE</span> 예찰 경보
          </span>
          <div className="relative flex-1 overflow-hidden py-2">
            <div className="marquee flex w-max gap-14 whitespace-nowrap px-6">
              {[...alerts, ...alerts].map((a, i) => (
                <span key={i}>
                  <span className={`mr-2 font-semibold ${a.level === '경보' ? 'text-[#ff8a6b]' : 'text-chloro'}`}>[{a.level}]</span>
                  {a.pest} · {a.region} — {a.note}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 테스트 관리자 읽기 전용 배너 */}
      {isReadOnly && (
        <div>
          <div className="hazard h-1.5" />
          <div className="bg-[#fff4e0] px-4 py-2 text-center text-[12.5px] text-ink-800">
            <i className="fa-solid fa-lock mr-1.5 text-harvest" />
            <b>테스트 관리자 모드</b> — 모든 관리자 화면을 열람할 수 있지만 데이터 생성·수정·삭제는 차단됩니다.
          </div>
        </div>
      )}

      {/* 글로벌 헤더 */}
      <header className="sticky top-0 z-40 border-b border-ink-200/80 bg-paper/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-6 px-5">
          <Logo />
          <nav className="hidden items-center gap-1 lg:flex">
            {GNB.map((m) => (
              <NavLink key={m.to} to={m.to} className={navCls}>
                <span className="font-mono text-[10px] opacity-40">{m.code}</span>{m.label}
              </NavLink>
            ))}
          </nav>
          <div className="hidden items-center gap-2 lg:flex">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-ink-500 hover:bg-ink-100 hover:text-ink-950"
              aria-label="병해충 검색"
            >
              <i className={`fa-solid ${searchOpen ? 'fa-xmark' : 'fa-magnifying-glass'} text-sm`} />
            </button>
            {isAdmin && (
              <NavLink to="/admin" className={({ isActive }) =>
                `flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12.5px] font-semibold ${
                  isActive ? 'border-forest-600 bg-forest-600 text-white' : 'border-ink-300 text-ink-700 hover:border-ink-900'
                }`}>
                <i className={`fa-solid ${isReadOnly ? 'fa-eye' : 'fa-shield-halved'} text-[11px]`} />관리 콘솔
              </NavLink>
            )}
            {user ? (
              <div className="flex items-center gap-2 rounded-full border border-ink-200 bg-sheet py-1 pl-1 pr-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink-900 text-[11px] font-bold text-white">
                  {user.name.slice(0, 1)}
                </span>
                <span className="text-[13px] font-medium text-ink-800">{user.name}</span>
                <span className={`rounded px-1.5 py-0.5 font-mono text-[9.5px] font-semibold tracking-wide ${badgeCls}`}>{badge}</span>
                <button onClick={doLogout} className="ml-1 text-ink-400 hover:text-blight" aria-label="로그아웃" title="로그아웃">
                  <i className="fa-solid fa-arrow-right-from-bracket text-xs" />
                </button>
              </div>
            ) : (
              <Link to="/login" className="btn-primary rounded-full px-5 py-2 text-[13px]">로그인</Link>
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
          <div className="fade-in border-t border-ink-200 bg-sheet">
            <form onSubmit={doSearch} className="mx-auto flex max-w-[1280px] items-center gap-3 px-5 py-3">
              <i className="fa-solid fa-magnifying-glass text-sm text-forest-600" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="병해충명·증상으로 표본을 찾아보세요 (예: 흰가루, 잎 뒷면 흡즙)"
                className="flex-1 bg-transparent py-1.5 text-sm outline-none placeholder:text-ink-400"
              />
              <button className="btn-accent rounded-full px-4 py-1.5 text-[13px]">검색</button>
            </form>
          </div>
        )}
      </header>

      {/* 모바일 드로어 */}
      <div className={`drawer fixed inset-y-0 right-0 z-50 w-80 max-w-[85vw] bg-ink-950 text-white shadow-2xl lg:hidden ${
        menuOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="grid-paper-dark flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-white/10 p-5">
            <Logo light />
            <button onClick={() => setMenuOpen(false)} aria-label="닫기" className="p-2">
              <i className="fa-solid fa-xmark text-lg text-white/70" />
            </button>
          </div>
          <nav className="flex flex-col gap-1 p-4">
            {[...GNB, ...(isAdmin ? [{ to: '/admin', label: '관리 콘솔', code: 'AD', icon: 'fa-shield-halved' }] : [])].map((m) => (
              <NavLink key={m.to} to={m.to}
                className={({ isActive }) => `flex items-center gap-3 rounded-xl px-4 py-3 text-sm ${
                  isActive ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white'
                }`}>
                <span className="font-mono text-[10px] text-chloro">{m.code}</span>
                <i className={`fa-solid ${m.icon} w-4 text-xs`} />{m.label}
              </NavLink>
            ))}
          </nav>
          <div className="mt-auto border-t border-white/10 p-4">
            {user ? (
              <button onClick={doLogout} className="w-full rounded-xl border border-white/20 px-3 py-3 text-sm text-white/80">
                로그아웃 ({user.name} · {badge})
              </button>
            ) : (
              <Link to="/login" className="block rounded-xl bg-chloro px-3 py-3 text-center text-sm font-semibold text-ink-950">
                로그인
              </Link>
            )}
          </div>
        </div>
      </div>
      {menuOpen && <div className="fade-in fixed inset-0 z-40 bg-ink-950/50 lg:hidden" onClick={() => setMenuOpen(false)} />}

      <main className="mx-auto w-full max-w-[1280px] flex-1 px-5 py-10 md:py-12">
        <Outlet />
      </main>

      <Footer />

      {/* AI 상담 플로팅 */}
      <Link
        to="/chat"
        className="fixed bottom-[88px] right-6 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-forest-600 text-white shadow-xl transition-transform hover:-translate-y-1 hover:bg-forest-700"
        aria-label="AI 상담" title="AI 병해충 상담"
      >
        <i className="fa-solid fa-robot text-sm" />
      </Link>
      <ToTop />
    </div>
  );
}

const FOOTER_COLS = [
  ['서비스', [['AI 병해충 진단', '/diagnosis'], ['병해충 도감', '/pests'], ['발생 동향', '/trends'], ['마이팜', '/myfarm'], ['AI 상담', '/chat']]],
  ['고객 지원', [['자주 묻는 질문', '/chat'], ['1:1 문의', 'mailto:contact@farmpick.kr'], ['공지사항', '/'], ['방제 상담 예약', '/chat']]],
  ['정책', [['이용약관', '/'], ['개인정보처리방침', '/'], ['위치정보 이용약관', '/'], ['데이터 이용 정책', '/']]],
];

const CHANNELS = [
  ['fa-brands fa-github', 'GitHub', 'https://github.com/fsclass-n/farmpick'],
  ['fa-solid fa-globe', '프로젝트 안내', 'https://fsclass-n.github.io/farmpick/'],
  ['fa-solid fa-envelope', '이메일 문의', 'mailto:contact@farmpick.kr'],
];

function FooterLink({ to, children }) {
  const cls = 'text-[13px] text-white/55 transition-colors hover:text-chloro';
  return to.startsWith('mailto:') ? <a href={to} className={cls}>{children}</a> : <Link to={to} className={cls}>{children}</Link>;
}

function Footer() {
  return (
    <footer className="mt-16 bg-ink-950 text-white">
      <div className="grid-paper-dark">
        {/* 상단 슬로건 밴드 */}
        <div className="mx-auto flex max-w-[1280px] flex-col justify-between gap-6 border-b border-white/10 px-5 py-12 md:flex-row md:items-end">
          <div>
            <p className="tag-code !text-chloro">FIELD NOTE · NO.2026</p>
            <p className="mt-3 font-heading text-3xl font-bold leading-tight tracking-tight md:text-4xl">
              잎 한 장을 스캔하면,<br /><span className="text-chloro">한 해의 수확</span>을 지킵니다.
            </p>
          </div>
          <Link to="/diagnosis" className="inline-flex items-center gap-2 self-start rounded-full bg-chloro px-6 py-3 text-sm font-semibold text-ink-950 hover:bg-white md:self-auto">
            무료 AI 진단 시작 <i className="fa-solid fa-arrow-right text-xs" />
          </Link>
        </div>

        <div className="mx-auto grid max-w-[1280px] gap-10 px-5 py-12 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <Logo light />
            <dl className="mt-6 space-y-1.5 text-[12.5px] leading-relaxed text-white/45">
              <div><dt className="inline text-white/70">운영</dt> <dd className="inline">farmpick 프로젝트팀 · 조장 이오리</dd></div>
              <div><dt className="inline text-white/70">팀원</dt> <dd className="inline">박미금 · 김모란 · 홍기흥</dd></div>
              <div><dt className="inline text-white/70">문의</dt> <dd className="inline">contact@farmpick.kr (평일 09:00–18:00)</dd></div>
              <div><dt className="inline text-white/70">협력</dt> <dd className="inline">AI Hub · 농촌진흥청 · 기상청 공공데이터</dd></div>
            </dl>
            <div className="mt-6 flex gap-2">
              {CHANNELS.map(([icon, label, href]) => (
                <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label} title={label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-xs text-white/60 transition-colors hover:border-chloro hover:text-chloro">
                  <i className={icon} />
                </a>
              ))}
            </div>
          </div>
          {FOOTER_COLS.map(([title, items]) => (
            <div key={title}>
              <h4 className="tag-code mb-4 !text-white/35">{title}</h4>
              <ul className="space-y-2.5">
                {items.map(([label, to]) => (
                  <li key={label}>
                    <FooterLink to={to}>
                      {label === '개인정보처리방침' ? <b className="text-white/85">{label}</b> : label}
                    </FooterLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-[1280px] flex-col gap-2 px-5 py-5 pr-24 text-[11.5px] text-white/35 md:flex-row md:items-center md:justify-between">
            <span>데이터 출처: AI Hub · 공공데이터포털 · 농촌진흥청 국가농작물병해충관리시스템 · 기상청</span>
            <span className="font-mono">© 2026 farmpick. All rights reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
