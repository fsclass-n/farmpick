import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import SocialLogin, { lastLogin } from '../components/SocialLogin';

const ROLE_ICON = { farmer: 'fa-tractor', company: 'fa-building' };

function Field({ icon, children }) {
  return (
    <div className="relative">
      <i className={`fa-solid ${icon} pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[13px] text-ink-400`} />
      {children}
    </div>
  );
}

const inputCls = 'input !h-12 !rounded-xl !pl-11 !text-[14.5px]';

export default function Login() {
  const { login, adminLogin, testAdminLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [tab, setTab] = useState('user');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secret, setSecret] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [keep, setKeep] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState('');
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    api('/api/auth/test-accounts').then(setAccounts).catch(() => {});
  }, []);

  const pwValid = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/.test(password);

  const run = async (key, method, fn) => {
    setError('');
    setLoading(key);
    try {
      const u = await fn();
      localStorage.setItem('fp_last_login', method);
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
      <p className="eyebrow">Sign in</p>
      <h2 className="mt-3 font-serif text-[30px] font-bold leading-tight tracking-[-0.03em] text-ink-950">
        오늘도 농장을<br />함께 살펴볼까요?
      </h2>
      <p className="mt-2 text-[14px] text-ink-500">
        처음이신가요?{' '}
        <Link to="/signup" className="font-semibold text-forest-700 underline underline-offset-4">무료 회원가입</Link>
      </p>

      <div className="mt-7 grid grid-cols-2 border-b border-ink-200" role="tablist">
        {[['user', '농가 · 기업 회원', 'fa-user'], ['admin', '관리자', 'fa-shield-halved']].map(([k, l, icon]) => (
          <button key={k} role="tab" aria-selected={tab === k} onClick={() => switchTab(k)}
            className={`-mb-px flex items-center justify-center gap-2 border-b-2 py-3 text-[14px] font-semibold transition-colors ${
              tab === k ? 'border-forest-600 text-ink-950' : 'border-transparent text-ink-400 hover:text-ink-700'
            }`}>
            <i className={`fa-solid ${icon} text-xs`} />{l}
          </button>
        ))}
      </div>

      {error && (
        <p role="alert" className="fade-in mt-5 flex items-start gap-2 rounded-xl border border-blight/30 bg-[#fbebe6] px-3.5 py-3 text-[13px] text-blight">
          <i className="fa-solid fa-circle-exclamation mt-0.5" />{error}
        </p>
      )}

      {tab === 'user' ? (
        <div className="fade-in mt-7">
          <SocialLogin mode="시작하기" />

          <div className="my-6 flex items-center gap-3 text-[12px] text-ink-400">
            <span className="h-px flex-1 bg-ink-200" />또는 이메일로 로그인<span className="h-px flex-1 bg-ink-200" />
          </div>

          <form onSubmit={(e) => { e.preventDefault(); run('pw', 'email', () => login(email, password)); }} className="space-y-3">
            <Field icon="fa-envelope">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required aria-label="이메일"
                className={inputCls} placeholder="이메일 주소" autoComplete="email" />
            </Field>
            <Field icon="fa-lock">
              <input type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required aria-label="비밀번호"
                className={`${inputCls} !pr-11`} placeholder="비밀번호" autoComplete="current-password" />
              <button type="button" onClick={() => setShowPw(!showPw)} aria-label={showPw ? '비밀번호 숨기기' : '비밀번호 표시'}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-ink-400 hover:text-ink-700">
                <i className={`fa-solid ${showPw ? 'fa-eye-slash' : 'fa-eye'} text-sm`} />
              </button>
            </Field>
            {password && !pwValid && <p className="text-[12px] text-blight">영문 대소문자·숫자·특수문자 조합 8자리 이상이어야 합니다.</p>}
            <div className="flex items-center justify-between pt-1 text-[13px]">
              <label className="flex cursor-pointer items-center gap-2 text-ink-600">
                <input type="checkbox" checked={keep} onChange={(e) => setKeep(e.target.checked)} className="h-4 w-4 accent-forest-600" />
                로그인 상태 유지
              </label>
              <span className="text-ink-500">
                <a href="mailto:contact@farmpick.kr?subject=계정 찾기" className="hover:text-ink-900">아이디 · 비밀번호 찾기</a>
              </span>
            </div>
            <button type="submit" disabled={!!loading}
              className="relative h-12 w-full rounded-xl bg-ink-950 text-[14.5px] font-semibold text-white transition-colors hover:bg-forest-700 disabled:opacity-50">
              {loading === 'pw' ? '로그인 중…' : '이메일로 로그인'}
              {lastLogin() === 'email' && <span className="absolute -top-2.5 right-3 rounded-full bg-chloro px-2 py-0.5 text-[10px] text-ink-950">최근 사용</span>}
            </button>
          </form>

          <div className="mt-7 rounded-2xl border border-dashed border-ink-300 bg-ink-100/60 p-4">
            <p className="flex items-center gap-2 text-[12.5px] font-semibold text-ink-700">
              <i className="fa-solid fa-flask text-forest-600" />체험용 테스트 계정으로 바로 둘러보기
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {accounts.map((acc) => (
                <button key={acc.email} disabled={!!loading} onClick={() => run(acc.email, 'test', () => login(acc.email, acc.password))}
                  className="flex items-center gap-2.5 rounded-xl border border-ink-200 bg-sheet px-3 py-2.5 text-left transition-colors hover:border-forest-500">
                  <i className={`fa-solid ${ROLE_ICON[acc.role] || 'fa-user'} text-forest-600`} />
                  <span className="min-w-0">
                    <span className="block text-[12.5px] font-semibold text-ink-900">{loading === acc.email ? '접속 중…' : acc.role_label}</span>
                    <span className="block truncate font-mono text-[10px] text-ink-400">{acc.email}</span>
                  </span>
                </button>
              ))}
              {accounts.length === 0 && <p className="col-span-2 text-xs text-ink-400">테스트 계정을 불러오는 중…</p>}
            </div>
          </div>
        </div>
      ) : (
        <div className="fade-in mt-7 space-y-4">
          {/* 실제 관리자 — .env 보안 키 */}
          <form onSubmit={(e) => { e.preventDefault(); run('key', 'admin', () => adminLogin(secret)); }}
            className="rounded-2xl border border-ink-200 bg-sheet p-5">
            <div className="flex items-center gap-3">
              <span className="leaf-r flex h-10 w-10 items-center justify-center bg-forest-700 text-white"><i className="fa-solid fa-key text-sm" /></span>
              <div>
                <p className="text-[14.5px] font-bold text-ink-950">관리자 보안 키 인증</p>
                <p className="text-[12px] text-ink-500">서버 <code className="font-mono">.env</code> 의 ADMIN_SECRET_KEY · 전체 CRUD 권한</p>
              </div>
            </div>
            <div className="mt-4"><Field icon="fa-key">
              <input type="password" value={secret} onChange={(e) => setSecret(e.target.value)} required aria-label="관리자 보안 키"
                className={`${inputCls} font-mono`} placeholder="Admin Secret Key" autoComplete="off" />
            </Field></div>
            <button type="submit" disabled={!!loading || !secret}
              className="mt-3 h-12 w-full rounded-xl bg-forest-600 text-[14.5px] font-semibold text-white transition-colors hover:bg-forest-700 disabled:opacity-40">
              {loading === 'key' ? '인증 중…' : '보안 키로 관리자 로그인'}
            </button>
          </form>

          {/* 테스트 관리자 — 읽기 전용 */}
          <button onClick={() => run('test', 'test-admin', testAdminLogin)} disabled={!!loading}
            className="w-full overflow-hidden rounded-2xl border border-harvest/40 bg-[#fff8e8] text-left transition-colors hover:border-harvest">
            <div className="hazard h-1" />
            <div className="flex items-center gap-3 p-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-harvest text-white"><i className="fa-solid fa-eye text-sm" /></span>
              <span className="flex-1">
                <span className="block text-[14.5px] font-bold text-ink-950">{loading === 'test' ? '진입 중…' : '테스트 관리자 로그인'}</span>
                <span className="block text-[12px] text-ink-500">관리자 화면 열람 전용 · 생성/수정/삭제 차단</span>
              </span>
              <span className="stamp sev-mid">READ ONLY</span>
            </div>
          </button>
          <p className="text-center text-[12px] text-ink-400">관리자 계정은 비밀번호 로그인을 지원하지 않습니다.</p>
        </div>
      )}
    </div>
  );
}
