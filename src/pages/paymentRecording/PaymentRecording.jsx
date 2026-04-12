import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Calendar, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getLoans } from '../../services/loanService';
import { createPayment, getPaymentsByLoan } from '../../services/paymentService';
import StatusBadge from '../../components/StatusBadge';
import PageHeader from '../../components/shared/PageHeader';
import ResponsiveDataTable from '../../components/shared/ResponsiveDataTable';
import { formatCurrency, formatDate } from '../../utils/loanHelper';
import './PaymentRecording.css';

export default function PaymentRecording() {
  const navigate = useNavigate();
  const [loans, setLoans] = useState([]);
  const [selectedLoanId, setSelectedLoanId] = useState('');
  const [loanPayments, setLoanPayments] = useState([]);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLoans = async () => {
      try {
        setLoading(true);
        const data = await getLoans();
        setLoans(data.filter((loan) => ['Active', 'Due Soon', 'Overdue'].includes(loan.status)));
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load active loans');
      } finally {
        setLoading(false);
      }
    };
    fetchLoans();
  }, []);

  useEffect(() => {
    if (!selectedLoanId) {
      setLoanPayments([]);
      return;
    }
    const fetchHistory = async () => {
      try {
        const history = await getPaymentsByLoan(selectedLoanId);
        setLoanPayments(history);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load payment history');
      }
    };
    fetchHistory();
  }, [selectedLoanId]);

  const selectedLoan = useMemo(
    () => loans.find((loan) => String(loan.id) === String(selectedLoanId)),
    [loans, selectedLoanId]
  );

  const paymentValue = Number(paymentAmount || 0);
  const previewOutstanding = selectedLoan
    ? Math.max(0, Number(selectedLoan.remainingBalance) + Number(selectedLoan.penaltyBalance || 0) - paymentValue)
    : 0;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedLoanId || !paymentAmount) {
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await createPayment({
        loan_id: selectedLoanId,
        amount: paymentValue,
        payment_date: paymentDate,
        notes: notes || null,
      });
      navigate('/payment-history');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record payment');
    } finally {
      setSubmitting(false);
    }
  };

  const paymentColumns = [
    { header: 'Payment Date', render: (payment) => formatDate(payment.paymentDate) },
    { header: 'Amount Paid', render: (payment) => <span className="amount-cell">{formatCurrency(payment.amount)}</span> },
    { header: 'Principal', render: (payment) => formatCurrency(payment.principalAmount) },
    { header: 'Penalty', render: (payment) => formatCurrency(payment.penaltyAmount) },
    { header: 'Resulting Balance', render: (payment) => formatCurrency(payment.resultingBalance) },
  ];

  if (loading) {
    return <div className="payment-recording-container">Loading loans...</div>;
  }

  return (
    <div className="payment-recording-container">
      <PageHeader
        title="Record Payment"
        subtitle="Post payments against active loans while preserving backend allocation rules."
        actions={
          <button className="btn btn-outline" onClick={() => navigate('/loans')}>
            <ArrowLeft size={15} />
            Back to Loans
          </button>
        }
      />

      {error ? <div className="error-banner">{error}</div> : null}

      <form onSubmit={handleSubmit}>
        <div className="form-container">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Payment Information</h3>
            </div>
            <div className="card-content payment-card-content">
              <div className="form-group">
                <label className="form-label" htmlFor="loan">
                  Select Loan *
                </label>
                <select
                  className="form-select"
                  id="loan"
                  value={selectedLoanId}
                  onChange={(event) => setSelectedLoanId(event.target.value)}
                >
                  <option value="">Choose a loan to record payment</option>
                  {loans.map((loan) => (
                    <option key={loan.id} value={loan.id}>
                      {loan.id} - {loan.clientName} - Outstanding:{' '}
                      {formatCurrency(loan.remainingBalance + (loan.penaltyBalance || 0))}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid-2-cols">
                <div className="form-group">
                  <label className="form-label" htmlFor="amount">
                    Payment Amount (ZMW) *
                  </label>
                  <div className="input-wrapper">
                    <DollarSign className="input-icon" />
                    <input
                      id="amount"
                      type="number"
                      step="0.01"
                      className="input input-with-icon"
                      value={paymentAmount}
                      onChange={(event) => setPaymentAmount(event.target.value)}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="date">
                    Payment Date *
                  </label>
                  <div className="input-wrapper">
                    <Calendar className="input-icon" />
                    <input
                      id="date"
                      type="date"
                      className="input input-with-icon"
                      value={paymentDate}
                      onChange={(event) => setPaymentDate(event.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="notes">
                  Notes
                </label>
                <textarea
                  id="notes"
                  className="form-textarea"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  rows={3}
                />
              </div>
            </div>
          </div>

          {selectedLoan ? (
            <>
              <div className="card loan-preview-card">
                <div className="card-header">
                  <h3 className="card-title loan-preview-title">Selected Loan Details</h3>
                </div>
                <div className="card-content loan-preview-content">
                  <div className="grid-3-cols">
                    <div>
                      <p className="loan-preview-label">Client</p>
                      <p className="loan-preview-value">{selectedLoan.clientName}</p>
                    </div>
                    <div>
                      <p className="loan-preview-label">Loan Amount</p>
                      <p className="loan-preview-value">{formatCurrency(selectedLoan.amount)}</p>
                    </div>
                    <div>
                      <p className="loan-preview-label">Status</p>
                      <StatusBadge status={selectedLoan.status} />
                    </div>
                  </div>

                  <div className="grid-3-cols">
                    <div>
                      <p className="loan-preview-label">Principal Balance</p>
                      <p className="loan-preview-value">{formatCurrency(selectedLoan.remainingBalance)}</p>
                    </div>
                    <div>
                      <p className="loan-preview-label">Penalty Balance</p>
                      <p className="balance-value">{formatCurrency(selectedLoan.penaltyBalance || 0)}</p>
                    </div>
                    <div>
                      <p className="loan-preview-label">Due Date</p>
                      <p className="loan-preview-value">{formatDate(selectedLoan.dueDate)}</p>
                    </div>
                  </div>

                  <div className="progress-section">
                    <p className="loan-preview-label">Current Progress</p>
                    <div className="progress-bar">
                      <span style={{ width: `${selectedLoan.progress}%` }} />
                    </div>
                    <p className="progress-text">{selectedLoan.progress.toFixed(1)}% paid</p>
                  </div>
                </div>
              </div>

              {paymentValue > 0 ? (
                <div className="card payment-preview-card">
                  <div className="card-header">
                    <h3 className="card-title payment-preview-title">Payment Preview</h3>
                  </div>
                  <div className="card-content payment-preview-content">
                    <div className="grid-3-cols">
                      <div>
                        <p className="payment-preview-label">Payment Amount</p>
                        <p className="payment-amount-value">{formatCurrency(paymentValue)}</p>
                      </div>
                      <div>
                        <p className="payment-preview-label">Estimated Outstanding</p>
                        <p className="remaining-balance-value">{formatCurrency(previewOutstanding)}</p>
                      </div>
                      <div>
                        <p className="payment-preview-label">Backend Rule</p>
                        <p className="new-status-value">Server validates final balances</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Payment History</h3>
                </div>
                <div className="card-content">
                  <ResponsiveDataTable
                    columns={paymentColumns}
                    data={loanPayments}
                    rowKey={(payment) => payment.id}
                    emptyTitle="No payment history available"
                    emptyMessage="Payments posted for this loan will appear here."
                    getMobileSummary={(payment) => ({
                      title: `${formatCurrency(payment.amount)} paid`,
                      subtitle: formatDate(payment.paymentDate),
                    })}
                    getMobileDetails={(payment) => [
                      { label: 'Principal', value: formatCurrency(payment.principalAmount) },
                      { label: 'Penalty', value: formatCurrency(payment.penaltyAmount) },
                      { label: 'Resulting Balance', value: formatCurrency(payment.resultingBalance) },
                    ]}
                  />
                </div>
              </div>
            </>
          ) : null}

          <div className="action-buttons">
            <button type="button" className="btn btn-outline" onClick={() => navigate('/loans')}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary submit-button"
              disabled={submitting || !selectedLoanId || paymentValue <= 0}
            >
              <DollarSign className="button-icon" />
              {submitting ? 'Recording...' : 'Record Payment'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
