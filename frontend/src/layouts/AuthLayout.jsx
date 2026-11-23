import { Link, Outlet } from 'react-router-dom';
import Logo from '../components/Logo';
import { PHOTOS } from '../lib/photos';

// 사진 원본 비율(1600×1067) 기준 % 좌표 — 래퍼가 비율을 유지하므로 크롭돼도 박스가 정확히 따라감
const BOXES = [
  { x: 23.5, y: 27, w: 26, h: 35, label: '열매 · 미숙과 정상 97%' },
  { x: 51, y: 39, w: 25.5, h: 37, label: '열매 · 정상 94%', delay: 0.4 },
  { x: 1, y: 58, w: 40, h: 36, label: '잎 · 잎곰팡이병 의심 81%', warn: true, delay: 0.8 },
];

function DetectionPhoto({ className = '' }) {
  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      <div className="absolute left-1/2 top-1/2 aspect-[1600/1067] -translate-x-1/2 -translate-y-1/2"
        style={{ width: 'max(100%, calc(var(--ph, 100vh) * 1.4996))' }}>
        <img src={PHOTOS.tomato.src} alt={PHOTOS.tomato.alt} className="h-full w-full object-cover" />
        {BOXES.map((b) => (
          <span key={b.label} className={`bbox ${b.warn ? 'warn text-[#ff9f43]' : 'text-chloro'}`}
            style={{ left: `${b.x}%`, top: `${b.y}%`, width: `${b.w}%`, height: `${b.h}%`, animationDelay: `${b.delay || 0}s, ${(b.delay || 0) + 0.6}s` }}>
            <span className="bbox-label">{b.label}</span>
          </span>
        ))}
      </div>
      <div className="scan-beam" />
    </div>
  );
}

export default function AuthLayout() {
  return (
    <div className="grid min-h-screen items-start bg-paper lg:grid-cols-[1.08fr_1fr]">
      {/* 좌측: 실사 + AI 탐지 오버레이 */}
      <aside className="relative hidden h-screen overflow-hidden bg-forest-950 lg:sticky lg:top-0 lg:block">
        <DetectionPhoto />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-forest-950 via-forest-950/25 to-forest-950/55" />
        <div className="relative flex h-full flex-col justify-between p-10 xl:p-12">
          <Logo light />
          <div className="max-w-xl text-white">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 font-mono text-[11px] text-chloro backdrop-blur">
              <span className="pulse-dot">LIVE</span> 3개 객체 탐지 · 처리 2.8초
            </span>
            <h1 className="mt-5 font-serif text-[44px] font-bold leading-[1.18] tracking-[-0.03em] xl:text-[52px]">
              사진 한 장이면,<br />잎 뒤에 숨은 <span className="text-chloro">병해충</span>이<br />보입니다.
            </h1>
            <div className="mt-8 grid grid-cols-3 gap-3">
              {[['10종+', '진단 병해충'], ['87%', 'AI 평균 신뢰도'], ['8개', '지원 작물']].map(([v, t]) => (
                <div key={t} className="leaf-r border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-md">
                  <p className="font-heading text-2xl font-bold">{v}</p>
                  <p className="text-[12px] text-white/60">{t}</p>
                </div>
              ))}
            </div>
            <p className="mt-6 text-[11px] text-white/40">
              Photo by <a href={PHOTOS.tomato.link} target="_blank" rel="noreferrer" className="underline">{PHOTOS.tomato.author}</a> on Unsplash · 탐지 박스는 데모 시각화입니다
            </p>
          </div>
        </div>
      </aside>

      {/* 우측: 폼 */}
      <main className="flex min-h-screen flex-col">
        <div className="flex items-center justify-between px-6 py-5 lg:px-10">
          <span className="lg:invisible"><Logo /></span>
          <Link to="/" className="flex items-center gap-1.5 rounded-full border border-ink-200 bg-sheet px-3.5 py-1.5 text-[12.5px] font-semibold text-ink-700 hover:border-ink-900">
            <i className="fa-solid fa-arrow-left text-[10px]" />메인으로
          </Link>
        </div>

        {/* 모바일 사진 배너 */}
        <div className="relative mx-6 h-44 overflow-hidden rounded-[24px_6px_24px_6px] [--ph:11rem] lg:hidden">
          <DetectionPhoto />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-forest-950/90 to-transparent p-4 font-serif text-lg font-bold text-white">
            사진 한 장이면, 병해충이 보입니다.
          </div>
        </div>

        <div className="mx-auto flex w-full max-w-[420px] flex-1 flex-col justify-center px-6 py-10">
          <Outlet />
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 border-t border-dashed border-ink-200 px-6 py-5 text-[12px] text-ink-500">
          <Link to="/" className="hover:text-ink-900">이용약관</Link>
          <Link to="/" className="font-bold text-ink-800 hover:text-ink-950">개인정보처리방침</Link>
          <Link to="/chat" className="hover:text-ink-900">고객센터</Link>
          <span className="font-mono text-ink-400">© 2026 farmpick</span>
        </div>
      </main>
    </div>
  );
}
