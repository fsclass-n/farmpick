import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const pwValid = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/.test(form.password);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
    setLoading(true);
    try {
      const data = await api('/api/auth/register', {
        method: 'POST',
        body: { name: form.name, email: form.email, password: form.password },
      });
      localStorage.setItem('fp_token', data.access_token);
      localStorage.setItem('fp_user', JSON.stringify(data.user));
      setDone(true);
      setTimeout(() => { window.location.href = '/'; }, 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const field = (key, label, type = 'text', placeholder = '') => (
    <div>
      <label className="mb-1 block text-sm font-medium text-forest-900">{label}</label>
      <input
        type={type} required value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        placeholder={placeholder}
        className="w-full rounded-xl border border-forest-200 bg-white px-3 py-2.5 text-sm focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-100"
      />
    </div>
  );

  if (done) {
    return (
      <div className="fade-in text-center">
        <i className="fa-solid fa-circle-check text-5xl text-forest-500" />
        <p className="mt-4 font-heading text-xl font-bold text-forest-900">가입 완료!</p>
        <p className="mt-1 text-sm text-gray-500">메인으로 이동합니다…</p>
      </div>
    );
  }

  return (
    <div>
      <Link to="/" className="mb-8 flex items-center gap-2 font-heading text-2xl font-bold text-forest-800">
        <img src="/leaf.svg" alt="" className="h-8 w-8" />farmpick
      </Link>
      <h2 className="font-heading text-2xl font-bold text-forest-950">회원가입</h2>
      <p className="mt-1 text-sm text-gray-500">농가 계정으로 가입됩니다</p>

      <form onSubmit={submit} className="mt-8 space-y-4">
        {field('name', '이름', 'text', '홍길동')}
        {field('email', '이메일', 'email', 'you@example.com')}
        {field('password', '비밀번호', 'password', '영문 대소문자·숫자·특수문자 8자리 이상')}
        {form.password && !pwValid && (
          <p className="text-xs text-red-500">영문 대소문자, 숫자, 특수문자 조합 8자리 이상이어야 합니다.</p>
        )}
        {field('confirm', '비밀번호 확인', 'password')}
        {form.confirm && form.password !== form.confirm && (
          <p className="text-xs text-red-500">비밀번호가 일치하지 않습니다.</p>
        )}
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
        <button
          disabled={loading || !pwValid}
          className="w-full rounded-xl bg-forest-800 py-2.5 font-medium text-sprout-300 hover:bg-forest-700 disabled:opacity-40"
        >
          {loading ? '가입 중…' : '가입하기'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-gray-500">
        이미 계정이 있으신가요?{' '}
        <Link to="/login" className="font-medium text-forest-600 hover:underline">로그인</Link>
      </p>
    </div>
  );
}
