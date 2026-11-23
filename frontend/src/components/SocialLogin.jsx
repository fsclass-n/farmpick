import { useState } from 'react';

// 각 사 브랜드 가이드(컬러·로고 비율)를 따른 실무형 소셜 로그인 버튼
const KakaoIcon = () => (
  <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden>
    <path fill="#000" d="M12 3C6.48 3 2 6.46 2 10.73c0 2.74 1.85 5.15 4.63 6.52l-.94 3.45c-.08.3.26.55.52.38l4.12-2.72c.55.07 1.1.1 1.67.1 5.52 0 10-3.46 10-7.73S17.52 3 12 3z" />
  </svg>
);
const NaverIcon = () => (
  <svg viewBox="0 0 24 24" className="h-[15px] w-[15px]" aria-hidden>
    <path fill="#fff" d="M16.27 3v9.37L7.73 3H3v18h4.73v-9.37L16.27 21H21V3z" />
  </svg>
);
const GoogleIcon = () => (
  <svg viewBox="0 0 48 48" className="h-[18px] w-[18px]" aria-hidden>
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
  </svg>
);

const PROVIDERS = {
  kakao: { label: '카카오로 시작하기', cls: 'bg-[#FEE500] text-black/85 hover:bg-[#f5dc00]', icon: <KakaoIcon /> },
  naver: { label: '네이버로 시작하기', cls: 'bg-[#03C75A] text-white hover:bg-[#02b350]', icon: <NaverIcon /> },
  google: { label: 'Google', cls: 'border border-[#dadce0] bg-white text-[#1f1f1f] hover:bg-[#f8f9fa]', icon: <GoogleIcon /> },
  apple: { label: 'Apple', cls: 'bg-black text-white hover:bg-[#222]', icon: <i className="fa-brands fa-apple text-[17px]" /> },
};

export const lastLogin = () => localStorage.getItem('fp_last_login');

function Recent() {
  return (
    <span className="absolute -top-2.5 right-3 rounded-full bg-ink-950 px-2 py-0.5 text-[10px] font-semibold text-white shadow">
      최근 사용
    </span>
  );
}

function Btn({ id, full, mode, recent, onClick }) {
  const p = PROVIDERS[id];
  return (
    <button type="button" onClick={() => onClick(id)}
      className={`relative flex h-12 items-center justify-center gap-2 rounded-xl text-[14.5px] font-semibold transition-colors ${p.cls} ${full ? 'w-full' : ''}`}>
      <span className="absolute left-4 flex items-center">{p.icon}</span>
      <span className={full ? '' : 'pl-5'}>{full ? p.label.replace('시작하기', mode) : p.label}</span>
      {recent === id && <Recent />}
    </button>
  );
}

export default function SocialLogin({ mode = '시작하기' }) {
  const [notice, setNotice] = useState('');
  const recent = lastLogin();
  const click = (id) => {
    setNotice(`${id === 'kakao' ? '카카오' : id === 'naver' ? '네이버' : id === 'google' ? 'Google' : 'Apple'} 간편${mode}는 OAuth 앱 심사 후 오픈됩니다. 지금은 이메일 또는 테스트 계정을 이용해 주세요.`);
  };
  const shared = { mode, recent, onClick: click };
  return (
    <div>
      <div className="relative">
        <span className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full border border-ink-200 bg-sheet px-2.5 py-0.5 text-[11px] font-semibold text-ink-700 shadow-sm">
          <i className="fa-solid fa-bolt mr-1 text-harvest" />3초 만에 {mode}
        </span>
        <Btn id="kakao" full {...shared} />
      </div>
      <div className="mt-2.5"><Btn id="naver" full {...shared} /></div>
      <div className="mt-2.5 grid grid-cols-2 gap-2.5">
        <Btn id="google" {...shared} /><Btn id="apple" {...shared} />
      </div>
      {notice && (
        <p className="fade-in mt-3 rounded-lg bg-ink-100 px-3 py-2 text-[12px] leading-relaxed text-ink-600">
          <i className="fa-solid fa-circle-info mr-1 text-forest-600" />{notice}
        </p>
      )}
    </div>
  );
}
