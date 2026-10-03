import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../../services/api';
import { clock } from '../../utils/format';
export default function Take() {
  const { testId } = useParams();
  const [att, setAtt] = useState(null), [err, setErr] = useState(''), [ans, setAns] = useState({}), [i, setI] = useState(0), [left, setLeft] = useState(null), [done, setDone] = useState(false);
  const offset = useRef(0), busy = useRef(false), ansRef = useRef({}); ansRef.current = ans;
  useEffect(() => { api(`/tests/${testId}/start`, 'POST').then(a => { offset.current = new Date(a.serverTime) - Date.now(); setAtt(a); setAns(a.savedAnswers || {}); }).catch(e => setErr(e.message)); }, [testId]);
  const submit = useCallback(async () => {
    if (busy.current) return; busy.current = true;
    try {
      await api(`/submissions/${att.submissionId}/answers`, 'POST', Object.entries(ansRef.current).map(([q, r]) => ({ questionId: +q, response: r })));
      await api(`/submissions/${att.submissionId}/submit`, 'POST'); setDone(true);
    } catch (e) { setErr(e.message); busy.current = false; }
  }, [att]);
  useEffect(() => {
    if (!att) return;
    const tick = () => { const s = Math.max(0, Math.round((new Date(att.endsAt) - (Date.now() + offset.current)) / 1000)); setLeft(s); if (s === 0) submit(); };
    tick(); const t = setInterval(tick, 1000); return () => clearInterval(t);
  }, [att, submit]);
  const save = (qid, val) => api(`/submissions/${att.submissionId}/answers`, 'POST', [{ questionId: qid, response: val }]).catch(e => setErr(e.message));
  if (done) return <div className="auth"><h2>Test submitted ✓</h2><p>Your answers were recorded. Results are visible after the admin publishes them.</p><Link className="btn" to="/my">My submissions</Link></div>;
  if (!att) return <div className="auth">{err ? <><div className="msg err">{err}</div><Link to="/tests">Back to tests</Link></> : <p>Starting test…</p>}</div>;
  const qs = att.questions, q = qs[i], has = x => (ans[x.id] || '').trim() !== '', unanswered = qs.filter(x => !has(x)).length;
  const setText = v => setAns({ ...ans, [q.id]: v });
  return <div className="take"><div className="tbar"><b>{att.test.title}</b><span className={'timer' + (left < 60 ? ' low' : '')}>⏱ {clock(left ?? 0)}</span></div>
    {err && <div className="msg err">{err} <Link to="/my">My submissions</Link></div>}
    <div className="tgrid"><aside><div className="nav">{qs.map((x, j) => <button key={x.id} className={(has(x) ? 'ans ' : '') + (j === i ? 'cur' : '')} onClick={() => setI(j)}>{j + 1}</button>)}</div>
      <small>Green = answered · {unanswered} unanswered</small></aside>
      <section className="qbox"><b>Question {i + 1} of {qs.length}</b> <small>({q.marks} marks)</small><p>{q.text}</p>
        {(q.type === 'MCQ' || q.type === 'TRUE_FALSE') && q.options.map(o => <label className="opt" key={o}><input type="radio" name={'q' + q.id} checked={ans[q.id] === o} onChange={() => { setText(o); save(q.id, o); }} /> {o}</label>)}
        {q.type === 'SHORT_ANSWER' && <input value={ans[q.id] || ''} onChange={e => setText(e.target.value)} onBlur={() => save(q.id, ans[q.id] || '')} />}
        {q.type === 'DESCRIPTIVE' && <textarea rows="8" value={ans[q.id] || ''} onChange={e => setText(e.target.value)} onBlur={() => save(q.id, ans[q.id] || '')} />}
        <div className="row"><button className="btn" disabled={i === 0} onClick={() => setI(i - 1)}>Previous</button><button className="btn" disabled={i === qs.length - 1} onClick={() => setI(i + 1)}>Next</button>
          <button className="btn primary" onClick={() => window.confirm(unanswered ? `${unanswered} question(s) unanswered. Submit anyway?` : 'Submit the test?') && submit()}>Submit test</button></div></section></div></div>;
}
