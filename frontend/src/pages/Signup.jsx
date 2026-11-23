import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import SocialLogin from '../components/SocialLogin';

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
      <label className="mb-1.5 block text-[12.5px] font-semibold text-ink-700">{label}</label>
      <input
        type={type} required value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        placeholder={placeholder}
        className="input !h-12 !rounded-xl !text-[14.5px]"
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
      <p className="eyebrow">Create account</p>
      <h2 className="mt-3 font-serif text-[30px] font-bold leading-tight tracking-[-0.03em] text-ink-950">
        우리 농장의 첫 진단,<br />지금 시작하세요
      </h2>
      <p className="mt-2 text-[14px] text-ink-500">농가 계정으로 가입되며, 가입 즉시 AI 진단을 이용할 수 있습니다.</p>

      <div className="mt-8"><SocialLogin mode="가입하기" /></div>
      <div className="my-6 flex items-center gap-3 text-[12px] text-ink-400">
        <span className="h-px flex-1 bg-ink-200" />또는 이메일로 가입<span className="h-px flex-1 bg-ink-200" />
      </div>

      <form onSubmit={submit} className="space-y-4">
        {field('name', '이름', 'text', '홍길동')}
        {field('email', '이메일', 'email', 'you@example.com')}
        {field('password', '비밀번호', 'password', '영문 대소문자·숫자·특수문자 8자리 이상')}
        {form.password && !pwValid && (
          <p className="text-xs text-blight">영문 대소문자, 숫자, 특수문자 조합 8자리 이상이어야 합니다.</p>
        )}
        {field('confirm', '비밀번호 확인', 'password')}
        {form.confirm && form.password !== form.confirm && (
          <p className="text-xs text-blight">비밀번호가 일치하지 않습니다.</p>
        )}
        {error && <p className="rounded-xl border border-blight/30 bg-[#fbebe6] px-3.5 py-3 text-[13px] text-blight">{error}</p>}
        <button disabled={loading || !pwValid} className="h-12 w-full rounded-xl bg-ink-950 text-[14.5px] font-semibold text-white transition-colors hover:bg-forest-700 disabled:opacity-40">
          {loading ? '가입 중…' : '가입하기'}
        </button>
      </form>
      <p className="mt-7 text-center text-sm text-ink-500">
        이미 계정이 있으신가요?{' '}
        <Link to="/login" className="font-medium text-forest-600 underline-offset-4 hover:underline">로그인</Link>
      </p>
    </div>
  );
}
