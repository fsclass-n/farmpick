import { Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import AuthLayout from './layouts/AuthLayout';
import MainLayout from './layouts/MainLayout';
import Admin from './pages/Admin';
import Chat from './pages/Chat';
import Diagnosis from './pages/Diagnosis';
import Home from './pages/Home';
import Login from './pages/Login';
import MyFarm from './pages/MyFarm';
import NotFound from './pages/NotFound';
import PestLibrary from './pages/PestLibrary';
import Signup from './pages/Signup';
import Trends from './pages/Trends';

export default function App() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Route>

      <Route element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="/trends" element={<Trends />} />
        <Route path="/pests" element={<PestLibrary />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/diagnosis" element={<Diagnosis />} />
          <Route path="/myfarm" element={<MyFarm />} />
          <Route path="/chat" element={<Chat />} />
        </Route>

        <Route element={<ProtectedRoute roles={['admin', 'admin_readonly']} />}>
          <Route path="/admin" element={<Admin />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
