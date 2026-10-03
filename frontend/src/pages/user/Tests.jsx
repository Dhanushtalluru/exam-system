import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import useLoad from '../../hooks/useLoad';
import { Page, Badge } from '../../components/UI';
export default function Tests() {
  const { data, error, loading } = useLoad(() => api('/tests'));
  return <Page title="Available Tests" error={error} loading={loading}>{data && <div className="cards">
    {data.map(t => <div className="card tcard" key={t.id}><b>{t.title}</b><span>{t.description}</span>
      <small>{t.durationMinutes} min · {t.questionCount} questions · {t.maxMarks} marks</small>
      {t.attemptStatus && t.attemptStatus !== 'IN_PROGRESS' ? <Badge s="SUBMITTED" /> : <Link className="btn sm" to={'/tests/' + t.id}>{t.attemptStatus ? 'Resume' : 'View & Start'}</Link>}</div>)}
    {!data.length && <p>No tests are available right now.</p>}</div>}</Page>;
}
