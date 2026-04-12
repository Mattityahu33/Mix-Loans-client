import { useEffect, useMemo, useState } from 'react';
import { Filter, Search } from 'lucide-react';
import { getPayments } from '../../services/paymentService';
import PageHeader from '../../components/shared/PageHeader';
import ResponsiveDataTable from '../../components/shared/ResponsiveDataTable';
import './PaymentHistory.css';

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-ZM', {
    style: 'currency',
    currency: 'ZMW',
    minimumFractionDigits: 2,
  }).format(amount);

const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

export default function PaymentHistory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getPayments();
        setPayments(data);
      } catch {
        setError('Failed to load payment history from server.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredRecords = useMemo(
    () =>
      payments.filter((record) => {
        const searchLower = searchTerm.toLowerCase();
        const clientName = record.clientName || '';
        const matchesSearch =
          clientName.toLowerCase().includes(searchLower) ||
          String(record.loanId).toLowerCase().includes(searchLower) ||
          String(record.id).toLowerCase().includes(searchLower) ||
          (record.notes && record.notes.toLowerCase().includes(searchLower));
        const matchesFilter =
          statusFilter === 'All' || (record.loanStatus && record.loanStatus === statusFilter);
        return matchesSearch && matchesFilter;
      }),
    [payments, searchTerm, statusFilter]
  );

  const summaryStats = useMemo(() => {
    const totalReceived = payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
    return { totalReceived };
  }, [payments]);

  const columns = [
    { header: 'Reference ID', render: (record) => <span className="cell-bold">{record.paymentCode || record.id}</span> },
    { header: 'Client Name', render: (record) => record.clientName },
    { header: 'Loan', render: (record) => record.loanCode || record.loanId },
    { header: 'Amount Paid', render: (record) => <span className="amount-paid">{formatCurrency(record.amount)}</span> },
    {
      header: 'Payment Date',
      render: (record) => (
        <div className="date-cell">
          <span>{formatDate(record.paymentDate)}</span>
          {record.notes ? <small>{record.notes}</small> : null}
        </div>
      ),
    },
  ];

  return (
    <div className="payment-history-page">
      <PageHeader
        title="Payment History"
        subtitle="Track and audit all posted loan payments."
      />

      {error ? <div className="error-banner">{error}</div> : null}

      <div className="payment-history-summary">
        <div className="payment-history-card">
          <h3 className="summary-card-title">Total Payments Received</h3>
          <p className="summary-card-value">{formatCurrency(summaryStats.totalReceived)}</p>
        </div>
      </div>

      <div className="card">
        <div className="card-content">
          <div className="payment-history-controls">
            <div className="control-field">
              <Search className="control-icon" />
              <input
                type="text"
                placeholder="Search by Client, Loan ID, Reference..."
                className="input control-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="control-field control-field-select">
              <Filter className="control-icon" />
              <select
                className="form-select control-input"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Payments</option>
                <option value="Active">Active</option>
                <option value="Due Soon">Due Soon</option>
                <option value="Overdue">Overdue</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Transactions ({filteredRecords.length})</h3>
        </div>
        <div className="card-content">
          <ResponsiveDataTable
            columns={columns}
            data={filteredRecords}
            loading={loading}
            rowKey={(record) => record.id}
            emptyTitle="No payment history found"
            emptyMessage="Try adjusting your search or filters."
            getMobileSummary={(record) => ({
              title: record.clientName,
              subtitle: `${record.paymentCode || record.id} • ${formatCurrency(record.amount)}`,
            })}
            getMobileDetails={(record) => [
              { label: 'Loan', value: record.loanCode || record.loanId },
              { label: 'Date', value: formatDate(record.paymentDate) },
              { label: 'Notes', value: record.notes || '—' },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
