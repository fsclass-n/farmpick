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
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    api('/api/auth/test-accounts').then(setAccounts).catch(() => {});
  }, []);

  const pwValid = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/.test(password);

  const submit = async (e) => {
    e?.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      navigate(['admin', 'admin_readonly'].includes(user.role) ? '/admin' : '/');
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
      .then((user) => navigate(['admin', 'admin_readonly'].includes(user.role) ? '/admin' : '/'))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  return (
    <div>
      <Link to="/" className="mb-8 flex items-center gap-2 font-heading text-2xl font-bold text-primary-700">
        <img src="/leaf.svg" alt="" className="h-8 w-8" />farmpick
      </Link>
      <h2 className="font-heading text-2xl font-bold text-forest-950">로그인</h2>
      <p className="mt-1 text-sm text-gray-500">
        AI 병해충 진단 서비스를 시작하세요 ·{' '}
        <Link to="/signup" className="font-medium text-forest-600 hover:underline">회원가입</Link>
      </p>

      <form onSubmit={submit} className="mt-8 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">이메일</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">비밀번호</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
            placeholder="영문 대소문자·숫자·특수문자 8자리 이상"
          />
          {password && !pwValid && (
            <p className="mt-1 text-xs text-red-500">
              영문 대소문자, 숫자, 특수문자 조합 8자리 이상이어야 합니다.
            </p>
          )}
        </div>
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-primary-600 py-2.5 font-medium text-white hover:bg-primary-700 disabled:opacity-50"
        >
          {loading ? '로그인 중…' : '로그인'}
        </button>
      </form>

      {/* 테스트 계정 */}
      <div className="mt-8">
        <p className="mb-2 text-xs font-medium text-gray-500">테스트 계정으로 바로 시작</p>
        <div className="grid grid-cols-1 gap-2">
          {accounts.map((acc) => (
            <button
              key={acc.email}
              onClick={() => quickLogin(acc)}
              className="flex items-center gap-3 rounded-lg border border-gray-200 px-3 py-2 text-left text-sm hover:border-primary-400 hover:bg-primary-50"
            >
              <i className={`fa-solid ${ROLE_ICON[acc.role]} w-5 text-primary-600`} />
              <span>
                <span className="font-medium">{acc.role_label}</span>
                <span className="ml-2 text-xs text-gray-400">{acc.email}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 소셜 로그인 */}
      <div className="mt-6">
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span className="h-px flex-1 bg-gray-200" />또는<span className="h-px flex-1 bg-gray-200" />
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <button className="rounded-lg border border-gray-300 py-2 text-sm hover:bg-gray-50" title="Google 로그인 (준비 중)">
            <i className="fa-brands fa-google text-red-500" />
          </button>
          <button className="rounded-lg border border-gray-300 py-2 text-sm hover:bg-gray-50" title="Naver 로그인 (준비 중)">
            <span className="font-bold text-green-600">N</span>
          </button>
          <button className="rounded-lg border border-gray-300 py-2 text-sm hover:bg-gray-50" title="Kakao 로그인 (준비 중)">
            <i className="fa-solid fa-comment text-yellow-500" />
          </button>
        </div>
      </div>
    </div>
  );
}
