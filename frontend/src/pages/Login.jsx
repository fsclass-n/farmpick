import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

const ROLE_ICON = { farmer: 'fa-tractor', company: 'fa-building' };
const label = 'mb-1.5 block font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em] text-ink-500';

export default function Login() {
  const { login, adminLogin, testAdminLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [tab, setTab] = useState('user');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secret, setSecret] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState('');
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    api('/api/auth/test-accounts').then(setAccounts).catch(() => {});
  }, []);

  const pwValid = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/.test(password);

  const run = async (key, fn) => {
    setError('');
    setLoading(key);
    try {
      const u = await fn();
      const admin = ['admin', 'admin_readonly'].includes(u.role);
      navigate(admin ? '/admin' : location.state?.from || '/', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading('');
    }
  };

  const switchTab = (t) => { setTab(t); setError(''); };

  return (
    <div>
      <Link to="/" className="flex items-center gap-2 font-heading text-xl font-bold tracking-tight text-ink-900 lg:hidden">
        <i className="fa-solid fa-leaf text-forest-600" />farmpick
      </Link>

      <p className="tag-code mt-10 lg:mt-0">ACCESS · FIELD LAB</p>
      <h2 className="mt-2 font-heading text-[30px] font-bold tracking-tight text-ink-950">로그인</h2>
      <p className="mt-1.5 text-sm text-ink-500">
        계정이 없으신가요?{' '}
        <Link to="/signup" className="font-medium text-forest-700 underline-offset-4 hover:underline">회원가입</Link>
      </p>

      <div className="seg mt-8 w-full" role="tablist">
        {[['user', '농가 · 기업', 'fa-user'], ['admin', '관리자', 'fa-shield-halved']].map(([k, l, icon]) => (
          <button key={k} role="tab" aria-selected={tab === k} onClick={() => switchTab(k)} className="flex-1">
            <i className={`fa-solid ${icon} mr-1.5 text-xs`} />{l}
          </button>
        ))}
      </div>

      {error && <p className="fade-in mt-5 rounded-lg border border-blight/30 bg-[#fbebe6] px-3 py-2.5 text-sm text-blight">{error}</p>}

      {tab === 'user' ? (
        <div className="fade-in">
          <form onSubmit={(e) => { e.preventDefault(); run('pw', () => login(email, password)); }} className="mt-6 space-y-5">
            <div>
              <label className={label}>이메일</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="input" placeholder="you@example.com" autoComplete="email" />
            </div>
            <div>
              <label className={label}>비밀번호</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required
                  className="input pr-10" placeholder="영문 대소문자·숫자·특수문자 8자리 이상" autoComplete="current-password" />
                <button type="button" onClick={() => setShowPw(!showPw)} aria-label="비밀번호 표시"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700">
                  <i className={`fa-solid ${showPw ? 'fa-eye-slash' : 'fa-eye'} text-sm`} />
                </button>
              </div>
              {password && !pwValid && <p className="mt-1.5 text-xs text-blight">영문 대소문자, 숫자, 특수문자 조합 8자리 이상이어야 합니다.</p>}
            </div>
            <button type="submit" disabled={!!loading} className="btn-primary w-full rounded-full py-3 text-sm">
              {loading === 'pw' ? '로그인 중…' : '로그인'}
            </button>
          </form>

          <p className="tag-code mt-9 mb-3">QUICK START · 테스트 계정</p>
          <div className="grid grid-cols-2 gap-3">
            {accounts.map((acc) => (
              <button key={acc.email} onClick={() => run(acc.email, () => login(acc.email, acc.password))} disabled={!!loading}
                className="specimen p-4 text-left">
                <i className={`fa-solid ${ROLE_ICON[acc.role] || 'fa-user'} text-forest-600`} />
                <span className="mt-2 block text-[13px] font-semibold text-ink-900">{acc.role_label}</span>
                <span className="block truncate font-mono text-[10.5px] text-ink-400">{acc.email}</span>
              </button>
            ))}
            {accounts.length === 0 && <p className="col-span-2 text-xs text-ink-400">테스트 계정을 불러오는 중…</p>}
          </div>
        </div>
      ) : (
        <div className="fade-in">
          {/* 실제 관리자 — .env 보안 키 */}
          <form onSubmit={(e) => { e.preventDefault(); run('key', () => adminLogin(secret)); }}
            className="mt-6 rounded-2xl border border-ink-200 bg-sheet p-5">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-forest-600 text-white">
                <i className="fa-solid fa-key text-xs" />
              </span>
              <div>
                <p className="text-sm font-semibold text-ink-950">관리자 보안 키 인증</p>
                <p className="text-[11.5px] text-ink-500">서버 .env 의 ADMIN_SECRET_KEY · 전체 CRUD 권한</p>
              </div>
            </div>
            <input type="password" value={secret} onChange={(e) => setSecret(e.target.value)} required
              className="input mt-4 font-mono" placeholder="Admin Secret Key" autoComplete="off" />
            <button type="submit" disabled={!!loading || !secret} className="btn-accent mt-3 w-full rounded-full py-3 text-sm">
              {loading === 'key' ? '인증 중…' : '보안 키로 관리자 로그인'}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <span className="h-px flex-1 bg-ink-200" /><span className="tag-code">OR</span><span className="h-px flex-1 bg-ink-200" />
          </div>

          {/* 테스트 관리자 — 읽기 전용 */}
          <button onClick={() => run('test', testAdminLogin)} disabled={!!loading}
            className="group w-full overflow-hidden rounded-2xl border border-harvest/40 bg-[#fff8e8] text-left transition-colors hover:border-harvest">
            <div className="hazard h-1" />
            <div className="flex items-center gap-3 p-5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-harvest text-white">
                <i className="fa-solid fa-eye text-sm" />
              </span>
              <span className="flex-1">
                <span className="block text-sm font-semibold text-ink-950">
                  {loading === 'test' ? '진입 중…' : '테스트 관리자 로그인'}
                </span>
                <span className="block text-[11.5px] text-ink-500">관리자 화면 열람 전용 · 생성/수정/삭제 차단</span>
              </span>
              <span className="stamp sev-mid">READ ONLY</span>
            </div>
          </button>
        </div>
      )}

      <div className="mt-9">
        <div className="flex items-center gap-3">
          <span className="h-px flex-1 bg-ink-200" />
          <span className="text-[11px] tracking-wide text-ink-400">소셜 계정 (준비 중)</span>
          <span className="h-px flex-1 bg-ink-200" />
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <button className="btn-ghost rounded-full py-2.5" title="Google 로그인 (준비 중)"><i className="fa-brands fa-google" /></button>
          <button className="btn-ghost rounded-full py-2.5 font-bold text-green-600" title="Naver 로그인 (준비 중)">N</button>
          <button className="btn-ghost rounded-full py-2.5" title="Kakao 로그인 (준비 중)"><i className="fa-solid fa-comment text-yellow-500" /></button>
        </div>
      </div>
    </div>
  );
}
