import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { ErrorState, SkeletonCard } from '../components/Skeleton';

const ROLES = { farmer: '농가', company: '기업 담당자', admin: '관리자', admin_readonly: '테스트 관리자' };

export default function Admin() {
  const { user } = useAuth();
  const readonly = user?.role === 'admin_readonly';
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState(null);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const load = () => {
    setError('');
    Promise.all([api('/api/admin/stats').then(setStats), api('/api/admin/users').then(setUsers)])
      .catch((e) => setError(e.message));
  };
  useEffect(load, []);

  const changeRole = async (email, role) => {
    try {
      await api(`/api/admin/users/${email}/role`, { method: 'PATCH', body: { role } });
      setUsers((us) => us.map((u) => (u.email === email ? { ...u, role } : u)));
      setToast(`${email} → ${ROLES[role]} 변경 완료`);
    } catch (err) {
      setToast(err.message);
    }
    setTimeout(() => setToast(''), 3000);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <h1 className="font-heading text-2xl font-bold text-gray-900">관리자 대시보드</h1>
        {readonly && (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700" title="테스트 관리자는 데이터 변경이 불가능합니다">
            <i className="fa-solid fa-eye mr-1" />읽기 전용 모드
          </span>
        )}
      </div>

      {toast && <div className="fade-in rounded-lg bg-gray-900 px-4 py-3 text-sm text-white">{toast}</div>}
      {error && <ErrorState message={error} onRetry={load} />}

      {/* 지표 카드 */}
      {stats ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['수집 데이터', `${stats.collection.collected.toLocaleString()}건`, 'fa-database', '분석 성공률 ' + stats.collection.success_rate + '%'],
            ['총 진단 건수', `${stats.diagnosis.total.toLocaleString()}건`, 'fa-microscope', '평균 신뢰도 ' + Math.round(stats.diagnosis.avg_confidence * 100) + '%'],
            ['활성 사용자', `${stats.users.active}명`, 'fa-users', `농가 ${stats.users.farmers} · 기업 ${stats.users.companies}`],
            ['재진단률', `${stats.diagnosis.rediagnosis_rate}%`, 'fa-rotate', '낮을수록 진단 품질 양호'],
          ].map(([t, v, icon, sub]) => (
            <div key={t} className="rounded-xl border border-gray-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">{t}</p>
                <i className={`fa-solid ${icon} text-primary-500`} />
              </div>
              <p className="mt-2 font-heading text-2xl font-bold text-gray-900">{v}</p>
              <p className="mt-1 text-xs text-gray-400">{sub}</p>
            </div>
          ))}
        </div>
      ) : !error && <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard /></div>}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 다빈도 병해충 */}
        {stats && (
          <section className="rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="mb-4 font-heading font-semibold">다빈도 진단 병해충</h2>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={stats.ranking} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" fontSize={12} />
                <YAxis type="category" dataKey="name" fontSize={12} width={90} />
                <Tooltip />
                <Bar dataKey="count" fill="#16a34a" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </section>
        )}

        {/* 회원 관리 */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 font-heading font-semibold">회원 관리</h2>
          <div className="space-y-2">
            {users?.map((u) => (
              <div key={u.email} className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2.5">
                <div>
                  <p className="text-sm font-medium text-gray-800">{u.name}</p>
                  <p className="text-xs text-gray-400">{u.email}</p>
                </div>
                <select
                  value={u.role}
                  disabled={readonly}
                  title={readonly ? '읽기 전용 모드에서는 변경할 수 없습니다' : ''}
                  onChange={(e) => changeRole(u.email, e.target.value)}
                  className="rounded-lg border border-gray-300 px-2 py-1 text-xs disabled:cursor-not-allowed disabled:bg-gray-100"
                >
                  {Object.entries(ROLES).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
            )) || <SkeletonCard />}
          </div>
        </section>
      </div>

      {/* 병해충 콘텐츠 관리 */}
      <PestManager readonly={readonly} onToast={setToast} />
    </div>
  );
}

const EMPTY_PEST = { name: '', type: '병', crops: '', symptoms: '', cause: '', control: '', severity: '중', season: '' };

function PestManager({ readonly, onToast }) {
  const [pests, setPests] = useState([]);
  const [editing, setEditing] = useState(null); // null | 'new' | pest
  const [form, setForm] = useState(EMPTY_PEST);

  const load = () => api('/api/admin/pests').then(setPests).catch(() => {});
  useEffect(() => { load(); }, []);

  const openEdit = (pest) => {
    setEditing(pest === 'new' ? 'new' : pest);
    setForm(
      pest === 'new'
        ? EMPTY_PEST
        : { ...pest, crops: pest.crops.join(', ') }
    );
  };

  const save = async (e) => {
    e.preventDefault();
    const body = { ...form, crops: form.crops.split(',').map((s) => s.trim()).filter(Boolean) };
    try {
      if (editing === 'new') {
        await api('/api/admin/pests', { method: 'POST', body });
      } else {
        await api(`/api/admin/pests/${editing.id}`, { method: 'PUT', body });
      }
      onToast('저장되었습니다.');
      setEditing(null);
      load();
    } catch (err) {
      onToast(err.message);
    }
  };

  const remove = async (pest) => {
    if (!confirm(`'${pest.name}' 정보를 삭제할까요?`)) return;
    try {
      await api(`/api/admin/pests/${pest.id}`, { method: 'DELETE' });
      onToast('삭제되었습니다.');
      load();
    } catch (err) {
      onToast(err.message);
    }
  };

  return (
    <section className="rounded-2xl border border-forest-200 bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-heading font-semibold text-forest-900">병해충 콘텐츠 관리</h2>
        <button
          onClick={() => openEdit('new')}
          disabled={readonly}
          title={readonly ? '읽기 전용 모드에서는 추가할 수 없습니다' : ''}
          className="rounded-lg bg-forest-800 px-4 py-2 text-sm text-sprout-300 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <i className="fa-solid fa-plus mr-1" />병해충 추가
        </button>
      </div>

      {/* 편집 폼 */}
      {editing && (
        <form onSubmit={save} className="fade-in mb-5 grid gap-3 rounded-xl border border-forest-200 bg-forest-50/60 p-4 sm:grid-cols-2">
          <input required placeholder="병해충명" value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm">
            <option>병</option><option>충</option><option>정상</option>
          </select>
          <input placeholder="주요 작물 (쉼표 구분)" value={form.crops}
            onChange={(e) => setForm({ ...form, crops: e.target.value })}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          <div className="flex gap-2">
            <select value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })}
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm">
              {['상', '중', '경미', '없음'].map((s) => <option key={s}>{s}</option>)}
            </select>
            <input placeholder="발생기" value={form.season}
              onChange={(e) => setForm({ ...form, season: e.target.value })}
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <textarea placeholder="증상" value={form.symptoms} rows={2}
            onChange={(e) => setForm({ ...form, symptoms: e.target.value })}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm sm:col-span-2" />
          <textarea placeholder="발생 원인" value={form.cause} rows={2}
            onChange={(e) => setForm({ ...form, cause: e.target.value })}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          <textarea placeholder="방제 방법" value={form.control} rows={2}
            onChange={(e) => setForm({ ...form, control: e.target.value })}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          <div className="flex gap-2 sm:col-span-2">
            <button className="rounded-lg bg-forest-800 px-5 py-2 text-sm text-sprout-300">저장</button>
            <button type="button" onClick={() => setEditing(null)}
              className="rounded-lg border border-gray-300 px-5 py-2 text-sm">취소</button>
          </div>
        </form>
      )}

      {/* 목록 */}
      <div className="space-y-2">
        {pests.map((p) => (
          <div key={p.id} className="flex items-center justify-between rounded-lg border border-forest-100 px-3 py-2.5">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-forest-900">{p.name}</span>
              <span className="rounded-full bg-forest-50 px-2 py-0.5 text-xs text-forest-600">{p.type}</span>
              <span className="hidden text-xs text-gray-400 sm:inline">{p.crops.join(', ')}</span>
            </div>
            <div className="flex gap-1">
              <button onClick={() => openEdit(p)} disabled={readonly}
                title={readonly ? '읽기 전용 모드' : '수정'}
                className="rounded-lg px-2.5 py-1.5 text-xs text-forest-600 hover:bg-forest-50 disabled:cursor-not-allowed disabled:opacity-40">
                <i className="fa-solid fa-pen" />
              </button>
              <button onClick={() => remove(p)} disabled={readonly}
                title={readonly ? '읽기 전용 모드' : '삭제'}
                className="rounded-lg px-2.5 py-1.5 text-xs text-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40">
                <i className="fa-solid fa-trash-can" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
