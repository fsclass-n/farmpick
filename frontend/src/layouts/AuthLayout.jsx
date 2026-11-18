import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen">
      {/* 좌측 브랜드 영역 — 딥 포레스트 + 밭 이랑 */}
      <div className="furrows hidden flex-1 flex-col justify-between bg-gradient-to-br from-forest-950 via-forest-800 to-forest-600 p-12 text-white lg:flex">
        <div className="flex items-center gap-2 font-heading text-2xl font-bold text-sprout-300">
          <img src="/leaf.svg" alt="" className="h-9 w-9" />
          farmpick
        </div>
        <div>
          <h1 className="font-heading text-4xl font-bold leading-tight">
            사진 한 장으로<br />병해충을 진단하고<br />수확을 지키세요
          </h1>
          <p className="mt-6 max-w-md text-forest-200">
            생육 이미지 AI 진단 · 지역별 발생 동향 분석 · 맞춤 방제 추천까지.
            농가와 기업을 잇는 스마트팜 플랫폼, farmpick입니다.
          </p>
          <div className="mt-10 flex gap-3">
            {[
              ['fa-camera', '이미지 진단'],
              ['fa-chart-line', '발생 동향'],
              ['fa-robot', 'AI 상담'],
            ].map(([icon, label]) => (
              <span key={label} className="glass-dark flex items-center gap-2 rounded-full px-4 py-2 text-sm text-sprout-300">
                <i className={`fa-solid ${icon}`} />{label}
              </span>
            ))}
          </div>
        </div>
        <p className="text-xs text-white/30">© 2026 farmpick · 이오리(조장) 박미금 김모란 홍기흥</p>
      </div>
      {/* 우측 폼 영역 */}
      <div className="furrows-light flex w-full items-center justify-center bg-paper px-6 lg:w-[480px]">
        <div className="w-full max-w-sm">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
