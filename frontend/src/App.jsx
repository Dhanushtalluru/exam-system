import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './layouts/Layout';
import Auth from './pages/Auth';
import Dashboard from './pages/admin/Dashboard';
import AdminTests from './pages/admin/Tests';
import TestForm from './pages/admin/TestForm';
import Submissions from './pages/admin/Submissions';
import Evaluate from './pages/admin/Evaluate';
import Users from './pages/admin/Users';
import UserTests from './pages/user/Tests';
import Instructions from './pages/user/Instructions';
import Take from './pages/user/Take';
import My from './pages/user/My';
import Result from './pages/user/Result';
function Guard({ role }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return user.role === role ? <Outlet /> : <Navigate to="/" replace />;
}
function Home() { const { user } = useAuth(); return <Navigate to={!user ? '/login' : user.role === 'ADMIN' ? '/admin' : '/tests'} replace />; }
export default function App() {
  return <Routes>
    <Route path="/login" element={<Auth />} /><Route path="/register" element={<Auth register />} />
    <Route element={<Guard role="ADMIN" />}><Route element={<Layout />}>
      <Route path="/admin" element={<Dashboard />} /><Route path="/admin/tests" element={<AdminTests />} />
      <Route path="/admin/tests/new" element={<TestForm />} /><Route path="/admin/tests/:id" element={<TestForm />} />
      <Route path="/admin/submissions" element={<Submissions />} /><Route path="/admin/submissions/:id" element={<Evaluate />} />
      <Route path="/admin/users" element={<Users />} /></Route></Route>
    <Route element={<Guard role="USER" />}>
      <Route element={<Layout />}>
        <Route path="/tests" element={<UserTests />} /><Route path="/tests/:id" element={<Instructions />} />
        <Route path="/my" element={<My />} /><Route path="/my/:id" element={<Result />} /></Route>
      <Route path="/take/:testId" element={<Take />} /></Route>
    <Route path="*" element={<Home />} />
  </Routes>;
}
