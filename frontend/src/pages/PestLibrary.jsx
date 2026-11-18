import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import { EmptyState, SkeletonCard } from '../components/Skeleton';

const TYPE_STYLE = {
  병: 'bg-purple-100 text-purple-700',
  충: 'bg-orange-100 text-orange-700',
  정상: 'bg-forest-100 text-forest-700',
};

export default function PestLibrary() {
  const [params, setParams] = useSearchParams();
  const [pests, setPests] = useState(null);
  const [crops, setCrops] = useState([]);
  const [type, setType] = useState('');
  const [crop, setCrop] = useState('');
  const [q, setQ] = useState(params.get('q') || '');
  const [selected, setSelected] = useState(null);

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
        <h1 className="font-heading text-2xl font-bold text-forest-950">병해충 도감</h1>
        <p className="mt-1 text-sm text-gray-500">병해충의 증상·원인·방제 정보를 검색하세요.</p>
      </div>

      {/* 필터 */}
      <div className="flex flex-wrap gap-3">
        <div className="flex gap-1 rounded-full border border-forest-200 bg-white p-1">
          {['', '병', '충'].map((t) => (
            <button key={t} onClick={() => setType(t)}
              className={`rounded-full px-4 py-1.5 text-sm ${type === t ? 'bg-forest-800 text-sprout-300' : 'text-forest-800/60 hover:bg-forest-50'}`}>
              {t || '전체'}
            </button>
          ))}
        </div>
        <select value={crop} onChange={(e) => setCrop(e.target.value)}
          className="rounded-full border border-forest-200 bg-white px-4 py-1.5 text-sm">
          <option value="">전체 작물</option>
          {crops.map((c) => <option key={c}>{c}</option>)}
        </select>
        <div className="relative flex-1 min-w-40">
          <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-forest-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="병해충명·증상 검색"
            className="w-full rounded-full border border-forest-200 bg-white py-1.5 pl-9 pr-4 text-sm focus:border-forest-500 focus:outline-none" />
        </div>
      </div>

      {/* 목록 */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {pests === null && <><SkeletonCard /><SkeletonCard /><SkeletonCard /></>}
        {pests?.length === 0 && <div className="sm:col-span-2 lg:col-span-3"><EmptyState title="검색 결과가 없습니다" /></div>}
        {pests?.map((p, i) => (
          <button key={p.id} onClick={() => setSelected(p)}
            className={`${i % 2 ? 'organic-card-alt' : 'organic-card'} border border-forest-200 bg-white p-5 text-left hover:border-forest-400 hover:shadow-md`}>
            <div className="flex items-center justify-between">
              <span className="font-heading font-semibold text-forest-900">{p.name}</span>
              <span className={`rounded-full px-2 py-0.5 text-xs ${TYPE_STYLE[p.type]}`}>{p.type}</span>
            </div>
            <p className="mt-2 line-clamp-2 text-sm text-gray-500">{p.symptoms}</p>
            <p className="mt-3 text-xs text-forest-500">{p.crops.join(' · ')} · 발생기 {p.season}</p>
          </button>
        ))}
      </div>

      {/* 상세 모달 */}
      {selected && (
        <div className="fade-in fixed inset-0 z-50 flex items-center justify-center bg-forest-950/50 p-4" onClick={() => setSelected(null)}>
          <div className="organic-card max-h-[80vh] w-full max-w-lg overflow-y-auto bg-white p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-heading text-xl font-bold text-forest-900">{selected.name}</h2>
                <span className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs ${TYPE_STYLE[selected.type]}`}>{selected.type}</span>
              </div>
              <button onClick={() => setSelected(null)} className="p-1 text-gray-400 hover:text-forest-800">
                <i className="fa-solid fa-xmark text-xl" />
              </button>
            </div>
            <dl className="mt-5 space-y-4 text-sm">
              {[['주요 작물', selected.crops.join(', '), 'fa-seedling'],
                ['증상', selected.symptoms, 'fa-eye'],
                ['발생 원인', selected.cause, 'fa-circle-question'],
                ['방제 방법', selected.control, 'fa-spray-can-sparkles'],
                ['심각도', selected.severity, 'fa-gauge-high'],
                ['주요 발생기', selected.season, 'fa-calendar-days']].map(([t, d, icon]) => (
                <div key={t} className="flex gap-3">
                  <i className={`fa-solid ${icon} mt-0.5 w-4 text-forest-500`} />
                  <div>
                    <dt className="font-semibold text-forest-900">{t}</dt>
                    <dd className="mt-0.5 text-gray-600">{d}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </div>
        </div>
      )}
    </div>
  );
}
