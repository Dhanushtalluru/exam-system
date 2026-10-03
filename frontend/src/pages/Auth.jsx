import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
export default function Auth({ register }) {
  const { user, login } = useAuth(); const nav = useNavigate();
  const [f, setF] = useState({ name: '', email: '', password: '' }), [err, setErr] = useState(''), [busy, setBusy] = useState(false);
  if (user) return <Navigate to="/" replace />;
  const submit = async e => {
    e.preventDefault(); setBusy(true); setErr('');
    try { login(await api(register ? '/auth/register' : '/auth/login', 'POST', f)); nav('/'); } catch (x) { setErr(x.message); setBusy(false); }
  };
  const bind = k => ({ value: f[k], onChange: e => setF({ ...f, [k]: e.target.value }) });
  return <form className="auth" onSubmit={submit}><h2>{register ? 'Create student account' : 'ExamPortal Login'}</h2>
    {err && <div className="msg err">{err}</div>}
    {register && <label>Name<input required {...bind('name')} /></label>}
    <label>Email<input type="email" required {...bind('email')} /></label>
    <label>Password<input type="password" required minLength={register ? 6 : 1} {...bind('password')} /></label>
    <button className="btn" disabled={busy}>{busy ? 'Please wait…' : register ? 'Register' : 'Login'}</button>
    <p>{register ? <Link to="/login">Already registered? Login</Link> : <Link to="/register">New student? Register</Link>}</p></form>;
}
