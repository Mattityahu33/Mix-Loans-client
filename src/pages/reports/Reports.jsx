import { useEffect, useState } from 'react';
import { getReportSummary } from '../../services/dashboardService';
import StatCard from '../../components/StatCard';
import {
  BarChart,
  Bar,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  LineChart,
  Line,
} from 'recharts';
import { formatCurrency } from '../../utils/loanHelper';
import PageHeader from '../../components/shared/PageHeader';
import './Reports.css';

export default function Reports() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        setReport(await getReportSummary());
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load report data');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, []);

  if (loading) return <div className="reports-container">Loading reports...</div>;
  if (error) return <div className="reports-container" style={{ color: 'red' }}>{error}</div>;

  const { summary, monthly } = report;

  return (
    <div className="reports-container">
      <PageHeader
        title="Financial Reports"
        subtitle="Live reporting data based on current loan and payment records."
      />

      <div className="reports-stats-grid-4">
        <StatCard title="Total Disbursed" value={formatCurrency(summary.total_disbursed)} trend={{ value: 'Capital deployed', isPositive: true }} />
        <StatCard title="Total Collected" value={formatCurrency(summary.total_collected)} trend={{ value: 'Cash-in portfolio', isPositive: true }} />
        <StatCard title="Expected Payments" value={formatCurrency(summary.expected_payments)} />
        <StatCard title="Received Payments" value={formatCurrency(summary.received_payments)} />
      </div>

      <div className="reports-stats-grid-4">
        <StatCard title="Active Loans" value={summary.active_loans} />
        <StatCard title="Overdue Loans" value={summary.overdue_loans} />
        <StatCard title="Completed Loans" value={summary.completed_loans} />
        <StatCard title="Collection Gap" value={formatCurrency(summary.expected_payments - summary.received_payments)} />
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Monthly Disbursement vs Collection</h3>
        </div>
        <div className="card-content">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Bar dataKey="total_disbursed" fill="#0f766e" name="Disbursed" />
              <Bar dataKey="total_collected" fill="#f59e0b" name="Collected" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Expected Interest Trend</h3>
        </div>
        <div className="card-content">
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Line type="monotone" dataKey="expected_interest" stroke="#2563eb" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
