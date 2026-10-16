const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const when = d => (d ? new Date(d).toLocaleString() : '-');
// Opens a printable report: test details, topic-wise scores, answers and admin feedback.
export function printReport(d) {
  const topics = {};
  d.answers.forEach(a => {
    const t = a.question.topic || 'General', g = (topics[t] = topics[t] || { n: 0, got: 0, max: 0, pending: 0 });
    g.n++; g.max += a.question.marks; if (a.marks == null) g.pending++; else g.got += a.marks;
  });
  const result = d.status === 'IN_PROGRESS' ? 'In progress' : d.status === 'PENDING_EVALUATION' ? 'Pending evaluation' : d.totalScore >= d.passingMarks ? 'Passed' : 'Failed';
  const row = (k, v) => `<tr><th>${k}</th><td>${esc(v)}</td></tr>`;
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Report - ${esc(d.testTitle)}</title><style>
body{font:14px/1.5 Arial,sans-serif;margin:32px;color:#111}h1{font-size:22px;margin:0 0 4px}h2{font-size:16px;margin:24px 0 8px;border-bottom:1px solid #888;padding-bottom:4px}
table{border-collapse:collapse;width:100%}td,th{border:1px solid #bbb;padding:6px 8px;text-align:left;vertical-align:top}th{background:#f1f1f1;width:30%}
</style></head><body>
<h1>${esc(d.testTitle)}</h1><div>${esc(d.description)}</div>
<h2>Test details</h2><table>${row('Student', d.userName + ' (' + d.userEmail + ')')}${row('Duration', d.durationMinutes + ' minutes')}${row('Maximum marks', d.maxMarks)}${row('Passing marks', d.passingMarks)}${row('Started', when(d.startedAt))}${row('Submitted', when(d.submittedAt))}</table>
<h2>Scores</h2><table>${row('Total score', d.totalScore + ' / ' + d.maxMarks)}${row('Result', result)}</table>
<h2>Scores by topic</h2><table><tr><th>Topic</th><th>Questions</th><th>Marks obtained</th></tr>${Object.entries(topics).map(([t, g]) => `<tr><td>${esc(t)}</td><td>${g.n}</td><td>${g.got} / ${g.max}${g.pending ? ' (' + g.pending + ' pending)' : ''}</td></tr>`).join('')}</table>
</body></html>`;
  const w = window.open('', '_blank');
  if (!w) { alert('Allow pop-ups for this site to print the report.'); return; }
  w.document.write(html); w.document.close(); w.focus(); setTimeout(() => w.print(), 300);
}