import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../services/api';
import useLoad from '../../hooks/useLoad';
import { Page } from '../../components/UI';
import { readImage } from '../../utils/image';
const TYPES = { MCQ: 'Multiple choice (single answer)', MULTI_SELECT: 'Multiple choice (multiple answers)', TRUE_FALSE: 'True / False', SHORT_ANSWER: 'Short answer', DESCRIPTIVE: 'Descriptive', PICTURE: 'Picture answer (student uploads a picture)', LISTENING: 'Listening (student types what they hear)' };
const isOpt = t => t === 'MCQ' || t === 'MULTI_SELECT';
const DRAFT = 'paperDraft';
const blankQ = marks => ({ type: 'MCQ', text: '', marks, options: ['', ''], correct: [], tf: 'True', description: '', image: '', topic: '', audio: '', transcript: '', playLimit: 2 });
const secName = n => 'Section ' + (n < 26 ? String.fromCharCode(65 + n) : n + 1);
const blankSec = n => ({ name: secName(n), marks: 1, open: true, questions: [blankQ(1)] });
const copyQ = q => ({ ...q, options: [...q.options], correct: [...q.correct] });
const move = (a, i, d) => { const j = i + d; if (j < 0 || j >= a.length) return a; const c = [...a]; [c[i], c[j]] = [c[j], c[i]]; return c; };
const secTotal = s => s.questions.reduce((a, q) => a + (+q.marks || 0), 0);
const mapQ = x => { const o = x.options.length ? x.options : ['', '']; const c = (x.correctAnswer || '').split('\n');
  return { type: x.type, text: x.text, marks: x.marks, options: isOpt(x.type) ? o : ['', ''], correct: o.map((v, i) => (c.includes(v) ? i : -1)).filter(i => i >= 0), tf: x.correctAnswer || 'True', description: x.description || '', image: x.imageData || '', topic: x.topic || '', audio: x.audioData || '', transcript: x.type === 'LISTENING' ? x.correctAnswer || '' : '', playLimit: x.playLimit ?? 2 }; };
function AudioField({ value, onChange, onError }) {
  const rec = useRef(null), chunks = useRef([]), [on, setOn] = useState(false);
  const toUrl = blob => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(blob); });
  const start = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ audio: true }), m = new MediaRecorder(s); chunks.current = [];
      m.ondataavailable = e => chunks.current.push(e.data);
      m.onstop = async () => { s.getTracks().forEach(t => t.stop()); try { onChange(await toUrl(new Blob(chunks.current, { type: m.mimeType }))); } catch { onError('Could not save the recording'); } };
      m.start(); rec.current = m; setOn(true);
    } catch { onError('Microphone not available. Allow microphone access (needs https or localhost) or upload a file.'); }
  };
  const pick = async file => {
    if (!file) return;
    if (!file.type.startsWith('audio/')) return onError('Please choose an audio file');
    if (file.size > 2.5e6) return onError('Audio must be under about 2.5 MB');
    try { onChange(await toUrl(file)); } catch { onError('Could not read that file'); }
  };
  return <div className="row">
    {on ? <button type="button" className="btn sm danger" onClick={() => { rec.current.stop(); setOn(false); }}>Stop recording</button>
      : <button type="button" className="btn sm" onClick={start}>{value ? 'Record again' : 'Record voice'}</button>}
    <label className="btn sm">Upload audio<input type="file" accept="audio/*" hidden onChange={e => { pick(e.target.files[0]); e.target.value = ''; }} /></label>
    {value && <><audio controls src={value} /><button type="button" className="btn sm danger" onClick={() => onChange('')}>Remove audio</button></>}</div>;
}
export default function TestForm() {
  const { id } = useParams(); const nav = useNavigate(); const pub = useRef(false);
  const [f, setF] = useState({ title: '', description: '', instructions: '', durationMinutes: 30, passingMarks: 0, access: 'ALL', allowed: [], sections: [blankSec(0)] });
  const [err, setErr] = useState(''), [busy, setBusy] = useState(false), [search, setSearch] = useState('');
  const [draft, setDraft] = useState(() => { if (id) return null; try { const d = JSON.parse(localStorage.getItem(DRAFT)); return d && (d.title || d.sections?.some(s => s.questions.some(q => q.text))) ? d : null; } catch { return null; } });
  const users = useLoad(() => api('/admin/users'));
  const { loading, error } = useLoad(async () => {
    if (!id) return null;
    const t = await api('/admin/tests/' + id), groups = [];
    t.questions.forEach(x => { const name = x.section || 'Section A'; let g = groups.find(s => s.name === name); if (!g) { g = { name, marks: x.marks, open: true, questions: [] }; groups.push(g); } g.questions.push(mapQ(x)); });
    setF({ title: t.title, description: t.description || '', instructions: t.instructions || '', durationMinutes: t.durationMinutes, passingMarks: t.passingMarks, access: t.restricted ? 'SELECTED' : 'ALL', allowed: t.allowedUserIds, sections: groups });
    return t;
  }, [id]);
  useEffect(() => { if (id || draft) return; const h = setTimeout(() => { try { localStorage.setItem(DRAFT, JSON.stringify(f)); } catch { /* storage full */ } }, 800); return () => clearTimeout(h); }, [f, id, draft]);
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));
  const secs = fn => setF(p => ({ ...p, sections: fn(p.sections) }));
  const updSec = (si, fn) => secs(a => a.map((s, i) => (i === si ? fn(s) : s)));
  const setQs = (si, fn) => updSec(si, s => ({ ...s, questions: fn(s.questions) }));
  const upd = (si, qi, fn) => setQs(si, a => a.map((x, j) => (j === qi ? fn(x) : x)));
  const toggle = (si, qi, k) => upd(si, qi, x => ({ ...x, correct: x.type === 'MCQ' ? [k] : x.correct.includes(k) ? x.correct.filter(c => c !== k) : [...x.correct, k] }));
  const delOpt = (si, qi, k) => upd(si, qi, x => ({ ...x, options: x.options.filter((_, j) => j !== k), correct: x.correct.filter(c => c !== k).map(c => (c > k ? c - 1 : c)) }));
  const total = f.sections.reduce((a, s) => a + secTotal(s), 0), count = f.sections.reduce((a, s) => a + s.questions.length, 0);
  const shown = (users.data || []).filter(u => (u.name + ' ' + u.email).toLowerCase().includes(search.toLowerCase()));
  const submit = async e => {
    e.preventDefault(); setErr('');
    const names = f.sections.map(s => s.name.trim().toLowerCase());
    if (new Set(names).size !== names.length) return setErr('Section names must be different');
    for (const s of f.sections) {
      if (!s.questions.length) return setErr(`${s.name} has no questions. Add one or delete the section`);
      const bad = s.questions.findIndex(x => x.type === 'LISTENING' && (!x.audio || !x.transcript.trim()));
      if (bad >= 0) return setErr(`${s.name}, question ${bad + 1}: add the audio and the text students should type`);
      for (const [i, x] of s.questions.entries()) if (isOpt(x.type)) {
        const at = `${s.name}, question ${i + 1}`;
        if (x.options.some(o => !o.trim())) return setErr(`${at}: fill in or remove empty options`);
        if (new Set(x.options.map(o => o.trim())).size !== x.options.length) return setErr(`${at}: options must be different`);
        if (!x.correct.length) return setErr(`${at}: mark the correct answer${x.type === 'MULTI_SELECT' ? '(s)' : ''}`);
      }
    }
    if (+f.passingMarks > total) return setErr(`Passing marks cannot exceed total marks (${total})`);
    if (f.access === 'SELECTED' && !f.allowed.length) return setErr('Select at least one user, or choose All Users');
    setBusy(true);
    const body = { title: f.title, description: f.description, instructions: f.instructions, durationMinutes: +f.durationMinutes, passingMarks: +f.passingMarks,
      access: f.access, allowedUserIds: f.access === 'SELECTED' ? f.allowed : [],
      questions: f.sections.flatMap(s => s.questions.map(x => ({ type: x.type, text: x.text, marks: +x.marks, description: x.description, imageData: x.image || null, topic: x.topic, section: s.name.trim(), audioData: x.type === 'LISTENING' ? x.audio || null : null, playLimit: +x.playLimit || 0,
        options: isOpt(x.type) ? x.options.map(o => o.trim()) : [],
        correctAnswer: isOpt(x.type) ? [...x.correct].sort((a, b) => a - b).map(k => x.options[k].trim()).join('\n') : x.type === 'TRUE_FALSE' ? x.tf : x.type === 'LISTENING' ? x.transcript : null }))) };
    try {
      const saved = await api(id ? '/admin/tests/' + id : '/admin/tests', id ? 'PUT' : 'POST', body);
      if (pub.current) await api(`/admin/tests/${saved.id}/publish?publish=true`, 'POST');
      try { localStorage.removeItem(DRAFT); } catch { /* ignore */ }
      nav('/admin/tests');
    } catch (x) { setErr(x.message); setBusy(false); }
  };
  return <Page title={id ? 'Edit Question Paper' : 'Create Question Paper'} error={error || err || users.error} loading={loading}>
    {draft && <div className="banner">You have an unsaved draft from earlier.
      <button type="button" className="btn sm primary" onClick={() => { setF(draft); setDraft(null); }}>Restore draft</button>
      <button type="button" className="btn sm" onClick={() => { try { localStorage.removeItem(DRAFT); } catch { /* ignore */ } setDraft(null); }}>Discard</button></div>}
    <form onSubmit={submit} className="form">
      <div className="panel">
        <label>Title<input required value={f.title} onChange={e => set('title', e.target.value)} /></label>
        <label>Description<textarea value={f.description} onChange={e => set('description', e.target.value)} /></label>
        <label>Instructions<textarea value={f.instructions} onChange={e => set('instructions', e.target.value)} /></label>
        <div className="row"><label>Duration (minutes)<input type="number" min="1" required value={f.durationMinutes} onChange={e => set('durationMinutes', e.target.value)} /></label>
          <label>Passing marks<input type="number" min="0" step="0.5" required value={f.passingMarks} onChange={e => set('passingMarks', e.target.value)} /></label>
          <label>Total marks<input disabled value={total} /></label></div>
        <h3>Test access</h3>
        <div className="row">{[['ALL', 'All users'], ['SELECTED', 'Selected users']].map(([v, l]) => <label className="opt" key={v}><input type="radio" name="access" checked={f.access === v} onChange={() => set('access', v)} /> {l}</label>)}</div>
        {f.access === 'SELECTED' && <div className="qbox"><input placeholder="Search students by name or email" value={search} onChange={e => setSearch(e.target.value)} />
          <div className="ulist">{shown.map(u => <label className="opt" key={u.id}><input type="checkbox" checked={f.allowed.includes(u.id)} onChange={() => set('allowed', f.allowed.includes(u.id) ? f.allowed.filter(a => a !== u.id) : [...f.allowed, u.id])} /> {u.name} <small>{u.email}</small></label>)}
            {!shown.length && <small>No matching students</small>}</div>
          <div className="row"><small>{f.allowed.length} selected</small>
            <button type="button" className="btn sm" onClick={() => set('allowed', [...new Set([...f.allowed, ...shown.map(u => u.id)])])}>Select shown</button>
            <button type="button" className="btn sm" onClick={() => set('allowed', [])}>Clear</button></div></div>}
        {id && <small>If students have already attempted this test, only the access settings can be changed.</small>}
      </div>
      <h3>Sections</h3>
      {f.sections.map((s, si) => <div className="sec" key={si}>
        <div className="sechead">
          <input className="secname" required placeholder="Section name" value={s.name} onChange={e => updSec(si, x => ({ ...x, name: e.target.value }))} />
          <label className="inl">Marks per question<input type="number" min="0.5" step="0.5" value={s.marks} onChange={e => updSec(si, x => ({ ...x, marks: e.target.value }))} /></label>
          <button type="button" className="btn sm" title="Give every question in this section the marks per question value" onClick={() => updSec(si, x => ({ ...x, questions: x.questions.map(q => ({ ...q, marks: x.marks })) }))}>Apply to all</button>
          <span className="chip">{s.questions.length} questions, {secTotal(s)} marks</span><span className="grow" />
          <button type="button" className="btn sm" disabled={si === 0} onClick={() => secs(a => move(a, si, -1))}>Up</button>
          <button type="button" className="btn sm" disabled={si === f.sections.length - 1} onClick={() => secs(a => move(a, si, 1))}>Down</button>
          <button type="button" className="btn sm" onClick={() => secs(a => [...a.slice(0, si + 1), { ...s, name: s.name + ' (copy)', questions: s.questions.map(copyQ) }, ...a.slice(si + 1)])}>Duplicate</button>
          <button type="button" className="btn sm" onClick={() => updSec(si, x => ({ ...x, open: !x.open }))}>{s.open ? 'Collapse' : 'Expand'}</button>
          <button type="button" className="btn sm danger" disabled={f.sections.length === 1} onClick={() => window.confirm(`Delete ${s.name} and its ${s.questions.length} questions?`) && secs(a => a.filter((_, i) => i !== si))}>Delete section</button>
        </div>
        {s.open && <div className="secbody">
          {s.questions.map((x, qi) => <div className="qbox" key={qi}>
            <div className="row"><b>Q{qi + 1}</b>
              <select value={x.type} onChange={e => upd(si, qi, y => ({ ...y, type: e.target.value, correct: [] }))}>{Object.entries(TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
              <input type="number" min="0.5" step="0.5" required style={{ width: 90 }} value={x.marks} onChange={e => upd(si, qi, y => ({ ...y, marks: e.target.value }))} /> marks
              <span className="grow" />
              <button type="button" className="btn sm" disabled={qi === 0} onClick={() => setQs(si, a => move(a, qi, -1))}>Up</button>
              <button type="button" className="btn sm" disabled={qi === s.questions.length - 1} onClick={() => setQs(si, a => move(a, qi, 1))}>Down</button>
              <button type="button" className="btn sm" onClick={() => setQs(si, a => [...a.slice(0, qi + 1), copyQ(x), ...a.slice(qi + 1)])}>Duplicate</button>
              <button type="button" className="btn sm danger" disabled={s.questions.length === 1} onClick={() => setQs(si, a => a.filter((_, j) => j !== qi))}>Remove question</button></div>
            <textarea required placeholder="Question text" value={x.text} onChange={e => upd(si, qi, y => ({ ...y, text: e.target.value }))} />
            <textarea placeholder="Description / hint (optional)" value={x.description} onChange={e => upd(si, qi, y => ({ ...y, description: e.target.value }))} />
            <input placeholder="Topic (optional, used in score reports)" maxLength={100} value={x.topic} onChange={e => upd(si, qi, y => ({ ...y, topic: e.target.value }))} />
            <div className="row"><label className="btn sm">{x.image ? 'Change picture' : 'Add picture'}<input type="file" accept="image/*" hidden onChange={async e => { const file = e.target.files[0]; e.target.value = ''; if (!file) return; try { const d = await readImage(file); upd(si, qi, y => ({ ...y, image: d })); } catch (z) { setErr(z.message); } }} /></label>
              {x.image && <><img src={x.image} alt="" className="qimg sm" /><button type="button" className="btn sm danger" onClick={() => upd(si, qi, y => ({ ...y, image: '' }))}>Remove picture</button></>}</div>
            {x.type === 'PICTURE' && <small>Students upload a picture as their answer. You grade it manually.</small>}
            {x.type === 'LISTENING' && <div className="qbox">
              <small>Record or upload the audio. Students listen and type what they hear. Marks are given for the share of correct words, in order.</small>
              <AudioField value={x.audio} onChange={v => upd(si, qi, y => ({ ...y, audio: v }))} onError={setErr} />
              <textarea placeholder="Exact text students should type (hidden from students)" value={x.transcript} onChange={e => upd(si, qi, y => ({ ...y, transcript: e.target.value }))} />
              <label>Plays allowed (0 = unlimited)<input type="number" min="0" max="10" style={{ width: 90 }} value={x.playLimit} onChange={e => upd(si, qi, y => ({ ...y, playLimit: e.target.value }))} /></label></div>}
            {isOpt(x.type) && <><small>{x.type === 'MCQ' ? 'Select the one correct option' : 'Tick every correct option'}</small>
              {x.options.map((o, k) => <div className="row optrow" key={k}>
                <input type={x.type === 'MCQ' ? 'radio' : 'checkbox'} name={`c${si}-${qi}`} checked={x.correct.includes(k)} onChange={() => toggle(si, qi, k)} title="Mark as correct" />
                <input required placeholder={`Option ${k + 1}`} value={o} onChange={e => upd(si, qi, y => ({ ...y, options: y.options.map((v, j) => (j === k ? e.target.value : v)) }))} />
                <button type="button" className="btn sm" disabled={x.options.length <= 2} title="Remove option" onClick={() => delOpt(si, qi, k)}>Remove</button></div>)}
              <div><button type="button" className="btn sm" onClick={() => upd(si, qi, y => ({ ...y, options: [...y.options, ''] }))}>+ Add Option</button></div></>}
            {x.type === 'TRUE_FALSE' && <div className="row">{['True', 'False'].map(v => <label className="opt" key={v}><input type="radio" name={`tf${si}-${qi}`} checked={x.tf === v} onChange={() => upd(si, qi, y => ({ ...y, tf: v }))} /> {v}</label>)}</div>}
          </div>)}
          <button type="button" className="btn sm" onClick={() => setQs(si, a => [...a, blankQ(s.marks)])}>+ Add question to {s.name}</button>
        </div>}
      </div>)}
      <button type="button" className="btn" onClick={() => secs(a => [...a, blankSec(a.length)])}>+ Add section</button>
      <div className="paperbar">
        <span className="stat"><b>{f.sections.length}</b> sections</span><span className="stat"><b>{count}</b> questions</span><span className="stat"><b>{total}</b> total marks</span>
        {+f.passingMarks > total && <span className="warn">Passing marks exceed total marks</span>}<span className="grow" />
        <button type="button" className="btn" onClick={() => nav('/admin/tests')}>Cancel</button>
        <button className="btn" disabled={busy} onClick={() => { pub.current = false; }}>Save as draft</button>
        <button className="btn primary" disabled={busy} onClick={() => { pub.current = true; }}>{busy ? 'Saving...' : 'Save and publish'}</button>
      </div>
    </form>
  </Page>;
}