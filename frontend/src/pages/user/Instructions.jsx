import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../../services/api';
import useLoad from '../../hooks/useLoad';
import { Page } from '../../components/UI';
export default function Instructions() {
  const { id } = useParams(); const nav = useNavigate();
  const { data: t, error, loading } = useLoad(() => api('/tests/' + id), [id]);
  const done = t && t.attemptStatus && t.attemptStatus !== 'IN_PROGRESS';
  return <Page title="Test Instructions" error={error} loading={loading}>{t && <div className="qbox"><h3>{t.title}</h3><p>{t.description}</p>
    <p style={{ whiteSpace: 'pre-wrap' }}>{t.instructions || 'Answer all questions.'}</p>
    <ul><li>Duration: <b>{t.durationMinutes} minutes</b> — the timer starts when you click Start.</li><li>Total marks: {t.maxMarks} (pass: {t.passingMarks})</li>
      <li>The test is auto-submitted when time runs out. You can attempt it only once.</li></ul>
    {done ? <div className="msg err">You have already submitted this test.</div> : <button className="btn primary" onClick={() => window.confirm('Start the test now? The timer will begin.') && nav('/take/' + t.id)}>{t.attemptStatus ? 'Resume test' : 'Start test'}</button>}
    {' '}<Link className="btn" to="/tests">Back</Link></div>}</Page>;
}
