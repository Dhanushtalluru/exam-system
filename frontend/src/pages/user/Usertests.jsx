import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import useLoad from '../../hooks/useLoad';
import { useAuth } from '../../context/AuthContext';
import { Page, Badge } from '../../components/UI';
const EMOJI = ['📘', '🧮', '🔬', '🌍', '🎨', '📝'];
export default function Tests() {
  const { user } = useAuth();
  const { data, error, loading } = useLoad(() => api('/tests'));
  return <Page title="" error={error} loading={loading}>
    <div className="hero"><h2>Hi {user.name.split(' ')[0]}! 👋</h2><p>Pick a test below and do your best. You've got this!</p></div>
    {data && <div className="cards">
      {data.map((t, i) => <div className="card tcard" key={t.id}><span className="emo">{EMOJI[i % EMOJI.length]}</span><b>{t.title}</b><span>{t.description}</span>
        <small>⏱ {t.durationMinutes} min · ❓ {t.questionCount} questions · ⭐ {t.maxMarks} marks</small>
        {t.attemptStatus && t.attemptStatus !== 'IN_PROGRESS' ? <Badge s="SUBMITTED" /> : <Link className="btn sm primary" to={'/tests/' + t.id}>{t.attemptStatus ? 'Resume' : 'View & Start'}</Link>}</div>)}
      {!data.length && <p>No tests are available right now. Check back soon! 🌈</p>}</div>}</Page>;
}