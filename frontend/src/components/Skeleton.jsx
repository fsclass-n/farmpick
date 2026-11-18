export function SkeletonCard() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="skeleton h-32 w-full" />
      <div className="skeleton mt-3 h-4 w-2/3" />
      <div className="skeleton mt-2 h-3 w-1/2" />
    </div>
  );
}

export function EmptyState({ icon = 'fa-seedling', title = '데이터가 없습니다', desc }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 py-14 text-center">
      <i className={`fa-solid ${icon} text-4xl text-primary-500`} />
      <p className="mt-4 font-heading text-lg font-semibold text-gray-700">{title}</p>
      {desc && <p className="mt-1 text-sm text-gray-500">{desc}</p>}
    </div>
  );
}

export function ErrorState({ message = '불러오는 중 오류가 발생했습니다.', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-red-200 bg-red-50 py-14 text-center">
      <i className="fa-solid fa-triangle-exclamation text-4xl text-red-400" />
      <p className="mt-4 font-heading font-semibold text-red-600">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
        >
          다시 시도
        </button>
      )}
    </div>
  );
}
