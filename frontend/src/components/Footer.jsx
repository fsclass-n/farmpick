import { Link } from 'react-router-dom';
import { FAMILY_SITES } from '../lib/site';
import { PHOTOS, PHOTO_CREDITS } from '../lib/photos';
import Logo from './Logo';

const COLS = [
  ['서비스', [['AI 사진 진단', '/diagnosis'], ['병해충 도감', '/pests'], ['발생 동향 · 예찰', '/trends'], ['마이팜', '/myfarm']]],
  ['고객 지원', [['AI 방제 상담', '/chat'], ['자주 묻는 질문', '/chat'], ['공지사항', '/'], ['1:1 이메일 문의', 'mailto:contact@farmpick.kr']]],
  ['파트너', [['기업 수요 리포트', '/trends'], ['데이터 제휴', 'mailto:contact@farmpick.kr'], ['농업기술센터 연계', 'https://www.rda.go.kr']]],
];

const POLICIES = [['이용약관', '/'], ['개인정보처리방침', '/', true], ['위치기반서비스 이용약관', '/'], ['데이터 이용 정책', '/'], ['이메일무단수집거부', '/']];

const CHANNELS = [
  ['fa-brands fa-github', 'GitHub', 'https://github.com/fsclass-n/farmpick'],
  ['fa-solid fa-book', '프로젝트 문서', 'https://fsclass-n.github.io/farmpick/'],
  ['fa-solid fa-envelope', '이메일', 'mailto:contact@farmpick.kr'],
];

function A({ to, children, className = '' }) {
  const cls = `transition-colors hover:text-forest-700 ${className}`;
  return /^(https?:|mailto:)/.test(to)
    ? <a href={to} target={to.startsWith('http') ? '_blank' : undefined} rel="noreferrer" className={cls}>{children}</a>
    : <Link to={to} className={cls}>{children}</Link>;
}

export default function Footer() {
  return (
    <footer className="pb-tabbar mt-24">
      {/* 상담 밴드 — 들판 사진 */}
      <div className="mx-auto max-w-[1280px] px-5">
        <div className="leaf-r-lg relative -mb-16 overflow-hidden">
          <img src={PHOTOS.fieldRows.src} alt={PHOTOS.fieldRows.alt} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-forest-950/95 via-forest-950/80 to-forest-900/40" />
          <div className="relative grid gap-8 p-8 text-white md:grid-cols-[1.1fr_1.4fr] md:items-center md:p-12">
            <div>
              <p className="font-mono text-[11px] font-semibold tracking-[0.16em] text-chloro">FIELD SUPPORT</p>
              <h3 className="mt-3 font-serif text-[28px] font-bold leading-snug md:text-[32px]">방제 시기를 놓치기 전에<br />지금 물어보세요</h3>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ['fa-comments', 'AI 방제 상담', '24시간 즉시 답변', '/chat'],
                ['fa-camera', '사진 진단', '평균 3초 판독', '/diagnosis'],
                ['fa-envelope-open-text', '전문가 문의', '영업일 1일 내 회신', 'mailto:contact@farmpick.kr'],
              ].map(([icon, t, d, to]) => (
                <A key={t} to={to} className="leaf-r block border border-white/15 bg-white/10 p-4 backdrop-blur hover:!text-white hover:bg-white/20">
                  <i className={`fa-solid ${icon} text-chloro`} />
                  <p className="mt-3 text-[14px] font-bold">{t}</p>
                  <p className="text-[12px] text-white/60">{d}</p>
                </A>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t-2 border-dashed border-ink-300 bg-ink-100 pt-28">
        <div className="mx-auto max-w-[1280px] px-5">
          <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
            <div>
              <Logo />
              <p className="mt-5 max-w-xs text-[13.5px] leading-relaxed text-ink-600">
                생육 이미지 한 장으로 병해충을 진단하고, 지역·작물별 발생 데이터로 다음 방제를 준비하는 농업 데이터 플랫폼.
              </p>
              <div className="mt-5 flex gap-2">
                {CHANNELS.map(([icon, label, href]) => (
                  <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label} title={label}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-ink-300 bg-sheet text-[13px] text-ink-600 transition-colors hover:border-forest-600 hover:bg-forest-600 hover:text-white">
                    <i className={icon} />
                  </a>
                ))}
              </div>
            </div>
            {COLS.map(([title, items]) => (
              <div key={title}>
                <h4 className="eyebrow mb-4">{title}</h4>
                <ul className="space-y-2.5 text-[13.5px] text-ink-700">
                  {items.map(([l, to]) => <li key={l}><A to={to}>{l}</A></li>)}
                </ul>
              </div>
            ))}
          </div>

          {/* 정책 링크 + 패밀리 사이트 */}
          <div className="mt-12 flex flex-col gap-4 border-t border-ink-300 py-5 md:flex-row md:items-center md:justify-between">
            <ul className="flex flex-wrap gap-x-5 gap-y-2 text-[12.5px] text-ink-600">
              {POLICIES.map(([l, to, strong]) => (
                <li key={l}><A to={to} className={strong ? 'font-bold text-ink-950' : ''}>{l}</A></li>
              ))}
            </ul>
            <label className="relative">
              <span className="sr-only">관련 기관 사이트</span>
              <select defaultValue="" onChange={(e) => e.target.value && window.open(e.target.value, '_blank', 'noopener')}
                className="w-full appearance-none rounded-md border border-ink-300 bg-sheet py-2 pl-3 pr-9 text-[12.5px] text-ink-700 md:w-60">
                <option value="" disabled>관련 기관 사이트</option>
                {FAMILY_SITES.map(([n, url]) => <option key={url} value={url}>{n}</option>)}
              </select>
              <i className="fa-solid fa-chevron-down pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-ink-400" />
            </label>
          </div>

          {/* 운영 정보 */}
          <div className="space-y-1.5 pb-8 text-[12px] leading-relaxed text-ink-500">
            <p>
              <span className="text-ink-700">farmpick 프로젝트팀</span><Sep />조장 이오리<Sep />팀원 박미금 · 김모란 · 홍기흥
              <Sep />문의 contact@farmpick.kr<Sep />운영시간 평일 09:00 – 18:00 (주말·공휴일 휴무)
            </p>
            <p>데이터 출처: AI Hub(한국지능정보사회진흥원) · 농촌진흥청 국가농작물병해충관리시스템 · 기상청 · 공공데이터포털</p>
            <p className="text-ink-400">본 서비스의 AI 진단 결과는 참고용이며, 정확한 진단과 약제 처방은 지역 농업기술센터 전문가와 상담하시기 바랍니다.</p>
            <div className="flex flex-wrap items-center justify-between gap-2 pt-3">
              <p className="font-mono text-ink-600">© 2026 farmpick. All rights reserved.</p>
              <details className="group text-ink-400">
                <summary className="cursor-pointer list-none hover:text-ink-700"><i className="fa-solid fa-camera-retro mr-1" />Photos from Unsplash</summary>
                <p className="mt-1 max-w-md">
                  {PHOTO_CREDITS.map((p, i) => (
                    <span key={p.src}>{i > 0 && ', '}<a href={p.link} target="_blank" rel="noreferrer" className="underline-offset-2 hover:underline">{p.author}</a></span>
                  ))}
                </p>
              </details>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function Sep() {
  return <span className="mx-2 text-ink-300">|</span>;
}
