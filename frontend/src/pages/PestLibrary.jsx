import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import { EmptyState, SkeletonCard } from '../components/Skeleton';

const TYPE_STYLE = {
  병: 'bg-purple-50 text-purple-700',
  충: 'bg-orange-50 text-orange-700',
  정상: 'bg-forest-100 text-forest-700',
};

export default function PestLibrary() {
  const [params] = useSearchParams();
  const [pests, setPests] = useState(null);
  const [crops, setCrops] = useState([]);
  const [type, setType] = useState('');
  const [crop, setCrop] = useState('');
  const [q, setQ] = useState(params.get('q') || '');
  const [selected, setSelected] = useState(null);
  const similar = selected
    ? (pests || []).filter(
        (p) => p.id !== selected.id && p.type === selected.type
          && p.crops.some((c) => selected.crops.includes(c))
      ).slice(0, 2)
    : [];

  useEffect(() => {
    api('/api/pests/crops').then(setCrops).catch(() => {});
  }, []);

  useEffect(() => {
    setQ(params.get('q') || '');
    const hi = params.get('highlight');
    if (hi) api(`/api/pests/${hi}`).then((p) => p.id && setSelected(p)).catch(() => {});
  }, [params]);

  useEffect(() => {
    const p = new URLSearchParams();
    if (type) p.set('type', type);
    if (crop) p.set('crop', crop);
    if (q) p.set('q', q);
    setPests(null);
    api(`/api/pests/?${p}`).then(setPests).catch(() => setPests([]));
  }, [type, crop, q]);

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Library</p>
        <h1 className="page-title">병해충 도감</h1>
        <p className="page-desc">병해충의 증상·원인·방제 정보를 검색하세요.</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex border border-ink-200 bg-white">
          {['', '병', '충'].map((t) => (
            <button key={t} onClick={() => setType(t)}
              className={`px-4 py-2 text-[13px] ${type === t ? 'bg-ink-900 text-white' : 'text-ink-500 hover:text-ink-900'}`}>
              {t || '전체'}
            </button>
          ))}
        </div>
        <select value={crop} onChange={(e) => setCrop(e.target.value)} className="input !w-auto">
          <option value="">전체 작물</option>
          {crops.map((c) => <option key={c}>{c}</option>)}
        </select>
        <div className="relative min-w-40 flex-1">
          <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-xs text-ink-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="병해충명·증상 검색"
            className="input !pl-8" />
        </div>
      </div>

      <div className="grid gap-px border border-ink-200 bg-ink-200 sm:grid-cols-2 lg:grid-cols-3">
        {pests === null && <div className="sm:col-span-2 lg:col-span-3 bg-white p-4"><SkeletonCard /></div>}
        {pests?.length === 0 && <div className="sm:col-span-2 lg:col-span-3 bg-white p-4"><EmptyState title="검색 결과가 없습니다" /></div>}
        {pests?.map((p) => (
          <button key={p.id} onClick={() => setSelected(p)}
            className="bg-white p-6 text-left transition-colors hover:bg-forest-50">
            <div className="flex items-center justify-between">
              <span className="font-heading font-semibold text-ink-950">{p.name}</span>
              <span className={`px-2 py-0.5 text-[11px] tracking-wide ${TYPE_STYLE[p.type]}`}>{p.type}</span>
            </div>
            <p className="mt-3 line-clamp-2 text-[13px] leading-relaxed text-ink-500">{p.symptoms}</p>
            <p className="mt-4 text-xs text-ink-400">{p.crops.join(' · ')} · 발생기 {p.season}</p>
          </button>
        ))}
      </div>

      {selected && (
        <div className="fade-in fixed inset-0 z-50 flex items-center justify-center bg-ink-950/50 p-4" onClick={() => setSelected(null)}>
          <div className="max-h-[80vh] w-full max-w-lg overflow-y-auto bg-white p-7" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <div>
                <p className="eyebrow">Pest Detail</p>
                <h2 className="mt-1 font-heading text-xl font-bold text-ink-950">{selected.name}</h2>
                <span className={`mt-1.5 inline-block px-2 py-0.5 text-[11px] ${TYPE_STYLE[selected.type]}`}>{selected.type}</span>
              </div>
              <button onClick={() => setSelected(null)} className="p-1 text-ink-400 hover:text-ink-900">
                <i className="fa-solid fa-xmark text-lg" />
              </button>
            </div>
            <dl className="mt-6 divide-y divide-ink-100 border-t border-ink-200 text-sm">
              {[['주요 작물', selected.crops.join(', '), 'fa-seedling'],
                ['증상', selected.symptoms, 'fa-eye'],
                ['발생 원인', selected.cause, 'fa-circle-question'],
                ['방제 방법', selected.control, 'fa-spray-can-sparkles'],
                ['심각도', selected.severity, 'fa-gauge-high'],
                ['주요 발생기', selected.season, 'fa-calendar-days']].map(([t, d, icon]) => (
                <div key={t} className="flex gap-4 py-3.5">
                  <i className={`fa-solid ${icon} mt-0.5 w-4 text-forest-600`} />
                  <div>
                    <dt className="text-[13px] font-semibold text-ink-900">{t}</dt>
                    <dd className="mt-1 text-ink-600">{d}</dd>
                  </div>
                </div>
              ))}
            </dl>

            {/* 방제 가이드 4단계 */}
            <div className="mt-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-ink-400">방제 가이드</p>
              <div className="mt-3 grid grid-cols-4 divide-x divide-ink-200 border border-ink-200 bg-ink-50 text-center">
                {[
                  ['1', '예방', '품종·환경 관리'],
                  ['2', '예찰', '정기 순찰·관찰'],
                  ['3', '방제', '적기 약제 살포'],
                  ['4', '사후', '병원 제거·기록'],
                ].map(([no, t, d]) => (
                  <div key={t} className="px-2 py-3">
                    <p className="text-[10px] font-bold tracking-widest text-forest-500">STEP {no}</p>
                    <p className="mt-1 text-[13px] font-semibold text-ink-900">{t}</p>
                    <p className="mt-0.5 text-[11px] text-ink-400">{d}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 유사 병해충 증상 비교 */}
            {similar.length > 0 && (
              <div className="mt-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-ink-400">
                  혼동 주의 — 유사 병해충 증상 비교
                </p>
                <div className="mt-3 divide-y divide-ink-100 border border-ink-200">
                  {[selected, ...similar].map((p, i) => (
                    <div key={p.id} className={`flex gap-3 px-4 py-3 ${i === 0 ? 'bg-forest-50' : ''}`}>
                      <span className={`mt-0.5 shrink-0 px-2 py-0.5 text-[10px] tracking-wide ${TYPE_STYLE[p.type]}`}>
                        {i === 0 ? '현재' : '유사'}
                      </span>
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold text-ink-900">{p.name}</p>
                        <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-ink-500">{p.symptoms}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
