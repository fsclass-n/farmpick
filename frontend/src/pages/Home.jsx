import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { SkeletonCard } from '../components/Skeleton';

const LEVEL_STYLE = {
  경보: 'bg-red-100 text-red-700 border-red-200',
  주의: 'bg-amber-100 text-amber-700 border-amber-200',
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
    <div className="space-y-16">
      {/* Hero — 딥 포레스트 + 밭 이랑 + 플로팅 리프 */}
      <section className="furrows relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-forest-950 via-forest-800 to-forest-600 px-8 py-16 text-white md:px-14 md:py-20">
        <i className="fa-solid fa-leaf float-slow absolute right-[8%] top-[15%] text-6xl text-sprout-400/20" />
        <i className="fa-solid fa-wheat-awn float-slower absolute right-[22%] bottom-[20%] text-7xl text-sprout-400/10" />
        <i className="fa-solid fa-bug float-slow absolute left-[60%] top-[60%] text-5xl text-white/5" />

        <span className="glass-dark inline-block rounded-full px-4 py-1.5 text-xs font-medium text-sprout-300">
          <i className="fa-solid fa-microscope mr-1.5" />AI 이미지 진단 · 발생 동향 · 방제 추천
        </span>
        <h1 className="mt-6 max-w-2xl font-heading text-3xl font-bold leading-tight md:text-5xl">
          잎사귀 속 병해충을<br />
          <span className="text-sprout-300">AI가 먼저 찾아냅니다</span>
        </h1>
        <p className="mt-5 max-w-xl leading-relaxed text-forest-200">
          생육 사진 한 장이면 충분합니다. farmpick은 Gemini Vision으로 병해충을 진단하고,
          공공 데이터로 지역별 발생 동향을 분석해 맞춤 방제법을 골라드립니다.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/diagnosis" className="rounded-full bg-sprout-500 px-7 py-3 font-bold text-forest-950 shadow-lg shadow-sprout-500/30 hover:bg-sprout-400">
            <i className="fa-solid fa-camera mr-2" />지금 진단하기
          </Link>
          <Link to="/trends" className="rounded-full border border-white/25 px-7 py-3 font-medium text-white hover:bg-white/10">
            발생 동향 보기
          </Link>
        </div>
        {/* 스탯 스트립 */}
        {totalOccurrence && (
          <div className="mt-12 flex flex-wrap gap-8 border-t border-white/10 pt-6">
            {[
              ['올해 발생 신고', `${totalOccurrence.toLocaleString()}건`],
              ['진단 가능 병해충', `${pests?.length ?? 9}+종`],
              ['AI 평균 신뢰도', '87%'],
            ].map(([t, v]) => (
              <div key={t}>
                <p className="font-heading text-2xl font-bold text-sprout-300">{v}</p>
                <p className="mt-0.5 text-xs text-white/50">{t}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 이달의 주의 병해충 */}
      <section>
        <div className="leaf-divider mb-6 text-sm font-semibold uppercase tracking-widest">
          이달의 주의 병해충
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {alerts === null && <><SkeletonCard /><SkeletonCard /><SkeletonCard /></>}
          {alerts?.map((a, i) => (
            <div key={a.pest} className={`organic-card border bg-white p-5 ${i % 2 ? 'organic-card-alt' : ''} border-forest-200`}>
              <div className="flex items-center justify-between">
                <span className="font-heading font-semibold text-forest-900">{a.pest}</span>
                <span className={`pulse-dot rounded-full border px-2.5 py-1 text-xs font-medium ${LEVEL_STYLE[a.level]}`}>
                  {a.level}
                </span>
              </div>
              <p className="mt-1 text-xs text-forest-500"><i className="fa-solid fa-location-dot mr-1" />{a.region}</p>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">{a.note}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 주요 기능 */}
      <section>
        <div className="leaf-divider mb-6 text-sm font-semibold uppercase tracking-widest">
          farmpick으로 할 수 있는 일
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { to: '/diagnosis', icon: 'fa-microscope', title: 'AI 병해충 진단', desc: '생육 사진을 올리면 AI가 병해충과 방제법을 추천', accent: true },
            { to: '/trends', icon: 'fa-chart-line', title: '발생 동향', desc: '지역·작물별 발생 통계와 기상 연관 분석' },
            { to: '/myfarm', icon: 'fa-warehouse', title: '마이팜', desc: '농장·작물 등록과 진단 이력 타임라인 관리' },
            { to: '/chat', icon: 'fa-robot', title: 'AI 상담', desc: '병해충·방제 질문에 DB 근거 기반으로 답변' },
          ].map((f) => (
            <Link key={f.to} to={f.to}
              className={`group rounded-2xl p-6 transition-all hover:-translate-y-1 hover:shadow-lg ${
                f.accent
                  ? 'furrows bg-forest-800 text-white'
                  : 'border border-forest-200 bg-white text-forest-900 hover:border-forest-400'
              }`}>
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                f.accent ? 'bg-sprout-500/20 text-sprout-300' : 'bg-forest-100 text-forest-600 group-hover:bg-forest-700 group-hover:text-sprout-300'
              }`}>
                <i className={`fa-solid ${f.icon} text-lg`} />
              </div>
              <h3 className="mt-4 font-heading font-semibold">{f.title}</h3>
              <p className={`mt-1.5 text-sm leading-relaxed ${f.accent ? 'text-forest-200' : 'text-gray-500'}`}>{f.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* 병해충 도감 미리보기 */}
      <section>
        <div className="mb-6 flex items-end justify-between">
          <div className="leaf-divider flex-1 text-sm font-semibold uppercase tracking-widest">
            자주 발생하는 병해충
          </div>
          <Link to="/pests" className="ml-4 shrink-0 text-sm text-forest-600 hover:underline">도감 전체보기 →</Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {pests === null
            ? <><SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard /></>
            : pests.map((p) => (
                <Link key={p.id} to={`/pests?highlight=${p.id}`}
                  className="organic-card border border-forest-200 bg-white p-5 hover:border-forest-400 hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="font-heading font-semibold text-forest-900">{p.name}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs ${p.type === '병' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'}`}>
                      {p.type}
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-gray-500">{p.symptoms}</p>
                  <p className="mt-3 text-xs text-forest-500"><i className="fa-solid fa-seedling mr-1" />{p.crops.join(', ')}</p>
                </Link>
              ))}
        </div>
      </section>
    </div>
  );
}
