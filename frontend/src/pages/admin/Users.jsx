import { api } from '../../services/api';
import useLoad from '../../hooks/useLoad';
import { Page } from '../../components/UI';
export default function Users() {
  const { data, error, loading } = useLoad(() => api('/admin/users'));
  return <Page title="Registered Students" error={error} loading={loading}>{data && <div className="scroll"><table><thead><tr><th>ID</th><th>Name</th><th>Email</th></tr></thead>
    <tbody>{data.map(u => <tr key={u.id}><td>{u.id}</td><td>{u.name}</td><td>{u.email}</td></tr>)}</tbody></table></div>}</Page>;
}
