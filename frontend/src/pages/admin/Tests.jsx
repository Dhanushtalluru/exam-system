import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import useLoad from '../../hooks/useLoad';
import { Page, Badge, Flash } from '../../components/UI';
export default function Tests() {
  const { data, error, loading, reload } = useLoad(() => api('/admin/tests'));
  const [msg, setMsg] = useState(''), [err, setErr] = useState('');
  const run = async (fn, ok) => { try { await fn(); setMsg(ok); setErr(''); reload(); } catch (e) { setErr(e.message); setMsg(''); } };
  return <Page title="Tests" error={error || err} loading={loading} actions={<Link className="btn" to="/admin/tests/new">+ Create Test</Link>}><Flash m={msg} />
    {data && <div className="scroll"><table><thead><tr><th>Title</th><th>Questions</th><th>Duration</th><th>Marks (pass)</th><th>Status</th><th></th></tr></thead><tbody>
      {data.map(t => <tr key={t.id}><td>{t.title}</td><td>{t.questionCount}</td><td>{t.durationMinutes} min</td><td>{t.maxMarks} ({t.passingMarks})</td>
        <td><Badge s={t.published ? 'PUBLISHED' : 'DRAFT'} /></td>
        <td className="row"><Link className="btn sm" to={`/admin/tests/${t.id}`}>Edit</Link>
          <button className="btn sm" onClick={() => run(() => api(`/admin/tests/${t.id}/publish?publish=${!t.published}`, 'POST'), t.published ? 'Test unpublished' : 'Test published')}>{t.published ? 'Unpublish' : 'Publish'}</button>
          <button className="btn sm danger" onClick={() => window.confirm(`Delete "${t.title}"?`) && run(() => api('/admin/tests/' + t.id, 'DELETE'), 'Test deleted')}>Delete</button></td></tr>)}
      {!data.length && <tr><td colSpan="6">No tests yet.</td></tr>}</tbody></table></div>}</Page>;
}
