import { Link } from 'react-router-dom';
export const Badge = ({ s }) => (s ? <span className={'badge ' + s}>{String(s).replaceAll('_', ' ')}</span> : '-');
export const Flash = ({ m }) => (m ? <div className="msg ok">{m}</div> : null);
export const Card = ({ n, l, to }) => <Link to={to} className="card"><b>{n}</b><span>{l}</span></Link>;
export function Page({ title, error, loading, actions, children }) {
  return <div><div className="bar"><h2>{title}</h2><div className="row">{actions}</div></div>
    {error && <div className="msg err">{error}</div>}{loading ? <p>Loading…</p> : children}</div>;
}
