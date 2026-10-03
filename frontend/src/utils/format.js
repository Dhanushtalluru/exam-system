export const fmt = d => (d ? new Date(d).toLocaleString() : '-');
export const clock = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
