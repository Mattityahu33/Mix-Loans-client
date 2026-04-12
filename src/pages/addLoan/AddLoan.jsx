import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Calculator } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getClients } from '../../services/clientService';
import { createLoan, getLoanById, quoteLoan, updateLoan } from '../../services/loanService';
import { getSettings } from '../../services/settingsService';
import PageHeader from '../../components/shared/PageHeader';
import { formatCurrency } from '../../utils/loanHelper';
import './AddLoan.css';

const defaultForm = {
  clientId: '',
  amount: '',
  interestRate: '',
  interestType: 'Monthly',
  repaymentStructure: 'flat',
  duration: '',
  gracePeriod: '',
  collateralDescription: '',
  collateralValue: '',
  notes: '',
};

export default function AddLoan() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editLoanId = searchParams.get('editId');
  const isEditing = Boolean(editLoanId);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState(defaultForm);
  const [quote, setQuote] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [clientsData, settingsData, loanData] = await Promise.all([
          getClients(),
          getSettings(),
          isEditing ? getLoanById(editLoanId) : Promise.resolve(null),
        ]);
        setClients(clientsData);

        const baseData = {
          amount: String(settingsData.default_loan_amount ?? ''),
          interestRate: String(settingsData.default_interest_rate ?? ''),
          interestType: settingsData.default_interest_type ?? 'Monthly',
          gracePeriod: String(settingsData.default_grace_period ?? 7),
        };

        if (!loanData) {
          setFormData((prev) => ({ ...prev, ...baseData }));
          return;
        }

        setFormData((prev) => ({
          ...prev,
          ...baseData,
          clientId: String(loanData.clientId ?? ''),
          amount: String(loanData.amount ?? ''),
          interestRate: String(loanData.interestRate ?? ''),
          interestType: loanData.interestType ?? baseData.interestType,
          repaymentStructure: loanData.repaymentStructure ?? prev.repaymentStructure,
          duration: String(loanData.duration ?? ''),
          gracePeriod: String(loanData.gracePeriod ?? baseData.gracePeriod),
          collateralDescription:
            loanData.collateralDescription && loanData.collateralDescription !== '—'
              ? String(loanData.collateralDescription)
              : '',
          collateralValue: loanData.collateralValue ? String(loanData.collateralValue) : '',
          notes: loanData.notes ?? '',
        }));
      } catch (err) {
        console.error('[AddLoan] Failed to load loan form data', err);
        setError(
          err.response?.data?.message ||
            (isEditing ? 'Failed to load loan for editing' : 'Failed to load form data')
        );
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isEditing, editLoanId]);

  useEffect(() => {
    const shouldQuote =
      formData.amount &&
      formData.interestRate &&
      formData.duration &&
      formData.gracePeriod &&
      formData.interestType &&
      formData.repaymentStructure;

    if (!shouldQuote) {
      setQuote(null);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        const data = await quoteLoan({
          amount: Number(formData.amount),
          interest_rate: Number(formData.interestRate),
          interest_type: formData.interestType,
          repayment_structure: formData.repaymentStructure,
          duration: Number(formData.duration),
          grace_period: Number(formData.gracePeriod),
        });
        setQuote(data);
      } catch {
        setQuote(null);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [formData]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      const payload = {
        client_id: formData.clientId,
        amount: Number(formData.amount),
        interest_rate: Number(formData.interestRate),
        interest_type: formData.interestType,
        repayment_structure: formData.repaymentStructure,
        duration: Number(formData.duration),
        grace_period: Number(formData.gracePeriod),
        collateral_description: formData.collateralDescription || null,
        collateral_value: formData.collateralValue ? Number(formData.collateralValue) : null,
        notes: formData.notes || null,
      };

      if (isEditing) {
        await updateLoan(editLoanId, payload);
      } else {
        await createLoan(payload);
      }
      navigate('/loans');
    } catch (err) {
      console.error('[AddLoan] Failed to submit loan form', {
        isEditing,
        loanId: editLoanId,
        error: err,
      });
      setError(err.response?.data?.message || (isEditing ? 'Failed to update loan' : 'Failed to create loan'));
    } finally {
      setSubmitting(false);
    }
  };

  const clientOptions = useMemo(
    () =>
      clients.map((client) => (
        <option key={client.id} value={client.id}>
          {client.name} - {client.phone}
        </option>
      )),
    [clients]
  );

  if (loading) {
    return <div className="add-loan-container">Loading form data...</div>;
  }

  return (
    <div className="add-loan-container">
      <PageHeader
        title={isEditing ? `Edit Loan ${editLoanId}` : 'Add New Loan'}
        subtitle={
          isEditing
            ? 'Update this loan while preserving backend calculation rules.'
            : 'Create a backend-calculated loan record.'
        }
        actions={
          <button className="btn btn-outline" onClick={() => navigate('/loans')}>
            <ArrowLeft size={15} />
            Back to Loans
          </button>
        }
      />

      {error ? <div className="error-banner">{error}</div> : null}

      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Client Information</h3>
            </div>
            <div className="card-content card-content-spacing">
              <div className="input-group">
                <label className="form-label" htmlFor="client">
                  Select Client *
                </label>
                <select
                  className="form-select"
                  id="client"
                  value={formData.clientId}
                  onChange={(event) => handleInputChange('clientId', event.target.value)}
                  disabled={isEditing}
                  required
                >
                  <option value="">Choose a client</option>
                  {clientOptions}
                </select>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Loan Details</h3>
            </div>
            <div className="card-content card-content-spacing">
              <div className="grid-2-cols">
                <div className="input-group">
                  <label className="form-label" htmlFor="amount">
                    Loan Amount (ZMW) *
                  </label>
                  <input
                    className="input"
                    id="amount"
                    type="number"
                    value={formData.amount}
                    onChange={(event) => handleInputChange('amount', event.target.value)}
                    required
                  />
                </div>
                <div className="input-group">
                  <label className="form-label" htmlFor="interestRate">
                    Interest Rate (%) *
                  </label>
                  <input
                    className="input"
                    id="interestRate"
                    type="number"
                    step="0.01"
                    value={formData.interestRate}
                    onChange={(event) => handleInputChange('interestRate', event.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid-2-cols">
                <div className="input-group">
                  <label className="form-label" htmlFor="interestType">
                    Repayment Frequency *
                  </label>
                  <select
                    className="form-select"
                    id="interestType"
                    value={formData.interestType}
                    onChange={(event) => handleInputChange('interestType', event.target.value)}
                  >
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                  </select>
                </div>
                <div className="input-group">
                  <label className="form-label" htmlFor="repaymentStructure">
                    Repayment Structure *
                  </label>
                  <select
                    className="form-select"
                    id="repaymentStructure"
                    value={formData.repaymentStructure}
                    onChange={(event) => handleInputChange('repaymentStructure', event.target.value)}
                  >
                    <option value="flat">Flat</option>
                    <option value="reducing">Reducing</option>
                  </select>
                </div>
              </div>

              <div className="grid-2-cols">
                <div className="input-group">
                  <label className="form-label" htmlFor="duration">
                    Loan Duration *
                  </label>
                  <input
                    className="input"
                    id="duration"
                    type="number"
                    value={formData.duration}
                    onChange={(event) => handleInputChange('duration', event.target.value)}
                    required
                  />
                </div>
                <div className="input-group">
                  <label className="form-label" htmlFor="gracePeriod">
                    Grace Period (days) *
                  </label>
                  <input
                    className="input"
                    id="gracePeriod"
                    type="number"
                    value={formData.gracePeriod}
                    onChange={(event) => handleInputChange('gracePeriod', event.target.value)}
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Collateral Information</h3>
            </div>
            <div className="card-content card-content-spacing">
              <div className="input-group">
                <label className="form-label" htmlFor="collateralDescription">
                  Collateral Description
                </label>
                <textarea
                  className="form-textarea"
                  id="collateralDescription"
                  value={formData.collateralDescription}
                  onChange={(event) => handleInputChange('collateralDescription', event.target.value)}
                  rows={3}
                />
              </div>
              <div className="input-group">
                <label className="form-label" htmlFor="collateralValue">
                  Estimated Collateral Value (ZMW)
                </label>
                <input
                  className="input"
                  id="collateralValue"
                  type="number"
                  value={formData.collateralValue}
                  onChange={(event) => handleInputChange('collateralValue', event.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Additional Notes</h3>
            </div>
            <div className="card-content">
              <textarea
                className="form-textarea"
                id="notes"
                value={formData.notes}
                onChange={(event) => handleInputChange('notes', event.target.value)}
                rows={4}
              />
            </div>
          </div>

          {quote ? (
            <div className="card preview-card">
              <div className="card-header">
                <h3 className="card-title preview-title">
                  <Calculator className="icon-medium" />
                  Backend Quote Preview
                </h3>
              </div>
              <div className="card-content">
                <div className="grid-3-cols">
                  <div>
                    <p className="preview-label">Total Interest</p>
                    <p className="preview-value">{formatCurrency(quote.totalInterest)}</p>
                  </div>
                  <div>
                    <p className="preview-label">Total Repayment</p>
                    <p className="preview-value">{formatCurrency(quote.totalRepayment)}</p>
                  </div>
                  <div>
                    <p className="preview-label">Due Date</p>
                    <p className="preview-value-small">{quote.dueDate}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          <div className="action-buttons">
            <button type="button" className="btn btn-outline" onClick={() => navigate('/loans')}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? (isEditing ? 'Updating...' : 'Creating...') : isEditing ? 'Update Loan' : 'Create Loan'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
