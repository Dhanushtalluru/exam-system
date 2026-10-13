import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../services/api';
import useLoad from '../../hooks/useLoad';
import { Page } from '../../components/UI';
import { readImage } from '../../utils/image';
const TYPES = { MCQ: 'Multiple choice (single answer)', MULTI_SELECT: 'Multiple choice (multiple answers)', TRUE_FALSE: 'True / False', SHORT_ANSWER: 'Short answer', DESCRIPTIVE: 'Descriptive', PICTURE: 'Picture answer (student uploads a picture)' };
const isOpt = t => t === 'MCQ' || t === 'MULTI_SELECT';
const blank = () => ({ type: 'MCQ', text: '', marks: 1, options: ['', ''], correct: [], tf: 'True', description: '', image: '' });
export default function TestForm() {
  const { id } = useParams(); const nav = useNavigate();
  const [f, setF] = useState({ title: '', description: '', instructions: '', durationMinutes: 30, passingMarks: 0, access: 'ALL', allowed: [], questions: [blank()] });
  const [err, setErr] = useState(''), [busy, setBusy] = useState(false), [search, setSearch] = useState('');
  const users = useLoad(() => api('/admin/users'));
  const { loading, error } = useLoad(async () => {
    if (!id) return null;
    const t = await api('/admin/tests/' + id);
    setF({ title: t.title, description: t.description || '', instructions: t.instructions || '', durationMinutes: t.durationMinutes, passingMarks: t.passingMarks,
      access: t.restricted ? 'SELECTED' : 'ALL', allowed: t.allowedUserIds,
      questions: t.questions.map(x => { const o = x.options.length ? x.options : ['', '']; const c = (x.correctAnswer || '').split('\n');
        return { type: x.type, text: x.text, marks: x.marks, options: isOpt(x.type) ? o : ['', ''], correct: o.map((v, i) => (c.includes(v) ? i : -1)).filter(i => i >= 0), tf: x.correctAnswer || 'True', description: x.description || '', image: x.imageData || '' }; }) });
    return t;
  }, [id]);
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));
  const upd = (i, fn) => setF(p => ({ ...p, questions: p.questions.map((x, j) => (j === i ? fn(x) : x)) }));
  const setType = (i, type) => upd(i, x => ({ ...x, type, correct: [] }));
  const toggle = (i, k) => upd(i, x => ({ ...x, correct: x.type === 'MCQ' ? [k] : x.correct.includes(k) ? x.correct.filter(c => c !== k) : [...x.correct, k] }));
  const delOpt = (i, k) => upd(i, x => ({ ...x, options: x.options.filter((_, j) => j !== k), correct: x.correct.filter(c => c !== k).map(c => (c > k ? c - 1 : c)) }));
  const shown = (users.data || []).filter(u => (u.name + ' ' + u.email).toLowerCase().includes(search.toLowerCase()));
  const submit = async e => {
    e.preventDefault(); setErr('');
    for (const [i, x] of f.questions.entries()) if (isOpt(x.type)) {
      if (x.options.some(o => !o.trim())) return setErr(`Question ${i + 1}: fill in or remove empty options`);
      if (new Set(x.options.map(o => o.trim())).size !== x.options.length) return setErr(`Question ${i + 1}: options must be different`);
      if (!x.correct.length) return setErr(`Question ${i + 1}: mark the correct answer${x.type === 'MULTI_SELECT' ? '(s)' : ''}`);
    }
    if (f.access === 'SELECTED' && !f.allowed.length) return setErr('Select at least one user, or choose All Users');
    setBusy(true);
    const body = { title: f.title, description: f.description, instructions: f.instructions, durationMinutes: +f.durationMinutes, passingMarks: +f.passingMarks,
      access: f.access, allowedUserIds: f.access === 'SELECTED' ? f.allowed : [],
      questions: f.questions.map(x => ({ type: x.type, text: x.text, marks: +x.marks, description: x.description, imageData: x.image || null, options: isOpt(x.type) ? x.options.map(o => o.trim()) : [],
        correctAnswer: isOpt(x.type) ? [...x.correct].sort((a, b) => a - b).map(k => x.options[k].trim()).join('\n') : x.type === 'TRUE_FALSE' ? x.tf : null })) };
    try { await api(id ? '/admin/tests/' + id : '/admin/tests', id ? 'PUT' : 'POST', body); nav('/admin/tests'); } catch (x) { setErr(x.message); setBusy(false); }
  };
  return <Page title={id ? 'Edit Test' : 'Create Test'} error={error || err || users.error} loading={loading}>
    <form onSubmit={submit} className="form">
      <label>Title<input required value={f.title} onChange={e => set('title', e.target.value)} /></label>
      <label>Description<textarea value={f.description} onChange={e => set('description', e.target.value)} /></label>
      <label>Instructions<textarea value={f.instructions} onChange={e => set('instructions', e.target.value)} /></label>
      <div className="row"><label>Duration (minutes)<input type="number" min="1" required value={f.durationMinutes} onChange={e => set('durationMinutes', e.target.value)} /></label>
        <label>Passing marks<input type="number" min="0" step="0.5" required value={f.passingMarks} onChange={e => set('passingMarks', e.target.value)} /></label>
        <label>Total marks<input disabled value={f.questions.reduce((a, q) => a + (+q.marks || 0), 0)} /></label></div>
      <h3>Test access</h3>
      <div className="row">{[['ALL', 'All users'], ['SELECTED', 'Selected users']].map(([v, l]) => <label className="opt" key={v}><input type="radio" name="access" checked={f.access === v} onChange={() => set('access', v)} /> {l}</label>)}</div>
      {f.access === 'SELECTED' && <div className="qbox"><input placeholder="Search students by name or email" value={search} onChange={e => setSearch(e.target.value)} />
        <div className="ulist">{shown.map(u => <label className="opt" key={u.id}><input type="checkbox" checked={f.allowed.includes(u.id)} onChange={() => set('allowed', f.allowed.includes(u.id) ? f.allowed.filter(a => a !== u.id) : [...f.allowed, u.id])} /> {u.name} <small>{u.email}</small></label>)}
          {!shown.length && <small>No matching students</small>}</div>
        <div className="row"><small>{f.allowed.length} selected</small>
          <button type="button" className="btn sm" onClick={() => set('allowed', [...new Set([...f.allowed, ...shown.map(u => u.id)])])}>Select shown</button>
          <button type="button" className="btn sm" onClick={() => set('allowed', [])}>Clear</button></div></div>}
      {id && <small>If students have already attempted this test, only the access settings can be changed.</small>}
      <h3>Questions</h3>
      {f.questions.map((x, i) => <div className="qbox" key={i}>
        <div className="row"><b>Q{i + 1}</b>
          <select value={x.type} onChange={e => setType(i, e.target.value)}>{Object.entries(TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
          <input type="number" min="0.5" step="0.5" required style={{ width: 90 }} value={x.marks} onChange={e => upd(i, y => ({ ...y, marks: e.target.value }))} /> marks
          <button type="button" className="btn sm danger" disabled={f.questions.length === 1} onClick={() => set('questions', f.questions.filter((_, j) => j !== i))}>Remove question</button></div>
        <textarea required placeholder="Question text" value={x.text} onChange={e => upd(i, y => ({ ...y, text: e.target.value }))} />
        <textarea placeholder="Description / hint (optional)" value={x.description} onChange={e => upd(i, y => ({ ...y, description: e.target.value }))} />
        <div className="row"><label className="btn sm">📷 {x.image ? 'Change picture' : 'Add picture'}<input type="file" accept="image/*" hidden onChange={async e => { const file = e.target.files[0]; e.target.value = ''; if (!file) return; try { const d = await readImage(file); upd(i, y => ({ ...y, image: d })); } catch (z) { setErr(z.message); } }} /></label>
          {x.image && <><img src={x.image} alt="" className="qimg sm" /><button type="button" className="btn sm danger" onClick={() => upd(i, y => ({ ...y, image: '' }))}>Remove picture</button></>}</div>
        {x.type === 'PICTURE' && <small>Students upload a picture as their answer. You grade it manually.</small>}
        {isOpt(x.type) && <><small>{x.type === 'MCQ' ? 'Select the one correct option' : 'Tick every correct option'}</small>
          {x.options.map((o, k) => <div className="row optrow" key={k}>
            <input type={x.type === 'MCQ' ? 'radio' : 'checkbox'} name={'c' + i} checked={x.correct.includes(k)} onChange={() => toggle(i, k)} title="Mark as correct" />
            <input required placeholder={`Option ${k + 1}`} value={o} onChange={e => upd(i, y => ({ ...y, options: y.options.map((v, j) => (j === k ? e.target.value : v)) }))} />
            <button type="button" className="btn sm" disabled={x.options.length <= 2} title="Remove option" onClick={() => delOpt(i, k)}>✕</button></div>)}
          <div><button type="button" className="btn sm" onClick={() => upd(i, y => ({ ...y, options: [...y.options, ''] }))}>+ Add Option</button></div></>}
        {x.type === 'TRUE_FALSE' && <div className="row">{['True', 'False'].map(v => <label className="opt" key={v}><input type="radio" name={'tf' + i} checked={x.tf === v} onChange={() => upd(i, y => ({ ...y, tf: v }))} /> {v}</label>)}</div>}
      </div>)}
      <div className="row"><button type="button" className="btn" onClick={() => set('questions', [...f.questions, blank()])}>+ Add question</button>
        <button className="btn primary" disabled={busy}>{busy ? 'Saving…' : 'Save test'}</button>
        <button type="button" className="btn" onClick={() => nav('/admin/tests')}>Cancel</button></div>
    </form></Page>;
}