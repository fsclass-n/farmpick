import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

const ROLE_ICON = {
  farmer: 'fa-tractor',
  company: 'fa-building',
  admin: 'fa-user-shield',
  admin_readonly: 'fa-eye',
};

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    api('/api/auth/test-accounts').then(setAccounts).catch(() => {});
  }, []);

  const pwValid = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/.test(password);

  const go = (u) => navigate(['admin', 'admin_readonly'].includes(u.role) ? '/admin' : '/');

  const submit = async (e) => {
    e?.preventDefault();
    setError('');
    setLoading(true);
    try {
      go(await login(email, password));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (acc) => {
    setEmail(acc.email);
    setPassword(acc.password);
    setError('');
    setLoading(true);
    login(acc.email, acc.password)
      .then(go)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  return (
    <div>
      <Link to="/" className="flex items-center gap-2 font-heading text-xl font-bold tracking-tight text-ink-900 lg:hidden">
        <img src="/leaf.svg" alt="" className="h-7 w-7" />farmpick<span className="text-forest-500">.</span>
      </Link>

      <p className="eyebrow mt-10 lg:mt-0">Welcome back</p>
      <h2 className="mt-2 font-heading text-[28px] font-bold tracking-tight text-ink-950">로그인</h2>
      <p className="mt-1.5 text-sm text-ink-500">
        계정이 없으신가요?{' '}
        <Link to="/signup" className="font-medium text-forest-600 underline-offset-4 hover:underline">회원가입</Link>
      </p>

      <form onSubmit={submit} className="mt-9 space-y-5">
        <div>
          <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.15em] text-ink-500">
            이메일
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="input"
            placeholder="you@example.com"
            autoComplete="email"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.15em] text-ink-500">
            비밀번호
          </label>
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="input pr-10"
              placeholder="영문 대소문자·숫자·특수문자 8자리 이상"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700"
              aria-label="비밀번호 표시"
            >
              <i className={`fa-solid ${showPw ? 'fa-eye-slash' : 'fa-eye'} text-sm`} />
            </button>
          </div>
          {password && !pwValid && (
            <p className="mt-1.5 text-xs text-red-500">
              영문 대소문자, 숫자, 특수문자 조합 8자리 이상이어야 합니다.
            </p>
          )}
        </div>
        {error && <p className="border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary w-full rounded-md py-3 text-sm">
          {loading ? '로그인 중…' : '로그인'}
        </button>
      </form>

      {/* 테스트 계정 */}
      <div className="mt-10">
        <div className="flex items-center gap-3">
          <span className="h-px flex-1 bg-ink-200" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-ink-400">
            테스트 계정으로 바로 시작
          </span>
          <span className="h-px flex-1 bg-ink-200" />
        </div>
        <div className="mt-4 divide-y divide-ink-100 border border-ink-200 bg-white">
          {accounts.map((acc) => (
            <button
              key={acc.email}
              onClick={() => quickLogin(acc)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-forest-50"
            >
              <i className={`fa-solid ${ROLE_ICON[acc.role]} w-4 text-sm text-forest-600`} />
              <span className="flex-1">
                <span className="block text-[13px] font-medium text-ink-900">{acc.role_label}</span>
                <span className="block text-xs text-ink-400">{acc.email}</span>
              </span>
              <i className="fa-solid fa-arrow-right text-xs text-ink-300" />
            </button>
          ))}
          {accounts.length === 0 && (
            <p className="px-4 py-3 text-xs text-ink-400">테스트 계정을 불러오는 중…</p>
          )}
        </div>
      </div>

      {/* 소셜 로그인 */}
      <div className="mt-8">
        <div className="flex items-center gap-3">
          <span className="h-px flex-1 bg-ink-200" />
          <span className="text-[11px] tracking-wide text-ink-400">또는 소셜 계정으로</span>
          <span className="h-px flex-1 bg-ink-200" />
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <button className="btn-ghost rounded-md py-2.5" title="Google 로그인 (준비 중)">
            <i className="fa-brands fa-google" />
          </button>
          <button className="btn-ghost rounded-md py-2.5 font-bold text-green-600" title="Naver 로그인 (준비 중)">
            N
          </button>
          <button className="btn-ghost rounded-md py-2.5" title="Kakao 로그인 (준비 중)">
            <i className="fa-solid fa-comment text-yellow-500" />
          </button>
        </div>
      </div>
    </div>
  );
}
