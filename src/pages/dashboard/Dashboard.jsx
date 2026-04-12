import "./Dashboard.css";
import { useEffect, useState } from "react";
import { getDashboardStats, getDashboardAlerts } from "../../services/dashboardService";
import {
  DollarSign,
  TrendingUp,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";
import StatCard from "../../components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { Link } from "react-router-dom";
import PageHeader from "../../components/shared/PageHeader";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-ZM", {
    style: "currency",
    currency: "ZMW",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value ?? 0);

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError(null);
        const [statsData, alertsData] = await Promise.all([
          getDashboardStats(),
          getDashboardAlerts(),
        ]);
        setStats(statsData);
        setAlerts(alertsData);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard.");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return <div className="dashboard-container"><div className="loading-state">Loading dashboard...</div></div>;
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div style={{ color: "#ef4444", padding: "2rem" }}>
          <strong>Failed to load dashboard:</strong> {error}
        </div>
      </div>
    );
  }

  const statusDistribution = [
    { name: "Active", value: Number(stats.active_loans), color: "#22c55e" },
    { name: "Due Soon", value: Number(stats.due_soon_loans), color: "#eab308" },
    { name: "Overdue", value: Number(stats.overdue_loans), color: "#ef4444" },
    { name: "Completed", value: Number(stats.completed_loans), color: "#64748b" },
    { name: "Defaulted", value: Number(stats.defaulted_loans), color: "#7f1d1d" },
  ];

  const portfolioBars = [
    { label: "Disbursed", amount: Number(stats.total_capital_lent) },
    { label: "Collected", amount: Number(stats.total_collected) },
    { label: "Outstanding", amount: Number(stats.total_outstanding_balance) },
    { label: "Available", amount: Number(stats.capital_available) },
  ];

  return (
    <div className="dashboard-container">
      <PageHeader
        title="Dashboard"
        subtitle="Operational overview of current lending activity"
      />

      <div className="dashboard-grid-4">
        <StatCard title="Total Disbursed" value={formatCurrency(stats.total_capital_lent)} icon={TrendingUp} iconColor="#2563eb" />
        <StatCard title="Total Collected" value={formatCurrency(stats.total_collected)} icon={DollarSign} iconColor="#15803d" />
        <StatCard title="Outstanding Balance" value={formatCurrency(stats.total_outstanding_balance)} icon={AlertTriangle} iconColor="#c2410c" />
        <StatCard title="Total Clients" value={Number(stats.total_clients)} icon={FileText} iconColor="#4338ca" />
      </div>

      <div className="dashboard-grid-3">
        <StatCard title="Due Soon" value={Number(stats.due_soon_loans)} icon={Clock} iconColor="text-yellow-600" />
        <StatCard title="Overdue" value={Number(stats.overdue_loans)} icon={AlertTriangle} iconColor="text-red-600" />
        <StatCard title="Defaulted" value={Number(stats.defaulted_loans)} icon={XCircle} iconColor="text-red-900" />
      </div>

      <div className="dashboard-grid-2 dashboard-panel-grid">
        <Card className="dashboard-panel">
          <CardHeader><CardTitle>Portfolio Totals</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={portfolioBars}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Bar dataKey="amount" fill="#0f766e" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="dashboard-panel">
          <CardHeader><CardTitle>Loan Status Distribution</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={statusDistribution} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {statusDistribution.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="dashboard-grid-2">
        <Card className="dashboard-panel">
          <CardHeader><CardTitle>Unread Notifications</CardTitle></CardHeader>
          <CardContent>
            {alerts.length === 0 ? (
              <div className="alerts-empty">
                <CheckCircle /> No active notifications
              </div>
            ) : (
              alerts.map((alert) => (
                <div key={alert.id} className="alert-item">
                  <Link to="/notifications">{alert.title}</Link>
                  <p>{alert.message}</p>
                  <p className="alert-due-soon">{alert.severity}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="dashboard-panel">
          <CardHeader><CardTitle>Quick Snapshot</CardTitle></CardHeader>
          <CardContent>
            <div className="alert-item">
              <p>Completed Loans</p>
              <strong>{Number(stats.completed_loans)}</strong>
            </div>
            <div className="alert-item">
              <p>Interest Earned</p>
              <strong>{formatCurrency(stats.total_interest_earned)}</strong>
            </div>
            <div className="alert-item">
              <p>Unread Alerts</p>
              <strong>{Number(stats.total_notifications)}</strong>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
