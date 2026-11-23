const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const WRITE_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];
// 읽기 전용 사용자도 허용되는 요청 (인증·AI 분석 등 데이터 비변경) — 백엔드 READONLY_ALLOWED 와 동일
const READONLY_ALLOWED = ['/api/auth/', '/api/diagnosis/analyze', '/api/diagnosis/mock-preview', '/api/chat'];

export const READONLY_MESSAGE = '테스트 관리자는 읽기 전용입니다. 데이터 변경 권한이 없습니다.';

export function getToken() {
  return localStorage.getItem('fp_token');
}

function currentRole() {
  try {
    return JSON.parse(localStorage.getItem('fp_user'))?.role;
  } catch {
    return null;
  }
}

export async function api(path, { method = 'GET', body, formData } = {}) {
  // 1차 방어: 클라이언트에서 읽기 전용 쓰기 요청 차단 (2차 방어는 백엔드 미들웨어)
  if (
    WRITE_METHODS.includes(method) &&
    currentRole() === 'admin_readonly' &&
    !READONLY_ALLOWED.some((p) => path.startsWith(p))
  ) {
    throw Object.assign(new Error(READONLY_MESSAGE), { status: 403, readonly: true });
  }

  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body && !formData) headers['Content-Type'] = 'application/json';

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: formData || (body ? JSON.stringify(body) : undefined),
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && token && !path.startsWith('/api/auth/')) {
    localStorage.removeItem('fp_token');
    localStorage.removeItem('fp_user');
    window.dispatchEvent(new Event('fp:unauthorized'));
  }
  if (!res.ok) throw Object.assign(new Error(data.detail || '요청 실패'), { status: res.status, readonly: !!data.readonly });
  return data;
}
