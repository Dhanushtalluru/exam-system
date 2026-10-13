import { useState } from 'react';
import { api } from '../../services/api';
import useLoad from '../../hooks/useLoad';
import { Page, Flash } from '../../components/UI';
export default function Users() {
  const { data, error, loading, reload } = useLoad(() => api('/admin/users'));
  const [f, setF] = useState(null), [msg, setMsg] = useState(''), [err, setErr] = useState('');
  const run = async (fn, ok) => { try { await fn(); setMsg(ok); setErr(''); setF(null); reload(); } catch (e) { setErr(e.message); setMsg(''); } };
  const save = e => { e.preventDefault(); run(() => (f.id ? api('/admin/users/' + f.id, 'PUT', f) : api('/admin/users', 'POST', f)), f.id ? 'User updated' : 'User added'); };
  const bind = k => ({ value: f[k] || '', onChange: e => setF({ ...f, [k]: e.target.value }) });
  return <Page title="Registered Students" error={error || err} loading={loading} actions={<button className="btn primary" onClick={() => { setF({ name: '', email: '', password: '' }); setMsg(''); }}>+ Add User</button>}>
    <Flash m={msg} />
    {f && <form className="qbox form" onSubmit={save}><h3>{f.id ? 'Edit user' : 'Add user'}</h3>
      <div className="row"><label>Name<input required {...bind('name')} /></label><label>Email<input type="email" required {...bind('email')} /></label>
        <label>{f.id ? 'New password (optional)' : 'Password'}<input type="password" minLength={6} required={!f.id} placeholder={f.id ? 'Leave blank to keep' : ''} {...bind('password')} /></label></div>
      <div className="row"><button className="btn primary">Save</button><button type="button" className="btn" onClick={() => setF(null)}>Cancel</button></div></form>}
    {data && <div className="scroll"><table><thead><tr><th>ID</th><th>Name</th><th>Email</th><th></th></tr></thead><tbody>
      {data.map(u => <tr key={u.id}><td>{u.id}</td><td>{u.name}</td><td>{u.email}</td><td className="row">
        <button className="btn sm" onClick={() => { setF({ ...u, password: '' }); setMsg(''); }}>Edit</button>
        <button className="btn sm" onClick={() => { const pw = window.prompt(`New password for ${u.name} (min 6 characters):`); if (pw) run(() => api('/admin/users/' + u.id, 'PUT', { ...u, password: pw }), 'Password updated for ' + u.name); }}>Reset Password</button>
        <button className="btn sm danger" onClick={() => window.confirm(`Delete ${u.name}? Their submissions and results will also be deleted.`) && run(() => api('/admin/users/' + u.id, 'DELETE'), 'User deleted')}>Delete</button></td></tr>)}
      {!data.length && <tr><td colSpan="4">No students yet.</td></tr>}</tbody></table></div>}</Page>;
}