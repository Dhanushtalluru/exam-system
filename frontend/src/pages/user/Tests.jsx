import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import useLoad from '../../hooks/useLoad';
import { Page, Badge } from '../../components/UI';
export default function Tests() {
  const { data, error, loading } = useLoad(() => api('/tests'));
  return <Page title="Available Tests" error={error} loading={loading}>{data && <>
    <p className="muted">{data.length ? 'Open a test to read its instructions before you start. Each test can be attempted once.' : 'No tests are assigned to you right now.'}</p>
    <div className="cards">{data.map(t => <div className="card tcard" key={t.id}><b>{t.title}</b>{t.description && <span>{t.description}</span>}
      <small>{t.durationMinutes} min, {t.questionCount} questions, {t.maxMarks} marks</small>
      {t.attemptStatus && t.attemptStatus !== 'IN_PROGRESS' ? <Badge s="SUBMITTED" /> : <Link className="btn sm primary" to={'/tests/' + t.id}>{t.attemptStatus ? 'Resume' : 'View and start'}</Link>}</div>)}</div></>}</Page>;
}