import { useEffect, useMemo, useState } from 'react';
import { BanknoteArrowDown, CirclePlus, Eye, Pencil } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getLoans } from '../../services/loanService';
import StatusBadge from '../../components/StatusBadge';
import { formatCurrency, formatDate } from '../../utils/loanHelper';
import PageHeader from '../../components/shared/PageHeader';
import ResponsiveDataTable from '../../components/shared/ResponsiveDataTable';
import './Loan.css';

export default function Loans() {
  const navigate = useNavigate();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchLoans = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getLoans();
        setLoans(data);
      } catch (err) {
        setError(
          err.response?.data?.error ??
            err.message ??
            'Failed to load loans. Make sure the server is running.'
        );
      } finally {
        setLoading(false);
      }
    };
    fetchLoans();
  }, []);

  const filteredLoans = useMemo(
    () =>
      loans.filter((loan) => {
        const term = searchTerm.toLowerCase();
        const matchesSearch =
          String(loan.id).toLowerCase().includes(term) ||
          String(loan.clientName).toLowerCase().includes(term) ||
          String(loan.clientId).toLowerCase().includes(term);
        const matchesStatus = statusFilter === 'all' || loan.status === statusFilter;
        return matchesSearch && matchesStatus;
      }),
    [loans, searchTerm, statusFilter]
  );

  const handleViewLoan = (loan) => {
    setSelectedLoan(loan);
    setIsViewDialogOpen(true);
  };

  const getTimelineDotClass = (status) => {
    if (status === 'Completed') return 'timeline-dot timeline-dot-green';
    if (status === 'Overdue' || status === 'Defaulted') return 'timeline-dot timeline-dot-red';
    return 'timeline-dot timeline-dot-yellow';
  };

  const columns = [
    { header: 'Loan ID', render: (loan) => <span className="cell-bold">{loan.id}</span> },
    { header: 'Client', render: (loan) => loan.clientName },
    { header: 'Amount', render: (loan) => formatCurrency(loan.amount) },
    {
      header: 'Interest',
      render: (loan) => (
        <div className="interest-cell">
          <strong>{loan.interestRate}%</strong>
          <span>{loan.interestType}</span>
        </div>
      ),
    },
    { header: 'Total Repayment', render: (loan) => formatCurrency(loan.totalRepayment) },
    {
      header: 'Remaining',
      render: (loan) => (
        <span className={loan.remainingBalance > 0 ? 'balance-positive' : 'balance-zero'}>
          {formatCurrency(loan.remainingBalance)}
        </span>
      ),
    },
    {
      header: 'Progress',
      render: (loan) => (
        <div className="progress-cell">
          <div className="progress-bar-track">
            <div
              className={`progress-bar-fill ${loan.progress >= 100 ? 'progress-bar-fill-complete' : ''}`}
              style={{ width: `${Math.min(loan.progress, 100)}%` }}
            />
          </div>
          <span className="progress-text">{loan.progress.toFixed(0)}%</span>
        </div>
      ),
    },
    { header: 'Start Date', render: (loan) => formatDate(loan.startDate) },
    {
      header: 'Due Date',
      render: (loan) => (
        <div className="due-date-cell">
          <span>{formatDate(loan.dueDate)}</span>
          {loan.status === 'Overdue' ? (
            <small className="due-date-overdue">{loan.daysOverdue}d overdue</small>
          ) : loan.status === 'Due Soon' || (loan.status === 'Active' && loan.daysUntilDue <= 7) ? (
            <small className="due-date-soon">{loan.daysUntilDue}d remaining</small>
          ) : null}
        </div>
      ),
    },
    { header: 'Status', render: (loan) => <StatusBadge status={loan.status} /> },
  ];

  return (
    <div className="loans-container">
      <PageHeader
        title="Loan Management"
        subtitle="Track all active, due, overdue and completed portfolio loans."
        actions={
          <>
            <button className="btn btn-outline" onClick={() => navigate('/loans/payment')}>
              <BanknoteArrowDown size={15} />
              Record Payment
            </button>
            <button className="btn btn-primary" onClick={() => navigate('/loans/add')}>
              <CirclePlus size={15} />
              Add Loan
            </button>
          </>
        }
      />

      {error ? <div className="error-banner">{error}</div> : null}

      <div className="card">
        <div className="card-content">
          <div className="filter-row">
            <div className="filter-row-fill">
              <input
                className="input"
                placeholder="Search by loan ID or client name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="filter-select-wrapper">
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Due Soon">Due Soon</option>
                <option value="Overdue">Overdue</option>
                <option value="Completed">Completed</option>
                <option value="Defaulted">Defaulted</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">All Loans ({filteredLoans.length})</h3>
        </div>
        <div className="card-content">
          <ResponsiveDataTable
            columns={columns}
            data={filteredLoans}
            loading={loading}
            rowKey={(loan) => String(loan.id)}
            emptyTitle="No loans found"
            emptyMessage={
              searchTerm || statusFilter !== 'all'
                ? 'No loans match your current filters.'
                : 'No loans are currently available.'
            }
            renderActions={(loan) => (
              <div className="actions-cell">
                <button className="btn btn-outline btn-sm" onClick={() => handleViewLoan(loan)}>
                  <Eye size={14} />
                </button>
                <button className="btn btn-outline btn-sm" onClick={() => navigate(`/loans/add?editId=${loan.id}`)}>
                  <Pencil size={14} />
                </button>
              </div>
            )}
            getMobileSummary={(loan) => ({
              title: `${loan.id} • ${loan.clientName}`,
              subtitle: `${formatCurrency(loan.amount)} | ${loan.interestRate}% ${loan.interestType}`,
              badge: <StatusBadge status={loan.status} />,
            })}
            getMobileDetails={(loan) => [
              { label: 'Remaining', value: formatCurrency(loan.remainingBalance) },
              { label: 'Progress', value: `${loan.progress.toFixed(0)}%` },
              { label: 'Start Date', value: formatDate(loan.startDate) },
              { label: 'Due Date', value: formatDate(loan.dueDate) },
              { label: 'Client ID', value: loan.clientId },
            ]}
          />
        </div>
      </div>

      {isViewDialogOpen ? (
        <div className="modal-overlay" onClick={() => setIsViewDialogOpen(false)}>
          <div className="modal-content modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Loan Details - {selectedLoan?.id}</h2>
            </div>
            {selectedLoan ? (
              <div className="modal-body">
                <div className="detail-sections">
                  <div className="overview-grid">
                    <div className="card">
                      <div className="card-content card-content-pt">
                        <p className="overview-stat-label">Loan Amount</p>
                        <p className="overview-stat-value">{formatCurrency(selectedLoan.amount)}</p>
                      </div>
                    </div>
                    <div className="card">
                      <div className="card-content card-content-pt">
                        <p className="overview-stat-label">Total Repayment</p>
                        <p className="overview-stat-value">{formatCurrency(selectedLoan.totalRepayment)}</p>
                      </div>
                    </div>
                    <div className="card">
                      <div className="card-content card-content-pt">
                        <p className="overview-stat-label">Remaining Balance</p>
                        <p className="overview-stat-value overview-stat-value-orange">
                          {formatCurrency(selectedLoan.remainingBalance)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="card">
                    <div className="card-header">
                      <h3 className="card-title">Loan Progress</h3>
                    </div>
                    <div className="card-content">
                      <div className="loan-progress-section">
                        <div className="progress-bar-track-lg">
                          <div
                            className="progress-bar-fill-lg"
                            style={{ width: `${Math.min(selectedLoan.progress, 100)}%` }}
                          />
                        </div>
                        <div className="progress-labels">
                          <span>
                            Paid:{' '}
                            {formatCurrency(
                              selectedLoan.totalRepayment - selectedLoan.remainingBalance
                            )}
                          </span>
                          <span>{selectedLoan.progress.toFixed(1)}%</span>
                          <span>Remaining: {formatCurrency(selectedLoan.remainingBalance)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="card">
                    <div className="card-header">
                      <h3 className="card-title">Loan Information</h3>
                    </div>
                    <div className="card-content">
                      <div className="detail-grid">
                        <div>
                          <p className="detail-label">Client Name</p>
                          <p className="detail-value">{selectedLoan.clientName}</p>
                        </div>
                        <div>
                          <p className="detail-label">Client ID</p>
                          <p className="detail-value">{selectedLoan.clientId}</p>
                        </div>
                        <div>
                          <p className="detail-label">Status</p>
                          <div className="detail-status-wrap">
                            <StatusBadge status={selectedLoan.status} />
                          </div>
                        </div>
                        <div>
                          <p className="detail-label">Interest Rate</p>
                          <p className="detail-value">
                            {selectedLoan.interestRate}% {selectedLoan.interestType}
                          </p>
                        </div>
                        <div>
                          <p className="detail-label">Total Interest</p>
                          <p className="detail-value">{formatCurrency(selectedLoan.totalInterest)}</p>
                        </div>
                        <div>
                          <p className="detail-label">Start Date</p>
                          <p className="detail-value">{formatDate(selectedLoan.startDate)}</p>
                        </div>
                        <div>
                          <p className="detail-label">Due Date</p>
                          <p className="detail-value">{formatDate(selectedLoan.dueDate)}</p>
                        </div>
                        <div>
                          <p className="detail-label">Grace Period End</p>
                          <p className="detail-value">{formatDate(selectedLoan.gracePeriodEndDate)}</p>
                        </div>
                        <div>
                          <p className="detail-label">Duration</p>
                          <p className="detail-value">
                            {selectedLoan.duration}{' '}
                            {selectedLoan.interestType === 'Weekly' ? 'weeks' : 'months'}
                          </p>
                        </div>
                        {selectedLoan.notes ? (
                          <div className="detail-col-span-2">
                            <p className="detail-label">Notes</p>
                            <p className="detail-value">{selectedLoan.notes}</p>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="card">
                    <div className="card-header">
                      <h3 className="card-title">Collateral Information</h3>
                    </div>
                    <div className="card-content">
                      <div className="detail-grid">
                        <div>
                          <p className="detail-label">Description</p>
                          <p className="detail-value">{selectedLoan.collateralDescription}</p>
                        </div>
                        <div>
                          <p className="detail-label">Estimated Value</p>
                          <p className="detail-value">{formatCurrency(selectedLoan.collateralValue)}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="card">
                    <div className="card-header">
                      <h3 className="card-title">Timeline</h3>
                    </div>
                    <div className="card-content">
                      <div className="timeline-section">
                        <div className="timeline-entry">
                          <div className="timeline-dot timeline-dot-green"></div>
                          <div className="timeline-content">
                            <p>Loan Started</p>
                            <p>{formatDate(selectedLoan.startDate)}</p>
                          </div>
                        </div>
                        <div className="timeline-line"></div>
                        <div className="timeline-entry">
                          <div className={getTimelineDotClass(selectedLoan.status)}></div>
                          <div className="timeline-content">
                            <p>Current Status: {selectedLoan.status}</p>
                            <p>
                              {selectedLoan.status === 'Completed'
                                ? 'Loan fully repaid'
                                : selectedLoan.status === 'Overdue'
                                  ? `${selectedLoan.daysOverdue} days overdue`
                                  : selectedLoan.status === 'Defaulted'
                                    ? 'Loan defaulted'
                                    : `${selectedLoan.daysUntilDue} days remaining`}
                            </p>
                          </div>
                        </div>
                        {selectedLoan.status !== 'Completed' && selectedLoan.status !== 'Defaulted' ? (
                          <>
                            <div className="timeline-line"></div>
                            <div className="timeline-entry">
                              <div className="timeline-dot timeline-dot-gray"></div>
                              <div className="timeline-content">
                                <p>Due Date</p>
                                <p>{formatDate(selectedLoan.dueDate)}</p>
                              </div>
                            </div>
                          </>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setIsViewDialogOpen(false)}>
                Close
              </button>
              <button className="btn btn-primary" onClick={() => navigate('/loans/payment')}>
                <BanknoteArrowDown size={14} />
                Record Payment
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
