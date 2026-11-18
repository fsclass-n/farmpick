import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center py-20 text-center">
      <p className="font-heading text-7xl font-bold text-primary-600">404</p>
      <p className="mt-4 text-gray-600">찾으시는 페이지가 없습니다.</p>
      <Link to="/" className="mt-6 rounded-xl bg-primary-600 px-6 py-3 text-sm font-medium text-white hover:bg-primary-700">
        메인으로 돌아가기
      </Link>
    </div>
  );
}
