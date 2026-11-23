import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { PHOTOS } from '../lib/photos';
import { SkeletonCard } from '../components/Skeleton';
import SpecimenArt, { severityClass } from '../components/SpecimenArt';

// 부위별 대표 병징 (도감 DB의 병해충명과 매칭)
const PARTS = {
  leaf: {
    label: '잎', en: 'LEAF', icon: 'fa-leaf', photo: PHOTOS.leafSpot,
    note: '잎은 병해충이 가장 먼저 신호를 보내는 곳입니다. 앞면과 뒷면을 모두 촬영하세요.',
    box: { x: 18, y: 22, w: 46, h: 52, label: '잎 · 반점 병징 탐지 89%' },
    items: [
      { pest: '흰가루병', lesion: 'powder', crop: '오이', sign: '잎 표면 흰 가루 모양 균사', severity: '중' },
      { pest: '노균병', lesion: 'yellow', crop: '오이', sign: '잎맥에 갇힌 다각형 황색 반점', severity: '상' },
      { pest: '총채벌레', lesion: 'silver', crop: '고추', sign: '은백색 흡즙 자국·잎 뒤틀림', severity: '상' },
    ],
  },
  stem: {
    label: '줄기 · 포기', en: 'STEM', icon: 'fa-seedling', photo: PHOTOS.pepper,
    note: '시듦·갈변이 포기 전체로 번지면 줄기 기부와 뿌리 쪽을 함께 확인해야 합니다.',
    box: { x: 64, y: 8, w: 32, h: 48, label: '포기 · 시듦 의심 77%', warn: true },
    items: [
      { pest: '역병', lesion: 'rot', crop: '고추', sign: '지제부 갈변·물러짐, 급격한 시듦', severity: '상' },
      { pest: '진딧물', lesion: 'insect', crop: '고추', sign: '신초·마디에 군집, 감로 분비', severity: '중' },
      { pest: '잿빛곰팡이병', lesion: 'mold', crop: '토마토', sign: '상처 부위 회색 곰팡이층', severity: '상' },
    ],
  },
  fruit: {
    label: '열매', en: 'FRUIT', icon: 'fa-apple-whole', photo: PHOTOS.strawberry,
    note: '열매 병반은 상품성과 직결됩니다. 움푹 꺼짐·곰팡이·무름을 놓치지 마세요.',
    box: { x: 41, y: 28, w: 30, h: 48, label: '열매 · 정상 96%' },
    items: [
      { pest: '탄저병', lesion: 'sunken', crop: '고추', sign: '움푹 꺼진 원형 병반, 주황 포자', severity: '상' },
      { pest: '잿빛곰팡이병', lesion: 'mold', crop: '딸기', sign: '과실 표면 회색 곰팡이, 무름', severity: '상' },
      { pest: '정상', lesion: 'none', crop: '딸기', sign: '균일한 착색·광택, 병반 없음', severity: '없음' },
    ],
  },
};

const COMPARE = [
  { pest: '흰가루병', part: 'leaf', lesion: 'powder', healthy: ['잎 표면 매끈·광택', '균일한 녹색', '잎 가장자리 탄력'], infected: ['손으로 문지르면 지워지는 흰 가루', '병반 주변 황화', '심하면 잎 전체가 마름'], mistake: '노균병 — 노균병은 잎 뒷면에 곰팡이, 흰가루병은 앞면' },
  { pest: '탄저병', part: 'fruit', lesion: 'sunken', healthy: ['선명한 착색', '표면 단단함', '꼭지 녹색 유지'], infected: ['원형으로 움푹 꺼진 병반', '동심원 무늬·주황색 포자덩이', '빗물 튐으로 이웃 과실 전염'], mistake: '일소(햇볕 데임) — 일소는 포자가 없고 흰색으로 탈색' },
  { pest: '역병', part: 'stem', lesion: 'rot', healthy: ['줄기 기부 녹색·단단', '뿌리 흰색', '잎 처짐 없음'], infected: ['지제부 암갈색 수침상 병반', '한낮 급격한 시듦', '뿌리 갈변·부패'], mistake: '풋마름병 — 줄기 절단 시 흰 세균 유출 여부로 구분' },
];

const CONTROL_STEPS = [
  ['예찰', 'fa-binoculars', '주 1회 트랩·잎 뒷면 관찰, farmpick 사진 진단으로 기록'],
  ['경종적 방제', 'fa-wind', '환기·습도 관리, 병든 조직 제거, 윤작과 저항성 품종'],
  ['생물적 방제', 'fa-bugs', '천적(칠레이리응애·무당벌레) 방사, 미생물 제제 활용'],
  ['화학적 방제', 'fa-spray-can-sparkles', '등록 약제를 계통별 교호 살포, 안전사용기준 준수'],
];

// hero-leaf.webp(3:4) 기준 % 좌표
const HERO_BOXES = [
  { x: 30, y: 62, w: 21, h: 12, label: '식해 흔적 · 나방류 유충 88%', warn: true },
  { x: 65, y: 60, w: 22, h: 13, label: '식해 흔적 76%', warn: true, delay: 0.5 },
  { x: 40, y: 39, w: 13, h: 9, label: '구멍 병반 64%', delay: 1 },
];

function Bbox({ b }) {
  return (
    <span className={`bbox ${b.warn ? 'warn text-[#ff9f43]' : 'text-chloro'}`}
      style={{ left: `${b.x}%`, top: `${b.y}%`, width: `${b.w}%`, height: `${b.h}%`, animationDelay: `${b.delay || 0}s, ${(b.delay || 0) + 0.6}s` }}>
      <span className="bbox-label">{b.label}</span>
    </span>
  );
}

function Credit({ photo, className = '' }) {
  return (
    <a href={photo.link} target="_blank" rel="noreferrer"
      className={`absolute rounded-full bg-black/40 px-2 py-0.5 text-[10px] text-white/80 backdrop-blur hover:text-white ${className}`}>
      <i className="fa-solid fa-camera-retro mr-1" />{photo.author} / Unsplash
    </a>
  );
}

export default function Home() {
  const [alerts, setAlerts] = useState(null);
  const [pests, setPests] = useState([]);
  const [regions, setRegions] = useState(null);
  const [manuals, setManuals] = useState([]);
  const [monthly, setMonthly] = useState(null);
  const [part, setPart] = useState('leaf');
  const [cmp, setCmp] = useState(0);

  useEffect(() => {
    api('/api/trends/alerts').then(setAlerts).catch(() => setAlerts([]));
    api('/api/pests/').then(setPests).catch(() => {});
    api('/api/trends/regions').then(setRegions).catch(() => {});
    api('/api/pests/manuals').then(setManuals).catch(() => {});
    api('/api/trends/monthly').then(setMonthly).catch(() => {});
  }, []);

  const pestId = useMemo(() => Object.fromEntries(pests.map((p) => [p.name, p.id])), [pests]);
  const total = regions?.reduce((s, r) => s + r.count, 0);
  const C = COMPARE[cmp];
  const cmpPest = pests.find((p) => p.name === C.pest);
  const P = PARTS[part];

  return (
    <div className="space-y-28">
      {/* ───────── HERO ───────── */}
      <section className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-forest-300 bg-forest-50 px-3 py-1.5 text-[12.5px] font-semibold text-forest-700">
            <i className="fa-solid fa-wand-magic-sparkles text-[11px]" /> Gemini Vision 생육 이미지 진단
          </span>
          <h1 className="mt-6 font-serif text-[42px] font-bold leading-[1.16] tracking-[-0.035em] text-ink-950 md:text-[60px]">
            잎이 보내는 신호를<br />
            <span className="relative inline-block">
              <span className="relative z-10">가장 먼저</span>
              <svg className="absolute -bottom-2 left-0 z-0 w-full" viewBox="0 0 200 14" preserveAspectRatio="none" aria-hidden>
                <path d="M2 10 C 50 2, 120 2, 198 8" stroke="#c6e04f" strokeWidth="9" fill="none" strokeLinecap="round" />
              </svg>
            </span>{' '}읽습니다
          </h1>
          <p className="mt-7 max-w-lg text-[16.5px] leading-[1.75] text-ink-600">
            농장에서 찍은 사진 한 장으로 병해충을 찾아내고, 신뢰도·유사 병해 비교·단계별 방제법까지
            한 번에. 지역 발생 동향으로 다음 방제 시기도 미리 준비하세요.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link to="/diagnosis" className="btn-leaf inline-flex items-center gap-2.5 bg-ink-950 px-7 py-4 text-[15px] font-semibold text-white transition-colors hover:bg-forest-700">
              <i className="fa-solid fa-camera" /> 사진으로 진단하기
            </Link>
            <Link to="/pests" className="inline-flex items-center gap-2 px-3 py-4 text-[15px] font-semibold text-ink-800 underline-offset-[6px] hover:underline">
              병해충 도감 살펴보기 <i className="fa-solid fa-arrow-right text-xs" />
            </Link>
          </div>
          <dl className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-dashed border-ink-300 pt-6">
            {[
              [total ? total.toLocaleString() : '—', '건', '올해 발생 신고'],
              [pests.length ? pests.length - 1 : '—', '종', '진단 병해충'],
              ['87', '%', 'AI 평균 신뢰도'],
            ].map(([v, u, t]) => (
              <div key={t}>
                <dd className="font-heading text-[28px] font-bold leading-none text-ink-950">{v}<span className="ml-0.5 text-[15px] text-ink-400">{u}</span></dd>
                <dt className="mt-2 text-[12.5px] text-ink-500">{t}</dt>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative mx-auto w-full max-w-[460px]">
          <div className="leaf-r-xl relative aspect-[3/4] overflow-hidden shadow-[0_40px_80px_-30px_rgba(20,51,22,0.55)]">
            <img src={PHOTOS.heroLeaf.src} alt={PHOTOS.heroLeaf.alt} className="h-full w-full object-cover" fetchpriority="high" />
            {HERO_BOXES.map((b) => <Bbox key={b.label} b={b} />)}
            <div className="scan-beam" />
            <Credit photo={PHOTOS.heroLeaf} className="right-16 top-5" />
          </div>
          <div className="specimen absolute -bottom-8 -left-4 w-[250px] p-4 shadow-xl md:-left-12">
            <div className="flex items-center justify-between">
              <span className="tag-code">RESULT · FP-0427</span>
              <span className="stamp sev-mid">주의</span>
            </div>
            <p className="mt-2 font-heading text-[17px] font-bold text-ink-950">나방류 유충 식해</p>
            <div className="mt-2 flex items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink-100"><div className="h-full w-[88%] rounded-full bg-forest-500" /></div>
              <span className="font-mono text-[11px] font-semibold text-forest-700">88%</span>
            </div>
            <p className="mt-2 text-[12px] text-ink-500">권장: 잎 뒷면 유충 포살 · BT제 살포</p>
          </div>
          <div className="absolute -right-3 top-10 hidden rounded-full border border-ink-200 bg-sheet px-3.5 py-2 text-[12px] font-semibold text-ink-700 shadow-lg md:block">
            <i className="fa-solid fa-temperature-half mr-1.5 text-blight" />18℃ <span className="mx-1 text-ink-300">|</span>
            <i className="fa-solid fa-droplet mr-1.5 text-[#4a8fb8]" />66%
          </div>
        </div>
      </section>

      {/* ───────── 부위별 진단 ───────── */}
      <section>
        <SectionHead no="01" en="Diagnosis by Part" title="어느 부위가 이상한가요?" desc="부위를 고르면 farmpick이 주로 판별하는 대표 병징을 보여드립니다." />
        <div className="mb-7 flex flex-wrap gap-2" role="tablist">
          {Object.entries(PARTS).map(([k, v]) => (
            <button key={k} role="tab" aria-selected={part === k} onClick={() => setPart(k)}
              className={`btn-leaf flex items-center gap-2 border px-5 py-2.5 text-[14px] font-semibold transition-colors ${
                part === k ? 'border-forest-700 bg-forest-700 text-white' : 'border-ink-300 bg-sheet text-ink-600 hover:border-ink-900'
              }`}>
              <i className={`fa-solid ${v.icon} text-xs`} />{v.label}
              <span className="font-mono text-[10px] opacity-50">{v.en}</span>
            </button>
          ))}
        </div>
        <div key={part} className="fade-in grid gap-6 lg:grid-cols-[1fr_1.15fr]">
          <figure className="leaf-r-lg relative min-h-[340px] overflow-hidden bg-ink-900">
            <img src={P.photo.src} alt={P.photo.alt} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-950/85 via-transparent to-transparent" />
            <Bbox b={P.box} />
            <figcaption className="absolute inset-x-0 bottom-0 p-6 text-white">
              <p className="font-mono text-[11px] text-chloro">CHECK POINT · {P.en}</p>
              <p className="mt-2 max-w-sm text-[15px] leading-relaxed">{P.note}</p>
            </figcaption>
            <Credit photo={P.photo} className="right-4 top-4" />
          </figure>
          <div className="space-y-4">
            {P.items.map((s, i) => (
              <Link key={s.pest + s.crop} to={pestId[s.pest] ? `/pests?highlight=${pestId[s.pest]}` : '/pests'}
                className="specimen group flex items-center gap-5 p-4 pr-6">
                <span className="leaf-r flex h-24 w-24 shrink-0 items-center justify-center bg-[#eef3e4]">
                  <SpecimenArt part={part} lesion={s.lesion} healthy={s.lesion === 'none'} className="h-20 w-20 transition-transform duration-500 group-hover:scale-110" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="tag-code">FP-{P.en.slice(0, 2)}-{String(i + 1).padStart(3, '0')} · {s.crop}</p>
                  <h3 className="mt-1 font-heading text-[18px] font-bold text-ink-950">{s.pest}</h3>
                  <p className="mt-1 text-[13.5px] leading-relaxed text-ink-600">{s.sign}</p>
                </div>
                <div className="flex flex-col items-end gap-3">
                  <span className={`stamp ${severityClass(s.severity)}`}>{s.severity === '없음' ? '정상' : `위험 ${s.severity}`}</span>
                  <i className="fa-solid fa-arrow-right text-xs text-ink-300 transition-transform group-hover:translate-x-1 group-hover:text-forest-600" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── 증상 비교 ───────── */}
      <section>
        <SectionHead no="02" en="Symptom Compare" title="정상과 감염, 나란히 놓고 비교" desc="헷갈리기 쉬운 병징을 체크포인트로 구분하세요." />
        <div className="mb-6 flex flex-wrap gap-2">
          {COMPARE.map((c, i) => (
            <button key={c.pest} onClick={() => setCmp(i)}
              className={`rounded-full border px-4 py-2 text-[13.5px] font-semibold transition-colors ${
                cmp === i ? 'border-ink-950 bg-ink-950 text-white' : 'border-ink-300 bg-sheet text-ink-600 hover:border-ink-900'
              }`}>{c.pest}</button>
          ))}
        </div>
        <div key={cmp} className="fade-in leaf-r-lg overflow-hidden border border-ink-200 bg-sheet">
          <div className="grid md:grid-cols-[1fr_auto_1fr]">
            {[
              ['HEALTHY', '정상 표본', true, C.healthy, 'fa-circle-check text-forest-500', 'bg-[#eef3e4]'],
              null,
              ['INFECTED', `${C.pest} 감염 표본`, false, C.infected, 'fa-circle-exclamation text-blight', 'bg-[#f6e9df]'],
            ].map((col, i) =>
              col === null ? (
                <div key="vs" className="flex items-center justify-center border-ink-200 py-2 md:border-x">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-ink-950 font-mono text-xs font-bold text-chloro">VS</span>
                </div>
              ) : (
                <div key={col[0]} className="p-6 md:p-8">
                  <div className="flex items-center justify-between">
                    <span className="tag-code">{col[0]}</span>
                    {i === 2 && cmpPest && <span className={`stamp ${severityClass(cmpPest.severity)}`}>위험 {cmpPest.severity}</span>}
                  </div>
                  <div className={`leaf-r mt-3 flex h-52 items-center justify-center ${col[5]}`}>
                    <SpecimenArt part={C.part} lesion={col[2] ? 'none' : C.lesion} healthy={col[2]} className="h-44 w-44" />
                  </div>
                  <h3 className="mt-5 font-heading text-lg font-bold text-ink-950">{col[1]}</h3>
                  <ul className="mt-3 space-y-2">
                    {col[3].map((t) => (
                      <li key={t} className="flex gap-2.5 text-[14px] text-ink-700"><i className={`fa-solid ${col[4]} mt-1 text-xs`} />{t}</li>
                    ))}
                  </ul>
                </div>
              ),
            )}
          </div>
          <div className="flex flex-col gap-2 border-t border-dashed border-ink-300 bg-[#fff8e8] px-6 py-4 text-[13.5px] text-ink-700 md:flex-row md:items-center md:px-8">
            <span className="stamp sev-mid shrink-0">오진 주의</span>
            <span><b className="text-ink-900">혼동하기 쉬운 병해:</b> {C.mistake}</span>
            {cmpPest && <span className="text-ink-500 md:ml-auto">발생기 · {cmpPest.season}</span>}
          </div>
        </div>
      </section>

      {/* ───────── 병해충 달력 ───────── */}
      <section>
        <SectionHead no="03" en="Pest Almanac" title="병해충 발생 달력" desc="월별 발생 신고량을 색의 농도로 표시했습니다. 진할수록 예찰·예방이 필요한 시기입니다." link={['/trends', '상세 동향 분석']} />
        <div className="leaf-r-lg overflow-x-auto border border-ink-200 bg-sheet p-6 md:p-8">
          {!monthly ? <div className="skeleton h-48" /> : (
            <PestCalendar monthly={monthly} />
          )}
        </div>
      </section>

      {/* ───────── 방제 가이드 ───────── */}
      <section className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <SectionHead no="04" en="Control Guide" title="종합 방제(IPM) 4단계" desc="약제는 마지막 수단입니다. 예찰부터 차근차근 적용하세요." />
          <ol className="rail space-y-5">
            {CONTROL_STEPS.map(([t, icon, d], i) => (
              <li key={t} className="relative flex gap-4">
                <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-forest-600 font-mono text-[11px] font-bold text-white ring-4 ring-paper">{i + 1}</span>
                <div className="specimen flex-1 p-4 !shadow-none hover:!translate-y-0">
                  <p className="font-heading font-semibold text-ink-950"><i className={`fa-solid ${icon} mr-2 text-forest-600`} />{t}</p>
                  <p className="mt-1 text-[13.5px] leading-relaxed text-ink-600">{d}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <div className="leaf-r-lg relative overflow-hidden text-white">
          <img src={PHOTOS.greenhouse.src} alt={PHOTOS.greenhouse.alt} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-forest-950/88" />
          <div className="relative p-6 md:p-8">
            <div className="flex items-center justify-between">
              <p className="font-mono text-[11px] font-semibold tracking-[0.14em] text-chloro">FIELD MANUAL</p>
              <span className="text-[12px] text-white/45">관리자가 등록한 현장 매뉴얼</span>
            </div>
            <h3 className="mt-2 font-serif text-2xl font-bold">작물별 방제 매뉴얼</h3>
            <div className="mt-6 space-y-3">
              {manuals.length === 0 && <div className="skeleton h-28 !bg-white/5" />}
              {manuals.map((m) => (
                <details key={m.id} className="group rounded-xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur open:bg-white/[0.08]">
                  <summary className="flex cursor-pointer list-none items-center gap-3">
                    <span className="rounded bg-chloro px-2 py-0.5 font-mono text-[10px] font-bold text-ink-950">{m.stage}</span>
                    <span className="flex-1 text-[14.5px] font-medium">{m.title}</span>
                    <i className="fa-solid fa-chevron-down text-xs text-white/40 transition-transform group-open:rotate-180" />
                  </summary>
                  <ol className="mt-4 space-y-2 border-t border-white/10 pt-4">
                    {m.steps.map((s, i) => (
                      <li key={s} className="flex gap-3 text-[13.5px] text-white/75"><span className="font-mono text-chloro">{String(i + 1).padStart(2, '0')}</span>{s}</li>
                    ))}
                  </ol>
                  <p className="mt-3 text-[11.5px] text-white/40">{m.crop} · {m.pest}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ───────── 예찰 경보 ───────── */}
      <section>
        <SectionHead no="05" en="Forecast Alert" title="이달의 예찰 경보" link={['/trends', '전체 발생 동향']} />
        <div className="grid gap-5 md:grid-cols-3">
          {alerts === null && <SkeletonCard />}
          {alerts?.map((a, i) => (
            <div key={a.pest} className="specimen p-6">
              <div className="flex items-center justify-between">
                <span className="tag-code">ALERT-{String(i + 1).padStart(2, '0')}</span>
                <span className={`stamp ${severityClass(a.level)}`}><span className="pulse-dot" />{a.level}</span>
              </div>
              <p className="mt-4 font-heading text-xl font-bold text-ink-950">{a.pest}</p>
              <p className="mt-1 text-[13px] text-ink-500"><i className="fa-solid fa-location-dot mr-1 text-blight" />{a.region}</p>
              <p className="mt-4 border-t border-dashed border-ink-300 pt-4 text-[14px] leading-relaxed text-ink-700">{a.note}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ───────── CTA ───────── */}
      <section className="grid items-stretch gap-6 md:grid-cols-[0.8fr_1.2fr]">
        <div className="leaf-r-lg relative min-h-[300px] overflow-hidden">
          <img src={PHOTOS.farmerHand.src} alt={PHOTOS.farmerHand.alt} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
          <Credit photo={PHOTOS.farmerHand} className="bottom-4 left-4" />
        </div>
        <div className="leaf-r-lg grid-paper flex flex-col justify-center border border-ink-200 p-8 md:p-12">
          <p className="eyebrow">Start Scan</p>
          <h2 className="mt-4 font-serif text-[30px] font-bold leading-snug tracking-[-0.03em] text-ink-950 md:text-[38px]">
            오늘 아침, 농장의<br />잎 한 장을 찍어 보세요
          </h2>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ink-600">사진이 없어도 괜찮습니다. 데모 진단으로 결과 카드를 먼저 체험할 수 있어요.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/diagnosis" className="btn-leaf inline-flex items-center gap-2 bg-forest-600 px-7 py-3.5 text-sm font-semibold text-white hover:bg-forest-700">
              <i className="fa-solid fa-camera" />AI 진단 시작하기
            </Link>
            <Link to="/signup" className="btn-leaf inline-flex items-center gap-2 border border-ink-300 bg-sheet px-6 py-3.5 text-sm font-semibold text-ink-800 hover:border-ink-900">
              무료 회원가입
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function PestCalendar({ monthly }) {
  const now = new Date().getMonth();
  const max = Math.max(...monthly.series.flatMap((s) => s.data));
  return (
    <table className="w-full min-w-[720px] border-separate border-spacing-1.5">
      <thead>
        <tr>
          <th className="w-32" />
          {monthly.labels.map((l, i) => (
            <th key={l} className={`pb-1 font-mono text-[11px] font-semibold ${i === now ? 'text-forest-700' : 'text-ink-400'}`}>
              {i === now ? <span className="rounded-full bg-forest-600 px-2 py-0.5 text-white">{l}</span> : l}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {monthly.series.map((s) => (
          <tr key={s.name}>
            <th className="pr-3 text-left text-[13.5px] font-semibold text-ink-800">{s.name}</th>
            {s.data.map((v, i) => {
              const t = v / max;
              return (
                <td key={i} title={`${s.name} · ${monthly.labels[i]} ${v}건`}
                  className={`h-11 rounded-[10px_3px_10px_3px] text-center font-mono text-[10.5px] transition-transform hover:scale-110 ${i === now ? 'ring-2 ring-forest-600 ring-offset-1' : ''}`}
                  style={{ background: `rgba(44, 109, 40, ${0.08 + t * 0.85})`, color: t > 0.5 ? '#fff' : '#574d41' }}>
                  {v}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr>
          <td />
          <td colSpan={12} className="pt-3 text-right text-[11.5px] text-ink-500">
            적음 <span className="mx-1 inline-flex gap-1 align-middle">
              {[0.1, 0.3, 0.5, 0.7, 0.9].map((a) => <i key={a} className="inline-block h-3 w-5 rounded-sm" style={{ background: `rgba(44,109,40,${a})` }} />)}
            </span> 많음 · 단위: 신고 건수
          </td>
        </tr>
      </tfoot>
    </table>
  );
}

export function SectionHead({ no, en, title, desc, link }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="flex items-center gap-3">
          <span className="font-serif text-[15px] font-bold italic text-forest-600">No.{no}</span>
          <span className="eyebrow !text-ink-500 before:!hidden">{en}</span>
        </p>
        <h2 className="mt-3 font-serif text-[30px] font-bold tracking-[-0.035em] text-ink-950 md:text-[36px]">{title}</h2>
        {desc && <p className="mt-2 text-[15px] text-ink-500">{desc}</p>}
      </div>
      {link && (
        <Link to={link[0]} className="text-[13.5px] font-semibold text-ink-700 underline-offset-4 hover:text-ink-950 hover:underline">{link[1]} →</Link>
      )}
    </div>
  );
}
