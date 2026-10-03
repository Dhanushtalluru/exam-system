import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import useLoad from '../../hooks/useLoad';
import { Page } from '../../components/UI';
export default function Result() {
  const { id } = useParams();
  const { data: r, error, loading } = useLoad(() => api('/user/results/' + id), [id]);
  return <Page title="Result Details" error={error} loading={loading} actions={<Link className="btn" to="/my">Back</Link>}>{r && <>
    <div className={'msg ' + (r.passed ? 'ok' : 'err')}><b>{r.testTitle}</b>: {r.totalScore} / {r.maxMarks} — {r.passed ? 'PASSED' : 'FAILED'} (pass mark {r.passingMarks})</div>
    {r.answers.map((a, i) => <div className="qbox" key={a.answerId}><b>Q{i + 1}. {a.question.text}</b>
      <p className="answer">{a.response || <i>No answer</i>}</p><small>Marks: {a.marks ?? 0} / {a.question.marks}</small>
      {a.feedback && <p><b>Admin feedback:</b> {a.feedback}</p>}</div>)}</>}</Page>;
}
