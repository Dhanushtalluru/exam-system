import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../../services/api';
import { clock } from '../../utils/format';
import { readImage } from '../../utils/image';
function Listen({ src, limit, n, onPlay }) {
  const ref = useRef(), left = limit > 0 ? limit - n : null;
  return <div className="row"><audio ref={ref} src={src} preload="auto" controls={!limit} onPlay={() => { if (ref.current.currentTime < 0.3) onPlay(); }} />
    {limit > 0 && <><button type="button" className="btn" disabled={left <= 0} onClick={() => ref.current.play()}>{n ? 'Play again' : 'Play audio'}</button><small>{left} {left === 1 ? 'play' : 'plays'} left</small></>}</div>;
}
export default function Take() {
  const { testId } = useParams();
  const [att, setAtt] = useState(null), [err, setErr] = useState(''), [ans, setAns] = useState({}), [i, setI] = useState(0), [left, setLeft] = useState(null), [done, setDone] = useState(false), [sub, setSub] = useState(false), [imgs, setImgs] = useState({}), [plays, setPlays] = useState({});
  const offset = useRef(0), busy = useRef(false), ansRef = useRef({}), imgRef = useRef({}); ansRef.current = ans; imgRef.current = imgs;
  useEffect(() => { api(`/tests/${testId}/start`, 'POST').then(a => { offset.current = new Date(a.serverTime) - Date.now(); setAtt(a); setAns(a.savedAnswers || {}); setImgs(a.savedImages || {}); }).catch(e => setErr(e.message)); }, [testId]);
  const submit = useCallback(async () => {
    if (busy.current) return; busy.current = true; setSub(true);
    try {
      await api(`/submissions/${att.submissionId}/answers`, 'POST', [...new Set([...Object.keys(ansRef.current), ...Object.keys(imgRef.current)])].map(q => ({ questionId: +q, response: ansRef.current[q] || '', imageData: imgRef.current[q] || null })));
      await api(`/submissions/${att.submissionId}/submit`, 'POST'); setDone(true);
    } catch (e) { setErr(e.message); busy.current = false; setSub(false); }
  }, [att]);
  useEffect(() => {
    if (!att) return;
    const tick = () => { const s = Math.max(0, Math.round((new Date(att.endsAt) - (Date.now() + offset.current)) / 1000)); setLeft(s); if (s === 0) submit(); };
    tick(); const t = setInterval(tick, 1000); return () => clearInterval(t);
  }, [att, submit]);
  const save = (qid, val) => api(`/submissions/${att.submissionId}/answers`, 'POST', [{ questionId: qid, response: val }]).catch(e => setErr(e.message));
  const sendPic = (qid, d) => api(`/submissions/${att.submissionId}/answers`, 'POST', [{ questionId: qid, response: '', imageData: d }]).catch(e => setErr(e.message));
  const pick = async (qid, file) => { if (!file) return; try { const d = await readImage(file); setImgs(p => ({ ...p, [qid]: d })); sendPic(qid, d); } catch (z) { setErr(z.message); } };
  const dropPic = qid => { setImgs(p => { const n = { ...p }; delete n[qid]; return n; }); sendPic(qid, null); };
  if (done) return <div className="auth"><h2>Test submitted</h2><p>Your answers were recorded. Results are visible after the admin publishes them.</p><Link className="btn" to="/my">My submissions</Link></div>;
  if (!att) return <div className="auth">{err ? <><div className="msg err">{err}</div><Link to="/tests">Back to tests</Link></> : <p>Starting test…</p>}</div>;
  const qs = att.questions, q = qs[i], has = x => (ans[x.id] || '').trim() !== '' || !!imgs[x.id], unanswered = qs.filter(x => !has(x)).length;
  const setText = v => setAns({ ...ans, [q.id]: v });
  return <div className="take"><div className="tbar"><b>{att.test.title}</b><span className={'timer' + (left < 60 ? ' low' : '')}>Time left {clock(left ?? 0)}</span></div>
    {err && <div className="msg err">{err} <Link to="/my">My submissions</Link></div>}
    <div className="tgrid"><aside><div className="nav">{qs.map((x, j) => <button key={x.id} className={(has(x) ? 'ans ' : '') + (j === i ? 'cur' : '')} onClick={() => setI(j)}>{j + 1}</button>)}</div>
      <small>Green = answered · {unanswered} unanswered</small></aside>
      <section className="qbox">{q.section && <div className="sectag">{q.section}</div>}<b>Question {i + 1} of {qs.length}</b> <small>({q.marks} marks)</small><p>{q.text}</p>{q.description && <p className="desc">{q.description}</p>}{q.imageData && <img src={q.imageData} alt="" className="qimg" />}
        {(q.type === 'MCQ' || q.type === 'TRUE_FALSE') && q.options.map(o => <label className="opt" key={o}><input type="radio" name={'q' + q.id} checked={ans[q.id] === o} onChange={() => { setText(o); save(q.id, o); }} /> {o}</label>)}
        {q.type === 'LISTENING' && <><Listen src={q.audioData} limit={q.playLimit} n={plays[q.id] || 0} onPlay={() => setPlays(p => ({ ...p, [q.id]: (p[q.id] || 0) + 1 }))} />
          <textarea rows="4" placeholder="Type what you hear" value={ans[q.id] || ''} onChange={e => setText(e.target.value)} onBlur={() => save(q.id, ans[q.id] || '')} /></>}
        {q.type === 'PICTURE' && <div className="row"><label className="btn">{imgs[q.id] ? 'Change picture' : 'Upload your picture'}<input type="file" accept="image/*" hidden onChange={e => { pick(q.id, e.target.files[0]); e.target.value = ''; }} /></label>
          {imgs[q.id] && <><img src={imgs[q.id]} alt="Your answer" className="qimg sm" /><button type="button" className="btn sm danger" onClick={() => dropPic(q.id)}>Remove</button></>}</div>}
        {q.type === 'MULTI_SELECT' && <>{q.options.map(o => { const sel = (ans[q.id] || '').split('\n').filter(Boolean), on = sel.includes(o);
          return <label className="opt" key={o}><input type="checkbox" checked={on} onChange={() => { const n = (on ? sel.filter(x => x !== o) : [...sel, o]).join('\n'); setText(n); save(q.id, n); }} /> {o}</label>; })}<small>Select all that apply</small></>}
        {q.type === 'SHORT_ANSWER' && <input value={ans[q.id] || ''} onChange={e => setText(e.target.value)} onBlur={() => save(q.id, ans[q.id] || '')} />}
        {q.type === 'DESCRIPTIVE' && <textarea rows="8" value={ans[q.id] || ''} onChange={e => setText(e.target.value)} onBlur={() => save(q.id, ans[q.id] || '')} />}
        <div className="row"><button className="btn" disabled={i === 0} onClick={() => setI(i - 1)}>Previous</button><button className="btn" disabled={i === qs.length - 1} onClick={() => setI(i + 1)}>Next</button>
          </div></section></div>
    <div className="submitbar"><span>{qs.length - unanswered} of {qs.length} answered</span>
      <button className="btn primary" disabled={sub} onClick={() => window.confirm(`Are you sure you want to submit the test?${unanswered ? `\n\n${unanswered} question(s) are still unanswered.` : ''}`) && submit()}>{sub ? 'Submitting…' : 'Submit Test'}</button></div></div>;
}