import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
export default function Layout() {
  const { user, logout } = useAuth(); const nav = useNavigate();
  const links = user.role === 'ADMIN'
    ? [['/admin', 'Dashboard'], ['/admin/tests', 'Tests'], ['/admin/submissions', 'Submissions'], ['/admin/users', 'Users']]
    : [['/tests', 'Available Tests'], ['/my', 'My Submissions & Results']];
  return <div><header><Link to="/" className="logo">ExamPortal</Link>
    <nav>{links.map(([to, t]) => <NavLink key={to} to={to} end>{t}</NavLink>)}</nav>
    <span className="who">{user.name} ({user.role}) <button className="btn sm" onClick={() => { logout(); nav('/login'); }}>Logout</button></span></header>
    <main><Outlet /></main></div>;
}
