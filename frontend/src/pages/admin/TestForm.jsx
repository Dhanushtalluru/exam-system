import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../services/api';
import useLoad from '../../hooks/useLoad';
import { Page } from '../../components/UI';
const blank = () => ({ type: 'MCQ', text: '', marks: 1, options: '', correctAnswer: '' });
export default function TestForm() {
  const { id } = useParams(); const nav = useNavigate();
  const [f, setF] = useState({ title: '', description: '', instructions: '', durationMinutes: 30, passingMarks: 0, questions: [blank()] });
  const [err, setErr] = useState(''), [busy, setBusy] = useState(false);
  const { loading, error } = useLoad(async () => {
    if (!id) return null;
    const t = await api('/admin/tests/' + id);
    setF({ ...t, description: t.description || '', instructions: t.instructions || '', questions: t.questions.map(q => ({ ...q, options: q.type === 'MCQ' ? q.options.join('\n') : '', correctAnswer: q.correctAnswer || '' })) });
    return t;
  }, [id]);
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));
  const setQ = (i, k, v) => setF(p => ({ ...p, questions: p.questions.map((q, j) => (j === i ? { ...q, [k]: v } : q)) }));
  const submit = async e => {
    e.preventDefault(); setBusy(true); setErr('');
    const body = { title: f.title, description: f.description, instructions: f.instructions, durationMinutes: +f.durationMinutes, passingMarks: +f.passingMarks,
      questions: f.questions.map(q => ({ type: q.type, text: q.text, marks: +q.marks,
        options: q.type === 'MCQ' ? q.options.split('\n').map(s => s.trim()).filter(Boolean) : [],
        correctAnswer: q.type === 'MCQ' || q.type === 'TRUE_FALSE' ? q.correctAnswer : null })) };
    try { await api(id ? '/admin/tests/' + id : '/admin/tests', id ? 'PUT' : 'POST', body); nav('/admin/tests'); } catch (x) { setErr(x.message); setBusy(false); }
  };
  return <Page title={id ? 'Edit Test' : 'Create Test'} error={error || err} loading={loading}>
    <form onSubmit={submit} className="form">
      <label>Title<input required value={f.title} onChange={e => set('title', e.target.value)} /></label>
      <label>Description<textarea value={f.description} onChange={e => set('description', e.target.value)} /></label>
      <label>Instructions<textarea value={f.instructions} onChange={e => set('instructions', e.target.value)} /></label>
      <div className="row"><label>Duration (minutes)<input type="number" min="1" required value={f.durationMinutes} onChange={e => set('durationMinutes', e.target.value)} /></label>
        <label>Passing marks<input type="number" min="0" step="0.5" required value={f.passingMarks} onChange={e => set('passingMarks', e.target.value)} /></label>
        <label>Total marks<input disabled value={f.questions.reduce((a, q) => a + (+q.marks || 0), 0)} /></label></div>
      <h3>Questions</h3>
      {f.questions.map((q, i) => <div className="qbox" key={i}>
        <div className="row"><b>Q{i + 1}</b>
          <select value={q.type} onChange={e => setQ(i, 'type', e.target.value)}>{['MCQ', 'TRUE_FALSE', 'SHORT_ANSWER', 'DESCRIPTIVE'].map(t => <option key={t}>{t}</option>)}</select>
          <input type="number" min="0.5" step="0.5" required style={{ width: 90 }} value={q.marks} onChange={e => setQ(i, 'marks', e.target.value)} /> marks
          <button type="button" className="btn sm danger" disabled={f.questions.length === 1} onClick={() => set('questions', f.questions.filter((_, j) => j !== i))}>Remove</button></div>
        <textarea required placeholder="Question text" value={q.text} onChange={e => setQ(i, 'text', e.target.value)} />
        {q.type === 'MCQ' && <textarea placeholder="Options (one per line)" value={q.options} onChange={e => setQ(i, 'options', e.target.value)} />}
        {(q.type === 'MCQ' || q.type === 'TRUE_FALSE') && <label>Correct answer<select required value={q.correctAnswer} onChange={e => setQ(i, 'correctAnswer', e.target.value)}>
          <option value="">-- select --</option>
          {(q.type === 'TRUE_FALSE' ? ['True', 'False'] : q.options.split('\n').map(s => s.trim()).filter(Boolean)).map(o => <option key={o}>{o}</option>)}</select></label>}
      </div>)}
      <div className="row"><button type="button" className="btn" onClick={() => set('questions', [...f.questions, blank()])}>+ Add question</button>
        <button className="btn primary" disabled={busy}>{busy ? 'Saving…' : 'Save test'}</button></div>
      <small>Tests are saved as drafts. Publish them from the Tests page.</small>
    </form></Page>;
}
