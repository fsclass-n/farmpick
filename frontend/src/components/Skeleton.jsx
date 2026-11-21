export function SkeletonCard() {
  return (
    <div className="hairline bg-white p-4">
      <div className="skeleton h-32 w-full" />
      <div className="skeleton mt-3 h-4 w-2/3" />
      <div className="skeleton mt-2 h-3 w-1/2" />
    </div>
  );
}

export function EmptyState({ icon = 'fa-seedling', title = '데이터가 없습니다', desc }) {
  return (
    <div className="flex flex-col items-center justify-center border border-dashed border-ink-300 bg-ink-50 py-14 text-center">
      <i className={`fa-solid ${icon} text-3xl text-forest-500`} />
      <p className="mt-4 font-heading font-semibold text-ink-700">{title}</p>
      {desc && <p className="mt-1 text-sm text-ink-400">{desc}</p>}
    </div>
  );
}

export function ErrorState({ message = '불러오는 중 오류가 발생했습니다.', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center border border-red-200 bg-red-50 py-14 text-center">
      <i className="fa-solid fa-triangle-exclamation text-3xl text-red-400" />
      <p className="mt-4 font-heading font-semibold text-red-600">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-primary mt-4 rounded-md px-4 py-2 text-sm">
          다시 시도
        </button>
      )}
    </div>
  );
}
