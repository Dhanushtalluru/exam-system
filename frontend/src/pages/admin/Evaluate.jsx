import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../services/api';
import useLoad from '../../hooks/useLoad';
import { Page, Badge, Flash } from '../../components/UI';
const isManual = a => a.question.type === 'SHORT_ANSWER' || a.question.type === 'DESCRIPTIVE';
export default function Evaluate() {
  const { id } = useParams();
  const { data, error, loading, reload } = useLoad(() => api('/admin/submissions/' + id), [id]);
  const [edits, setEdits] = useState({}), [msg, setMsg] = useState(''), [err, setErr] = useState('');
  const ed = (aid, k, v) => setEdits(p => ({ ...p, [aid]: { ...p[aid], [k]: v } }));
  const locked = data && (data.resultPublished || data.status === 'IN_PROGRESS');
  const act = async (fn, ok) => { try { await fn(); setMsg(ok); setErr(''); setEdits({}); reload(); } catch (e) { setErr(e.message); setMsg(''); } };
  const save = () => {
    const items = data.answers.filter(isManual).map(a => { const e = edits[a.answerId] || {}; return { answerId: a.answerId, marks: e.marks ?? a.marks, feedback: e.feedback ?? a.feedback ?? '' }; })
      .filter(i => i.marks !== null && i.marks !== undefined && i.marks !== '').map(i => ({ ...i, marks: +i.marks }));
    if (!items.length) return setErr('Enter marks for at least one answer');
    act(() => api(`/admin/submissions/${id}/evaluate`, 'PUT', { answers: items }), 'Evaluation saved');
  };
  return <Page title="Evaluate Submission" error={error || err} loading={loading}><Flash m={msg} />{data && <>
    <p><b>{data.userName}</b> ({data.userEmail}) — {data.testTitle} <Badge s={data.status} /> · Score: <b>{data.totalScore} / {data.maxMarks}</b> (pass {data.passingMarks})</p>
    {data.answers.map((a, i) => <div className="qbox" key={a.answerId}>
      <b>Q{i + 1}. {a.question.text}</b> <small>[{a.question.type}, {a.question.marks} marks]</small>
      <p className="answer">{a.response || <i>No answer</i>}</p>
      {isManual(a) ? <div className="row"><label>Marks (max {a.question.marks})<input type="number" min="0" max={a.question.marks} step="0.5" disabled={locked}
          value={edits[a.answerId]?.marks ?? a.marks ?? ''} onChange={e => ed(a.answerId, 'marks', e.target.value)} /></label>
        <label style={{ flex: 1 }}>Feedback<input disabled={locked} value={edits[a.answerId]?.feedback ?? a.feedback ?? ''} onChange={e => ed(a.answerId, 'feedback', e.target.value)} /></label></div>
        : <small>Auto-graded: {a.marks ?? 0} / {a.question.marks} · Correct answer: {a.question.correctAnswer}</small>}
    </div>)}
    {!locked && <div className="row"><button className="btn" onClick={save}>Save evaluation</button></div>}
    {data.status === 'EVALUATED' && !data.resultPublished && <button className="btn primary" onClick={() => window.confirm('Publish result? The student will see marks and feedback.') && act(() => api('/admin/results/' + id + '/publish', 'POST'), 'Result published')}>Finalize & publish result</button>}
    {data.resultPublished && <div className="msg ok">Result published to student.</div>}</>}</Page>;
}
