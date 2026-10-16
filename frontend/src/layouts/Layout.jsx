import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
export default function Layout() {
  const { user, logout } = useAuth(); const nav = useNavigate(); const ref = useRef();
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
  useEffect(() => { document.documentElement.dataset.theme = theme; localStorage.setItem('theme', theme); }, [theme]);
  useEffect(() => {
    const out = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }, esc = e => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', out); document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', out); document.removeEventListener('keydown', esc); };
  }, []);
  const admin = user.role === 'ADMIN', home = admin ? '/admin' : '/tests';
  const links = admin ? [['/admin', 'Dashboard'], ['/admin/tests', 'Tests'], ['/admin/submissions', 'Submissions'], ['/admin/users', 'Users']] : [['/tests', 'Available Tests'], ['/my', 'My Results']];
  return <div><header><Link to={home} className="logo">ExamPortal</Link>
    <nav>{links.map(([to, t]) => <NavLink key={to} to={to} end>{t}</NavLink>)}</nav>
    <div className="right">
      <button className="btn sm" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} title="Switch theme">{theme === 'dark' ? 'Light mode' : 'Dark mode'}</button>
      <div className="menu" ref={ref}>
        <button className="user-btn" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(!open)}>
          <span className="avatar">{user.name?.[0]?.toUpperCase()}</span><span className="uname">{user.name}</span><span className="role">{user.role}</span> ▾</button>
        {open && <div className="dropdown" role="menu"><div className="meta">{user.email}</div>
          <Link to={home} onClick={() => setOpen(false)}>Dashboard</Link>
          <Link to="/profile" onClick={() => setOpen(false)}>Edit Details</Link>
          <button className="out" onClick={() => { logout(); nav('/login'); }}>Logout</button></div>}
      </div></div></header><main><Outlet /></main><footer className="foot"><Link to="/privacy">Privacy Policy</Link><Link to="/terms">Terms and Conditions</Link></footer></div>;
}