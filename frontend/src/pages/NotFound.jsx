import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center py-24 text-center">
      <p className="eyebrow">Error</p>
      <p className="mt-3 font-heading text-7xl font-bold tracking-tight text-ink-950">404</p>
      <p className="mt-4 text-sm text-ink-500">찾으시는 페이지가 없습니다.</p>
      <Link to="/" className="btn-primary mt-8 rounded-md px-6 py-3 text-sm">
        메인으로 돌아가기
      </Link>
    </div>
  );
}
