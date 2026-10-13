import { useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Page, Flash } from '../components/UI';
export default function Profile() {
  const { user, login } = useAuth();
  const [name, setName] = useState(user.name), [password, setPassword] = useState(''), [msg, setMsg] = useState(''), [err, setErr] = useState('');
  const save = async e => {
    e.preventDefault();
    try { const r = await api('/auth/me', 'PUT', { name, password }); login({ ...user, name: r.name }); setPassword(''); setMsg('Details updated'); setErr(''); }
    catch (x) { setErr(x.message); setMsg(''); }
  };
  return <Page title="Edit Details" error={err}><Flash m={msg} />
    <form className="qbox form" onSubmit={save} style={{ maxWidth: 480 }}>
      <label>Name<input required value={name} onChange={e => setName(e.target.value)} /></label>
      <label>Email<input disabled value={user.email} /></label>
      <label>Role<input disabled value={user.role} /></label>
      <label>New password (optional)<input type="password" minLength={6} placeholder="Leave blank to keep current" value={password} onChange={e => setPassword(e.target.value)} /></label>
      <div className="row"><button className="btn primary">Save changes</button></div></form></Page>;
}