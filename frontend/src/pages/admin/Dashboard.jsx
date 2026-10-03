import { api } from '../../services/api';
import useLoad from '../../hooks/useLoad';
import { Page, Card } from '../../components/UI';
export default function Dashboard() {
  const { data, error, loading } = useLoad(async () => { const [t, s, u] = await Promise.all([api('/admin/tests'), api('/admin/submissions'), api('/admin/users')]); return { t, s, u }; });
  return <Page title="Admin Dashboard" error={error} loading={loading}>{data && <div className="cards">
    <Card n={data.t.length} l={`Tests (${data.t.filter(t => t.published).length} published)`} to="/admin/tests" />
    <Card n={data.s.filter(s => s.status === 'PENDING_EVALUATION').length} l="Pending evaluation" to="/admin/submissions" />
    <Card n={data.s.length} l="Total submissions" to="/admin/submissions" />
    <Card n={data.u.length} l="Registered students" to="/admin/users" /></div>}</Page>;
}
