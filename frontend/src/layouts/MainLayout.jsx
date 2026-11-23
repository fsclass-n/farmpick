import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Floaters from '../components/Floaters';

export default function MainLayout() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <Header />
      <main className="mx-auto w-full max-w-[1280px] flex-1 px-5 py-10 md:py-14">
        <Outlet />
      </main>
      <Footer />
      <Floaters />
    </div>
  );
}
