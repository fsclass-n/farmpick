import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { SkeletonCard } from '../components/Skeleton';
import SpecimenArt, { severityClass } from '../components/SpecimenArt';

// 부위별 대표 병징 표본 (도감 DB의 병해충명과 매칭)
const PART_SPECIMENS = {
  leaf: {
    label: '잎', en: 'LEAF', icon: 'fa-leaf',
    items: [
      { pest: '흰가루병', lesion: 'powder', crop: '오이', sign: '잎 표면 흰 가루 모양 균사', severity: '중' },
      { pest: '노균병', lesion: 'yellow', crop: '오이', sign: '잎맥에 갇힌 다각형 황색 반점', severity: '상' },
      { pest: '총채벌레', lesion: 'silver', crop: '고추', sign: '은백색 흡즙 자국·잎 뒤틀림', severity: '상' },
    ],
  },
  stem: {
    label: '줄기', en: 'STEM', icon: 'fa-seedling',
    items: [
      { pest: '역병', lesion: 'rot', crop: '고추', sign: '지제부 갈변·물러짐, 급격한 시듦', severity: '상' },
      { pest: '진딧물', lesion: 'insect', crop: '고추', sign: '신초·마디에 군집, 감로 분비', severity: '중' },
      { pest: '잿빛곰팡이병', lesion: 'mold', crop: '토마토', sign: '상처 부위 회색 곰팡이층', severity: '상' },
    ],
  },
  fruit: {
    label: '열매', en: 'FRUIT', icon: 'fa-apple-whole',
    items: [
      { pest: '탄저병', lesion: 'sunken', crop: '고추', sign: '움푹 꺼진 원형 병반, 주황 포자', severity: '상' },
      { pest: '잿빛곰팡이병', lesion: 'mold', crop: '딸기', sign: '과실 표면 회색 곰팡이, 무름', severity: '상' },
      { pest: '정상', lesion: 'none', crop: '토마토', sign: '균일한 착색·광택, 병반 없음', severity: '없음' },
    ],
  },
};

// 증상 비교 — 정상 vs 감염 체크포인트
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

const code = (s, i) => `FP-${s.slice(0, 2).toUpperCase()}-${String(i + 1).padStart(3, '0')}`;

export default function Home() {
  const [alerts, setAlerts] = useState(null);
  const [pests, setPests] = useState([]);
  const [regions, setRegions] = useState(null);
  const [manuals, setManuals] = useState([]);
  const [part, setPart] = useState('leaf');
  const [cmp, setCmp] = useState(0);

  useEffect(() => {
    api('/api/trends/alerts').then(setAlerts).catch(() => setAlerts([]));
    api('/api/pests/').then(setPests).catch(() => {});
    api('/api/trends/regions').then(setRegions).catch(() => {});
    api('/api/pests/manuals').then(setManuals).catch(() => {});
  }, []);

  const pestId = useMemo(() => Object.fromEntries(pests.map((p) => [p.name, p.id])), [pests]);
  const total = regions?.reduce((s, r) => s + r.count, 0);
  const C = COMPARE[cmp];
  const cmpPest = pests.find((p) => p.name === C.pest);

  return (
    <div className="space-y-24">
      {/* ───────── HERO: 표본 보드 ───────── */}
      <section className="grid-paper relative overflow-hidden rounded-[28px] border border-ink-200">
        <div className="grid items-center gap-10 px-7 py-12 md:grid-cols-[1.1fr_1fr] md:px-14 md:py-16">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-forest-300 bg-forest-50 px-3 py-1 text-[12px] font-medium text-forest-700">
              <span className="h-1.5 w-1.5 rounded-full bg-forest-500" /> Gemini Vision 기반 생육 이미지 진단
            </span>
            <h1 className="mt-6 font-heading text-[40px] font-bold leading-[1.12] tracking-tight text-ink-950 md:text-[58px]">
              잎·줄기·열매를<br />
              <span className="relative inline-block">
                <span className="relative z-10">표본처럼</span>
                <span className="absolute inset-x-0 bottom-1.5 z-0 h-4 bg-chloro/70" />
              </span>{' '}읽어내는<br />
              병해충 진단 연구실
            </h1>
            <p className="mt-6 max-w-lg text-[16px] leading-relaxed text-ink-600">
              농장에서 찍은 사진 한 장을 AI가 표본 카드로 기록합니다. 병명·신뢰도·유사 병해 비교와
              단계별 방제 가이드까지 한 화면에서 확인하세요.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link to="/diagnosis" className="btn-primary inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm">
                <i className="fa-solid fa-camera" /> 사진으로 진단하기
              </Link>
              <Link to="/pests" className="btn-ghost inline-flex items-center gap-2 rounded-full bg-sheet px-6 py-3.5 text-sm">
                <i className="fa-solid fa-book-open text-xs" /> 병해충 도감
              </Link>
            </div>
          </div>

          {/* 표본 보드 */}
          <div className="relative mx-auto w-full max-w-[440px]">
            <div className="specimen specimen-hole rotate-[1.5deg] p-5 !shadow-[0_30px_60px_-20px_rgba(28,25,21,0.35)]">
              <div className="flex items-center justify-between">
                <span className="tag-code">SPECIMEN · FP-LF-0427</span>
                <span className="tag-code mr-5">2026.11.23 06:42</span>
              </div>
              <div className="relative mt-3 overflow-hidden rounded-xl bg-[#eef3e4]">
                <SpecimenArt part="leaf" lesion="powder" className="mx-auto h-64 w-64" />
                <span className="loupe left-[30%] top-[22%] h-16 w-16" />
                <span className="absolute left-3 top-3 rounded bg-ink-950/80 px-2 py-1 font-mono text-[10px] text-chloro">
                  SCANNING…
                </span>
              </div>
              <div className="mt-4 grid grid-cols-[1fr_auto] items-end gap-3">
                <div>
                  <p className="tag-code">DIAGNOSIS</p>
                  <p className="font-heading text-xl font-bold text-ink-950">흰가루병 <span className="text-sm font-medium text-ink-400">Powdery mildew</span></p>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink-100">
                      <div className="h-full w-[92%] rounded-full bg-forest-500" />
                    </div>
                    <span className="font-mono text-[11px] font-semibold text-forest-700">92%</span>
                  </div>
                </div>
                <span className="stamp sev-mid">중 · 주의</span>
              </div>
            </div>
            <div className="specimen absolute -bottom-6 -left-6 hidden w-40 -rotate-[5deg] p-3 md:block">
              <p className="tag-code">CROP</p>
              <p className="text-sm font-semibold text-ink-900"><i className="fa-solid fa-location-dot mr-1 text-blight" />논산 · 오이 하우스</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 border-t border-ink-200 bg-sheet/80 md:grid-cols-4">
          {[
            [total ? `${total.toLocaleString()}` : '—', '건', '올해 누적 발생 신고'],
            [pests.length ? `${pests.length - 1}` : '—', '종', '진단 가능 병해충'],
            ['87', '%', 'AI 평균 신뢰도'],
            ['3', '초', '평균 진단 소요'],
          ].map(([v, u, t], i) => (
            <div key={t} className={`px-6 py-5 ${i ? 'border-l border-ink-200' : ''} ${i === 2 ? 'max-md:border-l-0 max-md:border-t' : ''} ${i === 3 ? 'max-md:border-t' : ''}`}>
              <p className="font-heading text-2xl font-bold text-ink-950 md:text-3xl">{v}<span className="ml-0.5 text-base text-ink-400">{u}</span></p>
              <p className="tag-code mt-1">{t}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ───────── 부위별 진단 카드 ───────── */}
      <section>
        <SectionHead no="01" en="Diagnosis by Part" title="부위별 병징 표본" desc="잎·줄기·열매 중 이상이 보이는 부위를 고르면 대표 병징을 비교할 수 있습니다." />
        <div className="seg mb-7" role="tablist">
          {Object.entries(PART_SPECIMENS).map(([k, v]) => (
            <button key={k} role="tab" aria-selected={part === k} onClick={() => setPart(k)}>
              <i className={`fa-solid ${v.icon} mr-1.5 text-xs`} />{v.label}
              <span className="ml-1.5 font-mono text-[10px] opacity-50">{v.en}</span>
            </button>
          ))}
        </div>
        <div key={part} className="fade-in grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PART_SPECIMENS[part].items.map((s, i) => (
            <Link key={s.pest + s.crop} to={pestId[s.pest] ? `/pests?highlight=${pestId[s.pest]}` : '/pests'}
              className="specimen specimen-hole group block overflow-hidden">
              <div className="relative flex h-56 items-center justify-center bg-[#eef3e4]">
                <SpecimenArt part={part} lesion={s.lesion} healthy={s.lesion === 'none'} className="h-48 w-48 transition-transform duration-500 group-hover:scale-110" />
                <span className="absolute left-4 top-4 tag-code rounded bg-sheet/90 px-2 py-0.5">{code(PART_SPECIMENS[part].en, i)}</span>
              </div>
              <div className="border-t border-dashed border-ink-300 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="tag-code">{PART_SPECIMENS[part].label} · {s.crop}</p>
                    <h3 className="mt-1 font-heading text-lg font-bold text-ink-950">{s.pest}</h3>
                  </div>
                  <span className={`stamp ${severityClass(s.severity)}`}>{s.severity === '없음' ? '정상' : `위험 ${s.severity}`}</span>
                </div>
                <p className="mt-3 text-[13.5px] leading-relaxed text-ink-600">{s.sign}</p>
                <p className="mt-4 text-[12px] font-medium text-forest-700 opacity-0 transition-opacity group-hover:opacity-100">
                  도감에서 방제법 보기 <i className="fa-solid fa-arrow-right ml-1" />
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ───────── 증상 비교 ───────── */}
      <section>
        <SectionHead no="02" en="Symptom Compare" title="정상 vs 감염, 한눈에 비교" desc="헷갈리기 쉬운 병징을 나란히 놓고 체크포인트로 구분하세요." />
        <div className="mb-6 flex flex-wrap gap-2">
          {COMPARE.map((c, i) => (
            <button key={c.pest} onClick={() => setCmp(i)}
              className={`rounded-full border px-4 py-2 text-[13px] font-medium transition-colors ${
                cmp === i ? 'border-ink-950 bg-ink-950 text-white' : 'border-ink-300 bg-sheet text-ink-600 hover:border-ink-900'
              }`}>{c.pest}</button>
          ))}
        </div>
        <div key={cmp} className="fade-in overflow-hidden rounded-[22px] border border-ink-200 bg-sheet">
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
                  <div className={`mt-3 flex h-52 items-center justify-center rounded-xl ${col[5]}`}>
                    <SpecimenArt part={C.part} lesion={col[2] ? 'none' : C.lesion} healthy={col[2]} className="h-44 w-44" />
                  </div>
                  <h3 className="mt-5 font-heading text-lg font-bold text-ink-950">{col[1]}</h3>
                  <ul className="mt-3 space-y-2">
                    {col[3].map((t) => (
                      <li key={t} className="flex gap-2.5 text-[14px] text-ink-700">
                        <i className={`fa-solid ${col[4]} mt-1 text-xs`} />{t}
                      </li>
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

      {/* ───────── 방제 가이드 ───────── */}
      <section className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <SectionHead no="03" en="Control Guide" title="종합 방제(IPM) 4단계" desc="약제는 마지막 수단입니다. 예찰부터 차근차근 적용하세요." />
          <ol className="rail space-y-5">
            {CONTROL_STEPS.map(([t, icon, d], i) => (
              <li key={t} className="relative flex gap-4">
                <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-forest-600 font-mono text-[11px] font-bold text-white ring-4 ring-paper">
                  {i + 1}
                </span>
                <div className="specimen flex-1 p-4 !shadow-none hover:!translate-y-0">
                  <p className="font-heading font-semibold text-ink-950"><i className={`fa-solid ${icon} mr-2 text-forest-600`} />{t}</p>
                  <p className="mt-1 text-[13.5px] leading-relaxed text-ink-600">{d}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <div className="rounded-[22px] bg-ink-950 p-6 text-white md:p-8">
          <div className="grid-paper-dark -m-6 rounded-[22px] p-6 md:-m-8 md:p-8">
            <div className="flex items-center justify-between">
              <p className="tag-code !text-chloro">FIELD MANUAL</p>
              <span className="text-[12px] text-white/40">관리자가 등록한 현장 매뉴얼</span>
            </div>
            <h3 className="mt-2 font-heading text-2xl font-bold">작물별 방제 매뉴얼</h3>
            <div className="mt-6 space-y-4">
              {manuals.length === 0 && <div className="skeleton h-28 !bg-white/5" />}
              {manuals.map((m) => (
                <details key={m.id} className="group rounded-xl border border-white/10 bg-white/[0.03] p-4 open:bg-white/[0.06]">
                  <summary className="flex cursor-pointer list-none items-center gap-3">
                    <span className="rounded bg-chloro px-2 py-0.5 font-mono text-[10px] font-bold text-ink-950">{m.stage}</span>
                    <span className="flex-1 text-[14.5px] font-medium">{m.title}</span>
                    <i className="fa-solid fa-chevron-down text-xs text-white/40 transition-transform group-open:rotate-180" />
                  </summary>
                  <ol className="mt-4 space-y-2 border-t border-white/10 pt-4">
                    {m.steps.map((s, i) => (
                      <li key={s} className="flex gap-3 text-[13.5px] text-white/70">
                        <span className="font-mono text-chloro">{String(i + 1).padStart(2, '0')}</span>{s}
                      </li>
                    ))}
                  </ol>
                  <p className="mt-3 text-[11.5px] text-white/35">{m.crop} · {m.pest}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ───────── 이달의 예찰 경보 ───────── */}
      <section>
        <SectionHead no="04" en="Forecast Alert" title="이달의 예찰 경보" link={['/trends', '전체 발생 동향']} />
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
      <section className="relative overflow-hidden rounded-[28px] bg-forest-700 px-8 py-16 text-center text-white md:px-14">
        <div className="grid-paper-dark absolute inset-0" />
        <div className="relative">
          <p className="tag-code !text-chloro">START SCAN</p>
          <h2 className="mt-4 font-heading text-3xl font-bold md:text-4xl">오늘 아침, 농장의 잎 한 장을 찍어 보세요</h2>
          <p className="mx-auto mt-4 max-w-xl text-[15px] text-white/70">사진이 없어도 괜찮습니다. 데모 진단으로 결과 카드를 먼저 체험할 수 있어요.</p>
          <Link to="/diagnosis" className="mt-8 inline-flex items-center gap-2 rounded-full bg-chloro px-8 py-3.5 text-sm font-semibold text-ink-950 hover:bg-white">
            AI 진단 시작하기 <i className="fa-solid fa-arrow-right text-xs" />
          </Link>
        </div>
      </section>
    </div>
  );
}

export function SectionHead({ no, en, title, desc, link }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="flex items-center gap-2">
          <span className="font-mono text-[12px] font-semibold text-forest-600">{no}</span>
          <span className="h-px w-8 bg-forest-400" />
          <span className="eyebrow">{en}</span>
        </p>
        <h2 className="mt-3 font-heading text-[28px] font-bold tracking-tight text-ink-950 md:text-[32px]">{title}</h2>
        {desc && <p className="mt-2 text-[15px] text-ink-500">{desc}</p>}
      </div>
      {link && (
        <Link to={link[0]} className="text-[13px] font-medium text-ink-600 underline-offset-4 hover:text-ink-950 hover:underline">
          {link[1]} →
        </Link>
      )}
    </div>
  );
}
