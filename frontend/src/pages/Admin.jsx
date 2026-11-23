import { useCallback, useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { ErrorState, SkeletonCard } from '../components/Skeleton';
import { severityClass } from '../components/SpecimenArt';

const ROLES = { farmer: '농가', company: '기업 담당자', admin: '관리자', admin_readonly: '테스트 관리자' };
const RECORD_STATUS = ['정상', '경과 관찰', '방제 진행', '방제 완료'];

const TABS = [
  ['dash', '대시보드', 'fa-gauge-high'],
  ['pests', '병해충 DB', 'fa-bug'],
  ['manuals', '방제 매뉴얼', 'fa-book-medical'],
  ['records', '진단 이력', 'fa-clipboard-list'],
  ['farms', '농가 · 회원', 'fa-users'],
];

// ───────── CRUD 설정 ─────────
const PEST_CFG = {
  endpoint: '/api/admin/pests',
  label: '병해충',
  empty: { name: '', type: '병', crops: '', symptoms: '', cause: '', control: '', severity: '중', season: '' },
  toForm: (p) => ({ ...p, crops: p.crops.join(', ') }),
  toBody: (f) => ({ ...f, crops: f.crops.split(',').map((s) => s.trim()).filter(Boolean) }),
  fields: [
    ['name', '병해충명', 'text'], ['type', '구분', ['병', '충', '정상']],
    ['crops', '주요 작물 (쉼표 구분)', 'text'], ['severity', '위험도', ['상', '중', '경미', '없음']],
    ['season', '발생기', 'text'], ['symptoms', '증상', 'area'], ['cause', '발생 원인', 'area'], ['control', '방제 방법', 'area'],
  ],
  row: (p) => (
    <>
      <span className="font-semibold text-ink-950">{p.name}</span>
      <span className="rounded bg-ink-100 px-2 py-0.5 text-[11px] text-ink-600">{p.type}</span>
      <span className={`stamp ${severityClass(p.severity)} !rotate-0`}>{p.severity}</span>
      <span className="hidden truncate text-xs text-ink-400 md:inline">{p.crops.join(' · ')}</span>
    </>
  ),
};

const MANUAL_CFG = {
  endpoint: '/api/admin/manuals',
  label: '방제 매뉴얼',
  empty: { title: '', pest: '', crop: '', stage: '예방', steps: '' },
  toForm: (m) => ({ ...m, steps: m.steps.join('\n') }),
  toBody: (f) => ({ ...f, steps: f.steps.split('\n').map((s) => s.trim()).filter(Boolean) }),
  fields: [
    ['title', '매뉴얼 제목', 'text'], ['stage', '단계', ['예찰', '예방', '치료']],
    ['pest', '대상 병해충', 'text'], ['crop', '대상 작물', 'text'], ['steps', '방제 절차 (줄바꿈으로 구분)', 'area'],
  ],
  row: (m) => (
    <>
      <span className="rounded bg-chloro px-2 py-0.5 font-mono text-[10px] font-bold text-ink-950">{m.stage}</span>
      <span className="font-semibold text-ink-950">{m.title}</span>
      <span className="hidden text-xs text-ink-400 md:inline">{m.crop} · {m.pest} · {m.steps.length}단계</span>
    </>
  ),
};

export default function Admin() {
  const { user, isReadOnly } = useAuth();
  const [tab, setTab] = useState('dash');
  const [toast, setToast] = useState(null);

  const notify = useCallback((msg, kind = 'ok') => {
    setToast({ msg, kind });
    setTimeout(() => setToast(null), 3200);
  }, []);
  // 쓰기 요청 공통 실행기 — 읽기 전용 차단은 api 레이어(1차) + 백엔드 미들웨어(2차)에서 처리
  const mutate = useCallback(async (fn, okMsg) => {
    try {
      await fn();
      notify(okMsg);
      return true;
    } catch (err) {
      notify(err.message, err.readonly || err.status === 403 ? 'lock' : 'err');
      return false;
    }
  }, [notify]);

  return (
    <div className="space-y-8">
      {/* 콘솔 헤더 */}
      <div className="relative overflow-hidden rounded-[24px] bg-ink-950 text-white">
        {isReadOnly && <div className="hazard h-1.5" />}
        <div className="grid-paper-dark flex flex-wrap items-end justify-between gap-6 p-7 md:p-9">
          <div>
            <p className="tag-code !text-chloro">ADMIN CONSOLE · {isReadOnly ? 'READ-ONLY SESSION' : 'FULL ACCESS'}</p>
            <h1 className="mt-2 font-heading text-3xl font-bold">플랫폼 관리 콘솔</h1>
            <p className="mt-2 text-sm text-white/55">병해충 DB · 방제 매뉴얼 · 진단 이력 · 농가/회원 데이터를 통합 관리합니다.</p>
          </div>
          <div className={`flex items-center gap-3 rounded-2xl border px-4 py-3 ${isReadOnly ? 'border-harvest/50 bg-harvest/10' : 'border-chloro/40 bg-chloro/10'}`}>
            <i className={`fa-solid ${isReadOnly ? 'fa-lock text-harvest' : 'fa-shield-halved text-chloro'} text-lg`} />
            <div className="text-[12.5px]">
              <p className="font-semibold">{user?.name} · {isReadOnly ? '테스트 관리자' : '관리자'}</p>
              <p className="text-white/50">{isReadOnly ? '열람 가능 · 생성/수정/삭제 차단' : '.env 보안 키 인증 · CRUD 전체 권한'}</p>
            </div>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto border-t border-white/10 px-4 py-3 md:px-7">
          {TABS.map(([k, l, icon]) => (
            <button key={k} onClick={() => setTab(k)}
              className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-[13px] font-medium transition-colors ${
                tab === k ? 'bg-chloro text-ink-950' : 'text-white/60 hover:bg-white/10 hover:text-white'
              }`}>
              <i className={`fa-solid ${icon} text-xs`} />{l}
            </button>
          ))}
        </nav>
      </div>

      {toast && (
        <div className={`fade-in fixed left-1/2 top-24 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full px-5 py-3 text-sm text-white shadow-xl ${
          { ok: 'bg-forest-700', err: 'bg-blight', lock: 'bg-harvest' }[toast.kind]
        }`}>
          <i className={`fa-solid ${{ ok: 'fa-check', err: 'fa-triangle-exclamation', lock: 'fa-lock' }[toast.kind]}`} />{toast.msg}
        </div>
      )}

      <div key={tab} className="fade-in">
        {tab === 'dash' && <Dashboard />}
        {tab === 'pests' && <CrudPanel cfg={PEST_CFG} mutate={mutate} readonly={isReadOnly} />}
        {tab === 'manuals' && <CrudPanel cfg={MANUAL_CFG} mutate={mutate} readonly={isReadOnly} />}
        {tab === 'records' && <Records mutate={mutate} readonly={isReadOnly} />}
        {tab === 'farms' && <FarmsUsers mutate={mutate} readonly={isReadOnly} />}
      </div>
    </div>
  );
}

function useLoad(path) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const load = useCallback(() => {
    setError('');
    api(path).then(setData).catch((e) => setError(e.message));
  }, [path]);
  useEffect(load, [load]);
  return [data, error, load];
}

function Panel({ title, code, action, children }) {
  return (
    <section className="rounded-[20px] border border-ink-200 bg-sheet">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-dashed border-ink-300 px-6 py-4">
        <div>
          <p className="tag-code">{code}</p>
          <h2 className="font-heading text-lg font-bold text-ink-950">{title}</h2>
        </div>
        {action}
      </div>
      <div className="p-6">{children}</div>
    </section>
  );
}

function LockHint({ readonly }) {
  return readonly ? <i className="fa-solid fa-lock ml-1.5 text-[10px] opacity-70" title="읽기 전용 — 요청이 차단됩니다" /> : null;
}

function Dashboard() {
  const [stats, error, load] = useLoad('/api/admin/stats');
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!stats) return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard /></div>;
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ['수집 데이터', stats.collection.collected.toLocaleString(), '건', 'fa-database', `분석 성공률 ${stats.collection.success_rate}%`],
          ['누적 진단', stats.diagnosis.total.toLocaleString(), '건', 'fa-microscope', `평균 신뢰도 ${Math.round(stats.diagnosis.avg_confidence * 100)}%`],
          ['활성 사용자', stats.users.active, '명', 'fa-users', `농가 ${stats.users.farmers} · 기업 ${stats.users.companies}`],
          ['재진단률', stats.diagnosis.rediagnosis_rate, '%', 'fa-rotate', '낮을수록 진단 품질 양호'],
        ].map(([t, v, u, icon, sub]) => (
          <div key={t} className="specimen p-5">
            <div className="flex items-center justify-between">
              <p className="tag-code">{t}</p>
              <i className={`fa-solid ${icon} text-forest-600`} />
            </div>
            <p className="mt-3 font-heading text-3xl font-bold text-ink-950">{v}<span className="ml-0.5 text-base text-ink-400">{u}</span></p>
            <p className="mt-1 text-xs text-ink-500">{sub}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Panel title="다빈도 진단 병해충" code="RANKING · TOP 5">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={stats.ranking} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#dcd4c2" />
              <XAxis type="number" fontSize={12} stroke="#998d76" />
              <YAxis type="category" dataKey="name" fontSize={12} width={90} stroke="#998d76" />
              <Tooltip />
              <Bar dataKey="count" fill="#2c6d28" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>
        <Panel title="관리 데이터 현황" code="INVENTORY">
          <ul className="divide-y divide-dashed divide-ink-200">
            {[
              ['병해충 DB', stats.counts.pests, 'fa-bug'], ['방제 매뉴얼', stats.counts.manuals, 'fa-book-medical'],
              ['진단 이력', stats.counts.records, 'fa-clipboard-list'], ['등록 농가', stats.counts.farms, 'fa-warehouse'],
              ['회원 계정', stats.counts.users, 'fa-user'],
            ].map(([t, n, icon]) => (
              <li key={t} className="flex items-center justify-between py-3 text-sm">
                <span className="text-ink-700"><i className={`fa-solid ${icon} mr-2 w-4 text-forest-600`} />{t}</span>
                <span className="font-mono font-semibold text-ink-950">{n}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}

function CrudPanel({ cfg, mutate, readonly }) {
  const [items, error, load] = useLoad(cfg.endpoint);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(cfg.empty);

  const open = (item) => {
    setEditing(item);
    setForm(item === 'new' ? cfg.empty : cfg.toForm(item));
  };

  const save = async (e) => {
    e.preventDefault();
    const isNew = editing === 'new';
    const ok = await mutate(
      () => api(isNew ? cfg.endpoint : `${cfg.endpoint}/${editing.id}`, { method: isNew ? 'POST' : 'PUT', body: cfg.toBody(form) }),
      `${cfg.label} ${isNew ? '등록' : '수정'} 완료`,
    );
    if (ok) { setEditing(null); load(); }
  };

  const remove = async (item) => {
    if (!readonly && !confirm(`'${item.name || item.title}' 항목을 삭제할까요?`)) return;
    if (await mutate(() => api(`${cfg.endpoint}/${item.id}`, { method: 'DELETE' }), `${cfg.label} 삭제 완료`)) load();
  };

  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <Panel title={`${cfg.label} 관리`} code={`${items?.length ?? 0} RECORDS`}
      action={
        <button onClick={() => open('new')} className="btn-primary rounded-full px-4 py-2 text-[13px]">
          <i className="fa-solid fa-plus mr-1.5" />{cfg.label} 추가<LockHint readonly={readonly} />
        </button>
      }>
      {editing && (
        <form onSubmit={save} className="fade-in mb-6 grid gap-3 rounded-2xl border border-forest-200 bg-forest-50/60 p-5 sm:grid-cols-2">
          <p className="tag-code sm:col-span-2">{editing === 'new' ? 'NEW ENTRY' : `EDIT · ID ${editing.id}`}{readonly && ' · 읽기 전용 (저장 불가)'}</p>
          {cfg.fields.map(([key, ph, type]) => (
            <label key={key} className={type === 'area' ? 'sm:col-span-2' : ''}>
              <span className="mb-1 block text-[11.5px] font-medium text-ink-500">{ph}</span>
              {Array.isArray(type) ? (
                <select value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className="input">
                  {type.map((o) => <option key={o}>{o}</option>)}
                </select>
              ) : type === 'area' ? (
                <textarea rows={key === 'steps' ? 4 : 2} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className="input" />
              ) : (
                <input required={key === 'name' || key === 'title'} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className="input" />
              )}
            </label>
          ))}
          <div className="flex gap-2 sm:col-span-2">
            <button className="btn-accent rounded-full px-6 py-2 text-sm">저장<LockHint readonly={readonly} /></button>
            <button type="button" onClick={() => setEditing(null)} className="btn-ghost rounded-full px-6 py-2 text-sm">닫기</button>
          </div>
        </form>
      )}
      {!items ? <SkeletonCard /> : (
        <ul className="divide-y divide-dashed divide-ink-200">
          {items.map((it) => (
            <li key={it.id} className="flex items-center justify-between gap-3 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="tag-code w-10 shrink-0">#{String(it.id).padStart(3, '0')}</span>
                {cfg.row(it)}
              </div>
              <RowActions readonly={readonly} onEdit={() => open(it)} onDelete={() => remove(it)} />
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

function RowActions({ readonly, onEdit, onDelete }) {
  return (
    <div className="flex shrink-0 gap-1">
      {onEdit && (
        <button onClick={onEdit} title={readonly ? '상세 보기 (읽기 전용)' : '수정'}
          className="flex h-8 w-8 items-center justify-center rounded-full text-xs text-forest-700 hover:bg-forest-50">
          <i className={`fa-solid ${readonly ? 'fa-eye' : 'fa-pen'}`} />
        </button>
      )}
      <button onClick={onDelete} title={readonly ? '삭제 (읽기 전용 — 차단됨)' : '삭제'}
        className={`flex h-8 w-8 items-center justify-center rounded-full text-xs hover:bg-[#fbebe6] ${readonly ? 'text-ink-300' : 'text-blight'}`}>
        <i className={`fa-solid ${readonly ? 'fa-lock' : 'fa-trash-can'}`} />
      </button>
    </div>
  );
}

function Records({ mutate, readonly }) {
  const [records, error, load] = useLoad('/api/admin/records');
  if (error) return <ErrorState message={error} onRetry={load} />;

  const setStatus = async (r, status) => {
    if (await mutate(() => api(`/api/admin/records/${r.id}`, { method: 'PATCH', body: { status } }), `진단 #${r.id} 상태 → ${status}`)) load();
  };
  const remove = async (r) => {
    if (!readonly && !confirm(`진단 이력 #${r.id} 를 삭제할까요?`)) return;
    if (await mutate(() => api(`/api/admin/records/${r.id}`, { method: 'DELETE' }), `진단 이력 #${r.id} 삭제 완료`)) load();
  };

  return (
    <Panel title="진단 이력 관리" code={`${records?.length ?? 0} DIAGNOSES`}>
      {!records ? <SkeletonCard /> : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="text-left">
                {['ID', '진단일', '농장 · 작물', '진단 결과', '위험도', '처리 상태', ''].map((h) => (
                  <th key={h} className="tag-code border-b border-ink-200 pb-3 font-normal">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-dashed divide-ink-200">
              {records.map((r) => (
                <tr key={r.id}>
                  <td className="py-3 font-mono text-xs text-ink-400">#{r.id}</td>
                  <td className="py-3 font-mono text-xs text-ink-700">{r.date}</td>
                  <td className="py-3 text-ink-700">{r.farm}<span className="text-ink-400"> · {r.crop}</span></td>
                  <td className="py-3 font-semibold text-ink-950">{r.pest}</td>
                  <td className="py-3"><span className={`stamp ${severityClass(r.severity)} !rotate-0`}>{r.severity}</span></td>
                  <td className="py-3">
                    <select value={r.status} onChange={(e) => setStatus(r, e.target.value)}
                      className="rounded-full border border-ink-200 bg-white px-3 py-1 text-xs">
                      {[...new Set([r.status, ...RECORD_STATUS])].map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="py-3"><RowActions readonly={readonly} onDelete={() => remove(r)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}

function FarmsUsers({ mutate, readonly }) {
  const [farms, fErr, loadFarms] = useLoad('/api/admin/farms');
  const [users, uErr, loadUsers] = useLoad('/api/admin/users');
  if (fErr || uErr) return <ErrorState message={fErr || uErr} onRetry={() => { loadFarms(); loadUsers(); }} />;

  const removeFarm = async (f) => {
    if (!readonly && !confirm(`'${f.name}' 농장과 진단 이력을 삭제할까요?`)) return;
    if (await mutate(() => api(`/api/admin/farms/${f.id}`, { method: 'DELETE' }), `${f.name} 삭제 완료`)) loadFarms();
  };
  const changeRole = async (u, role) => {
    if (await mutate(() => api(`/api/admin/users/${encodeURIComponent(u.email)}/role`, { method: 'PATCH', body: { role } }), `${u.name} → ${ROLES[role]}`)) loadUsers();
  };
  const removeUser = async (u) => {
    if (!readonly && !confirm(`'${u.email}' 회원을 삭제할까요?`)) return;
    if (await mutate(() => api(`/api/admin/users/${encodeURIComponent(u.email)}`, { method: 'DELETE' }), `${u.email} 삭제 완료`)) loadUsers();
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Panel title="등록 농가" code={`${farms?.length ?? 0} FARMS`}>
        {!farms ? <SkeletonCard /> : (
          <ul className="space-y-3">
            {farms.map((f) => (
              <li key={f.id} className="flex items-center justify-between gap-3 rounded-xl border border-ink-200 bg-white p-4">
                <div>
                  <p className="font-semibold text-ink-950"><i className="fa-solid fa-warehouse mr-2 text-forest-600" />{f.name}</p>
                  <p className="mt-0.5 text-xs text-ink-500">{f.crop} · {f.area} · {f.location} · 진단 {f.record_count}건</p>
                </div>
                <RowActions readonly={readonly} onDelete={() => removeFarm(f)} />
              </li>
            ))}
          </ul>
        )}
      </Panel>
      <Panel title="회원 · 권한" code={`${users?.length ?? 0} ACCOUNTS`}>
        {!users ? <SkeletonCard /> : (
          <ul className="divide-y divide-dashed divide-ink-200">
            {users.map((u) => (
              <li key={u.email} className="flex items-center justify-between gap-3 py-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink-900 text-xs font-bold text-white">{u.name.slice(0, 1)}</span>
                  <div>
                    <p className="text-sm font-semibold text-ink-950">{u.name}</p>
                    <p className="font-mono text-[11px] text-ink-400">{u.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <select value={u.role} onChange={(e) => changeRole(u, e.target.value)}
                    className="rounded-full border border-ink-200 bg-white px-3 py-1 text-xs">
                    {Object.entries(ROLES).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                  <RowActions readonly={readonly} onDelete={() => removeUser(u)} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
