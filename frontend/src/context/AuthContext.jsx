import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../lib/api';

const AuthContext = createContext(null);

const readUser = () => {
  try {
    return JSON.parse(localStorage.getItem('fp_user'));
  } catch {
    return null;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readUser);

  const persist = (data) => {
    localStorage.setItem('fp_token', data.access_token);
    localStorage.setItem('fp_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const login = async (email, password) =>
    persist(await api('/api/auth/login', { method: 'POST', body: { email, password } }));

  // 실제 관리자: .env ADMIN_SECRET_KEY 인증
  const adminLogin = async (secretKey) =>
    persist(await api('/api/auth/admin-login', { method: 'POST', body: { secret_key: secretKey } }));

  // 테스트 관리자: 읽기 전용
  const testAdminLogin = async () =>
    persist(await api('/api/auth/test-admin-login', { method: 'POST' }));

  const logout = () => {
    localStorage.removeItem('fp_token');
    localStorage.removeItem('fp_user');
    setUser(null);
  };

  // 토큰 만료·무효 시 자동 로그아웃
  useEffect(() => {
    const onExpired = () => setUser(null);
    window.addEventListener('fp:unauthorized', onExpired);
    return () => window.removeEventListener('fp:unauthorized', onExpired);
  }, []);

  const isAdmin = !!user && ['admin', 'admin_readonly'].includes(user.role);
  const isReadOnly = user?.role === 'admin_readonly';

  return (
    <AuthContext.Provider value={{ user, login, adminLogin, testAdminLogin, logout, isAdmin, isReadOnly }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
