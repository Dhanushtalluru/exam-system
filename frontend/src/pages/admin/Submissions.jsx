import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import useLoad from '../../hooks/useLoad';
import { Page, Badge } from '../../components/UI';
import { fmt } from '../../utils/format';
export default function Submissions() {
  const [st, setSt] = useState('');
  const { data, error, loading } = useLoad(() => api('/admin/submissions' + (st ? '?status=' + st : '')), [st]);
  return <Page title="Submissions & Results" error={error} loading={loading} actions={<select value={st} onChange={e => setSt(e.target.value)}>
    <option value="">All</option><option value="PENDING_EVALUATION">Pending evaluation</option><option value="EVALUATED">Evaluated</option><option value="IN_PROGRESS">In progress</option></select>}>
    {data && <div className="scroll"><table><thead><tr><th>Student</th><th>Test</th><th>Status</th><th>Submitted</th><th>Score</th><th>Result</th><th></th></tr></thead><tbody>
      {data.map(s => <tr key={s.id}><td>{s.userName}<br /><small>{s.userEmail}</small></td><td>{s.testTitle}</td><td><Badge s={s.status} /></td><td>{fmt(s.submittedAt)}</td>
        <td>{s.status === 'IN_PROGRESS' ? '-' : `${s.totalScore} / ${s.maxMarks}`}</td><td>{s.resultPublished ? 'Published' : 'Hidden'}</td>
        <td><Link className="btn sm" to={'/admin/submissions/' + s.id}>{s.status === 'PENDING_EVALUATION' ? 'Evaluate' : 'View'}</Link></td></tr>)}
      {!data.length && <tr><td colSpan="7">No submissions.</td></tr>}</tbody></table></div>}</Page>;
}
