const BASE = '/api'; // always go through the Vite proxy (see vite.config.js)
export async function api(path, method = 'GET', body) {
  const t = JSON.parse(localStorage.getItem('auth') || 'null')?.token;
  let res;
  try { res = await fetch(BASE + path, { method, headers: { 'Content-Type': 'application/json', ...(t ? { Authorization: 'Bearer ' + t } : {}) }, body: body !== undefined ? JSON.stringify(body) : undefined }); }
  catch { throw new Error('Cannot reach the server. Is the backend running on port 8080?'); }
  if (res.status === 401 && t && !path.startsWith('/auth')) { localStorage.removeItem('auth'); location.href = '/login'; }
  const data = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || 'Request failed (' + res.status + ')');
  return data;
}