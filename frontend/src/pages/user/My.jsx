import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import useLoad from '../../hooks/useLoad';
import { Page, Badge } from '../../components/UI';
import { fmt } from '../../utils/format';
export default function My() {
  const { data, error, loading } = useLoad(() => api('/user/submissions'));
  return <Page title="My Submissions & Results" error={error} loading={loading}>{data && <div className="scroll"><table><thead><tr><th>Test</th><th>Status</th><th>Submitted</th><th>Result</th><th></th></tr></thead><tbody>
    {data.map(s => <tr key={s.id}><td>{s.testTitle}</td><td><Badge s={s.status} /></td><td>{fmt(s.submittedAt)}</td>
      <td>{s.resultPublished ? `${s.totalScore} / ${s.maxMarks} — ${s.passed ? 'PASS' : 'FAIL'}` : 'Awaiting result'}</td>
      <td>{s.resultPublished ? <Link className="btn sm" to={'/my/' + s.id}>Details</Link> : s.status === 'IN_PROGRESS' ? <Link className="btn sm" to={'/take/' + s.testId}>Resume</Link> : ''}</td></tr>)}
    {!data.length && <tr><td colSpan="5">You haven't attempted any tests yet.</td></tr>}</tbody></table></div>}</Page>;
}
