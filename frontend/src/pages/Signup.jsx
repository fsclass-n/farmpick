import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';

export default function Signup() {
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
      <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.15em] text-ink-500">{label}</label>
      <input
        type={type} required value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        placeholder={placeholder}
        className="input"
      />
    </div>
  );

  if (done) {
    return (
      <div className="fade-in text-center">
        <i className="fa-solid fa-circle-check text-4xl text-forest-500" />
        <p className="mt-4 font-heading text-xl font-bold text-ink-950">가입 완료!</p>
        <p className="mt-1 text-sm text-ink-500">메인으로 이동합니다…</p>
      </div>
    );
  }

  return (
    <div>
      <Link to="/" className="flex items-center gap-2 font-heading text-xl font-bold tracking-tight text-ink-900 lg:hidden">
        <img src="/leaf.svg" alt="" className="h-7 w-7" />farmpick<span className="text-forest-500">.</span>
      </Link>
      <p className="eyebrow mt-10 lg:mt-0">Create account</p>
      <h2 className="mt-2 font-heading text-[28px] font-bold tracking-tight text-ink-950">회원가입</h2>
      <p className="mt-1.5 text-sm text-ink-500">농가 계정으로 가입됩니다</p>

      <form onSubmit={submit} className="mt-9 space-y-5">
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
        {error && <p className="border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-600">{error}</p>}
        <button disabled={loading || !pwValid} className="btn-primary w-full rounded-md py-3 text-sm">
          {loading ? '가입 중…' : '가입하기'}
        </button>
      </form>
      <p className="mt-8 text-center text-sm text-ink-500">
        이미 계정이 있으신가요?{' '}
        <Link to="/login" className="font-medium text-forest-600 underline-offset-4 hover:underline">로그인</Link>
      </p>
    </div>
  );
}
