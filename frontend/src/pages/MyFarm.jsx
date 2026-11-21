import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { EmptyState, ErrorState, SkeletonCard } from '../components/Skeleton';

const STATUS_STYLE = {
  정상: 'bg-forest-100 text-forest-700',
  '방제 완료': 'bg-blue-50 text-blue-700',
  '방제 진행': 'bg-amber-50 text-amber-700',
  '경과 관찰': 'bg-ink-100 text-ink-600',
};

export default function MyFarm() {
  const [farms, setFarms] = useState(null);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', crop: '토마토', area: '', location: '' });
  const [crops, setCrops] = useState([]);

  const load = () => {
    setError('');
    api('/api/farms/').then(setFarms).catch((e) => setError(e.message));
  };
  useEffect(() => {
    load();
    api('/api/pests/crops').then(setCrops).catch(() => {});
  }, []);

  const create = async (e) => {
    e.preventDefault();
    try {
      await api('/api/farms/', { method: 'POST', body: form });
      setShowForm(false);
      setForm({ name: '', crop: '토마토', area: '', location: '' });
      load();
    } catch (err) { setError(err.message); }
  };

  const remove = async (id) => {
    if (!confirm('이 농장을 삭제할까요?')) return;
    try {
      await api(`/api/farms/${id}`, { method: 'DELETE' });
      load();
    } catch (err) { setError(err.message); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <p className="eyebrow">My Farm</p>
          <h1 className="page-title">마이팜</h1>
          <p className="page-desc">농장·작물 관리와 진단 이력 타임라인을 확인하세요.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary rounded-md px-4 py-2 text-sm">
          <i className="fa-solid fa-plus mr-1" />농장 등록
        </button>
      </div>

      {showForm && (
        <form onSubmit={create} className="fade-in grid gap-3 border border-ink-200 bg-white p-5 sm:grid-cols-4">
          <input required placeholder="농장명" value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" />
          <select value={form.crop} onChange={(e) => setForm({ ...form, crop: e.target.value })} className="input">
            {crops.map((c) => <option key={c}>{c}</option>)}
          </select>
          <input placeholder="면적 (예: 1,320㎡)" value={form.area}
            onChange={(e) => setForm({ ...form, area: e.target.value })} className="input" />
          <input placeholder="지역 (예: 충남 논산)" value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })} className="input" />
          <button className="btn-primary rounded-md py-2.5 text-sm sm:col-span-4">등록</button>
        </form>
      )}

      {error && <ErrorState message={error} onRetry={load} />}
      {farms === null && !error && (
        <div className="grid gap-4 md:grid-cols-2"><SkeletonCard /><SkeletonCard /></div>
      )}
      {farms?.length === 0 && (
        <EmptyState icon="fa-warehouse" title="등록된 농장이 없습니다" desc="우측 상단 '농장 등록'으로 첫 농장을 추가해 보세요." />
      )}

      <div className="grid gap-5 md:grid-cols-2">
        {farms?.map((farm) => (
          <div key={farm.id} className="card-hover hairline bg-white p-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-heading font-semibold text-ink-950">{farm.name}</h2>
                <p className="mt-1 text-sm text-ink-500">
                  <i className="fa-solid fa-seedling mr-1 text-forest-500" />{farm.crop} · {farm.area} · {farm.location}
                </p>
              </div>
              <button onClick={() => remove(farm.id)} className="text-ink-300 hover:text-red-500" aria-label="삭제">
                <i className="fa-solid fa-trash-can text-sm" />
              </button>
            </div>
            <div className="mt-5 border-l border-forest-200 pl-5">
              {farm.records.length === 0 && <p className="text-sm text-ink-400">진단 이력이 없습니다.</p>}
              {farm.records.map((r) => (
                <div key={r.id} className="relative mb-4 last:mb-0">
                  <span className="absolute -left-[22.5px] top-1.5 h-2 w-2 rounded-full bg-forest-500" />
                  <p className="text-[11px] tracking-wide text-ink-400">{r.date}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-sm font-medium text-ink-900">{r.pest}</span>
                    <span className={`px-2 py-0.5 text-[11px] ${STATUS_STYLE[r.status] || 'bg-ink-100'}`}>
                      {r.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
