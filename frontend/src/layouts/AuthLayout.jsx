import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen">
      {/* 좌측 에디토리얼 패널 */}
      <div className="furrows hidden flex-1 flex-col justify-between bg-ink-950 p-12 text-white lg:flex">
        <div className="flex items-center gap-2 font-heading text-xl font-bold tracking-tight">
          <img src="/leaf.svg" alt="" className="h-8 w-8" />
          farmpick<span className="text-forest-400">.</span>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-forest-300">
            AI Crop Pest Diagnosis
          </p>
          <h1 className="mt-5 font-heading text-[44px] font-bold leading-[1.2] tracking-tight">
            사진 한 장으로<br />병해충을 진단하고<br />수확을 지키세요
          </h1>
          <p className="mt-6 max-w-md text-[15px] leading-relaxed text-white/50">
            생육 이미지 AI 진단 · 지역별 발생 동향 · 맞춤 방제 추천.
            농가와 기업을 잇는 스마트팜 플랫폼입니다.
          </p>
          <div className="mt-12 grid max-w-md grid-cols-3 divide-x divide-white/10 border-t border-white/10 pt-8">
            {[
              ['이미지 진단', 'fa-camera'],
              ['발생 동향', 'fa-chart-line'],
              ['AI 상담', 'fa-robot'],
            ].map(([label, icon]) => (
              <div key={label} className="px-4 first:pl-0">
                <i className={`fa-solid ${icon} text-forest-400`} />
                <p className="mt-2 text-xs tracking-wide text-white/60">{label}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-[11px] tracking-wide text-white/25">
          © 2026 farmpick · 이오리(조장) 박미금 김모란 홍기흥
        </p>
      </div>
      {/* 우측 폼 영역 */}
      <div className="furrows-light flex w-full items-center justify-center bg-paper px-6 lg:w-[520px]">
        <div className="w-full max-w-sm">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
