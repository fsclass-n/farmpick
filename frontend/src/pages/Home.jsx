import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { SkeletonCard } from '../components/Skeleton';

const LEVEL_STYLE = {
  경보: 'border-red-300 text-red-600',
  주의: 'border-harvest/50 text-harvest',
};

export default function Home() {
  const [alerts, setAlerts] = useState(null);
  const [pests, setPests] = useState(null);
  const [regions, setRegions] = useState(null);

  useEffect(() => {
    api('/api/trends/alerts').then(setAlerts).catch(() => setAlerts([]));
    api('/api/pests/').then((d) => setPests(d.slice(0, 4))).catch(() => setPests([]));
    api('/api/trends/regions').then(setRegions).catch(() => {});
  }, []);

  const totalOccurrence = regions?.reduce((s, r) => s + r.count, 0);

  return (
    <div className="space-y-20">
      {/* Hero — 에디토리얼 스플릿 */}
      <section className="furrows-light overflow-hidden border border-ink-200 bg-white">
        <div className="grid md:grid-cols-2">
          <div className="px-8 py-14 md:px-12 md:py-20">
            <p className="eyebrow">AI Image Diagnosis · Smart Farm</p>
            <h1 className="mt-5 font-heading text-4xl font-bold leading-[1.15] tracking-tight text-ink-950 md:text-[52px]">
              잎사귀 속 병해충을<br />
              AI가 <span className="text-forest-600">먼저</span> 찾아냅니다
            </h1>
            <p className="mt-6 max-w-md text-[15px] leading-relaxed text-ink-500">
              생육 사진 한 장이면 충분합니다. Gemini Vision 진단부터 지역별 발생 동향,
              맞춤 방제 추천까지 — 농장을 지키는 데이터 플랫폼, farmpick.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link to="/diagnosis" className="btn-primary rounded-md px-7 py-3.5 text-sm">
                지금 진단하기
              </Link>
              <Link to="/trends" className="text-sm font-medium text-ink-700 underline-offset-4 hover:underline">
                발생 동향 보기 →
              </Link>
            </div>
          </div>
          <div className="furrows relative hidden items-center justify-center bg-ink-950 md:flex">
            <div className="absolute inset-0 bg-gradient-to-br from-forest-950 via-ink-950 to-ink-900" />
            <div className="relative text-center text-white">
              <i className="fa-solid fa-leaf float-slow text-7xl text-forest-400/80" />
              <p className="mt-6 font-heading text-lg font-semibold tracking-wide">Scan · Diagnose · Protect</p>
              <p className="mt-1 text-xs tracking-[0.2em] text-white/40">FARMPICK AI ENGINE</p>
            </div>
            <i className="fa-solid fa-bug absolute bottom-8 right-10 text-4xl text-white/10" />
            <i className="fa-solid fa-seedling float-slower absolute left-10 top-8 text-4xl text-white/10" />
          </div>
        </div>
        {totalOccurrence && (
          <div className="grid grid-cols-3 divide-x divide-ink-200 border-t border-ink-200 bg-paper">
            {[
              [`${totalOccurrence.toLocaleString()}건`, '올해 발생 신고'],
              [`${pests?.length ?? 9}+종`, '진단 가능 병해충'],
              ['87%', 'AI 평균 신뢰도'],
            ].map(([v, t]) => (
              <div key={t} className="px-6 py-5 text-center md:text-left">
                <p className="font-heading text-xl font-bold tracking-tight text-ink-950 md:text-2xl">{v}</p>
                <p className="mt-0.5 text-[11px] uppercase tracking-[0.15em] text-ink-400">{t}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 이달의 주의 병해충 */}
      <section>
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="eyebrow">Alert</p>
            <h2 className="page-title">이달의 주의 병해충</h2>
          </div>
          <Link to="/trends" className="text-[13px] text-ink-500 underline-offset-4 hover:text-ink-900 hover:underline">전체 동향 →</Link>
        </div>
        <div className="grid gap-px border border-ink-200 bg-ink-200 md:grid-cols-3">
          {alerts === null && <SkeletonCard />}
          {alerts?.map((a) => (
            <div key={a.pest} className="bg-white p-6">
              <div className="flex items-center justify-between">
                <span className="font-heading font-semibold text-ink-950">{a.pest}</span>
                <span className={`pulse-dot border px-2.5 py-1 text-[11px] font-medium tracking-wide ${LEVEL_STYLE[a.level]}`}>
                  {a.level}
                </span>
              </div>
              <p className="mt-1.5 text-xs text-ink-400"><i className="fa-solid fa-location-dot mr-1" />{a.region}</p>
              <p className="mt-4 text-sm leading-relaxed text-ink-600">{a.note}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 주요 기능 */}
      <section>
        <p className="eyebrow mb-2">Services</p>
        <h2 className="page-title mb-8">farmpick으로 할 수 있는 일</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { to: '/diagnosis', no: '01', title: 'AI 병해충 진단', desc: '생육 사진을 올리면 AI가 병해충과 방제법을 추천' },
            { to: '/trends', no: '02', title: '발생 동향', desc: '지역·작물별 발생 통계와 기상 연관 분석' },
            { to: '/myfarm', no: '03', title: '마이팜', desc: '농장·작물 등록과 진단 이력 타임라인 관리' },
            { to: '/chat', no: '04', title: 'AI 상담', desc: '병해충·방제 질문에 DB 근거 기반으로 답변' },
          ].map((f) => (
            <Link key={f.to} to={f.to} className="card-hover hairline group bg-white p-6">
              <p className="text-[11px] font-semibold tracking-[0.2em] text-forest-500">{f.no}</p>
              <h3 className="mt-4 font-heading text-lg font-semibold text-ink-950">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-500">{f.desc}</p>
              <p className="mt-5 text-xs text-ink-400 transition-colors group-hover:text-forest-600">
                바로가기 <i className="fa-solid fa-arrow-right ml-1" />
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* 병해충 도감 미리보기 */}
      <section>
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="eyebrow">Index</p>
            <h2 className="page-title">자주 발생하는 병해충</h2>
          </div>
          <Link to="/pests" className="text-[13px] text-ink-500 underline-offset-4 hover:text-ink-900 hover:underline">도감 전체보기 →</Link>
        </div>
        <div className="grid gap-px border border-ink-200 bg-ink-200 sm:grid-cols-2 lg:grid-cols-4">
          {pests === null
            ? <SkeletonCard />
            : pests.map((p) => (
                <Link key={p.id} to={`/pests?highlight=${p.id}`}
                  className="group bg-white p-6 transition-colors hover:bg-forest-50">
                  <div className="flex items-center justify-between">
                    <span className="font-heading font-semibold text-ink-950">{p.name}</span>
                    <span className={`px-2 py-0.5 text-[11px] tracking-wide ${
                      p.type === '병' ? 'bg-purple-50 text-purple-700' : 'bg-orange-50 text-orange-700'
                    }`}>{p.type}</span>
                  </div>
                  <p className="mt-3 line-clamp-2 text-[13px] leading-relaxed text-ink-500">{p.symptoms}</p>
                  <p className="mt-4 text-xs text-ink-400">{p.crops.join(' · ')}</p>
                </Link>
              ))}
        </div>
      </section>

      {/* CTA 밴드 */}
      <section className="furrows bg-ink-950 px-8 py-14 text-center text-white md:px-14">
        <p className="eyebrow !text-forest-300">Start Diagnosis</p>
        <h2 className="mt-4 font-heading text-2xl font-bold md:text-3xl">
          지금 농장의 잎사귀를 스캔해 보세요
        </h2>
        <Link to="/diagnosis" className="mt-8 inline-block bg-white px-8 py-3.5 text-sm font-semibold text-ink-950 hover:bg-forest-100">
          AI 진단 시작하기
        </Link>
      </section>
    </div>
  );
}
