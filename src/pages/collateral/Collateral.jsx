import { useEffect, useMemo, useState } from 'react';
import { Eye, Package, Pencil, Plus, Trash2 } from 'lucide-react';
import {
  createCollateral,
  deleteCollateral,
  getCollaterals,
  updateCollateral,
} from '../../services/collateralService';
import PageHeader from '../../components/shared/PageHeader';
import ResponsiveDataTable from '../../components/shared/ResponsiveDataTable';
import StatusBadge from '../../components/StatusBadge';
import { formatCurrency } from '../../utils/loanHelper';
import './Collateral.css';

const collateralBadgeClass = (status) => {
  if (status === 'Returned') return 'collateral-badge returned';
  if (status === 'Forfeited') return 'collateral-badge forfeited';
  if (status === 'Sold') return 'collateral-badge sold';
  return 'collateral-badge held';
};

export default function CollateralPage() {
  const [collateralItems, setCollateralItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCollateral, setSelectedCollateral] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [formData, setFormData] = useState({
    id: '',
    loan_id: '',
    description: '',
    estimated_value: '',
    collateral_status: 'Held',
  });

  const loadCollateral = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCollaterals();
      setCollateralItems(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load collateral from the server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCollateral();
  }, []);

  const filteredCollateral = useMemo(
    () =>
      collateralItems.filter((item) => {
        const term = searchTerm.toLowerCase();
        const matchesSearch =
          String(item.loanId).toLowerCase().includes(term) ||
          item.clientName.toLowerCase().includes(term) ||
          item.description.toLowerCase().includes(term);
        const matchesStatus = statusFilter === 'all' || item.collateralStatus === statusFilter;
        return matchesSearch && matchesStatus;
      }),
    [collateralItems, searchTerm, statusFilter]
  );

  const handleViewCollateral = (collateral) => {
    setSelectedCollateral(collateral);
    setIsViewDialogOpen(true);
  };

  const openCreateDialog = () => {
    setIsEditing(false);
    setFormData({
      id: '',
      loan_id: '',
      description: '',
      estimated_value: '',
      collateral_status: 'Held',
    });
    setIsFormDialogOpen(true);
  };

  const openEditDialog = (collateral) => {
    setIsEditing(true);
    setSelectedCollateral(collateral);
    setFormData({
      id: collateral.id,
      loan_id: collateral.loanId,
      description: collateral.description,
      estimated_value: String(collateral.estimatedValue),
      collateral_status: collateral.collateralStatus,
    });
    setIsFormDialogOpen(true);
  };

  const handleSaveCollateral = async () => {
    try {
      if (isEditing) {
        await updateCollateral(selectedCollateral.id, {
          description: formData.description,
          estimated_value: Number(formData.estimated_value),
          collateral_status: formData.collateral_status,
        });
      } else {
        await createCollateral({
          id: formData.id,
          loan_id: formData.loan_id,
          description: formData.description,
          estimated_value: Number(formData.estimated_value),
          collateral_status: formData.collateral_status,
        });
      }
      setIsFormDialogOpen(false);
      await loadCollateral();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save collateral');
    }
  };

  const handleDeleteCollateral = async (item) => {
    if (!window.confirm(`Delete collateral ${item.id}?`)) {
      return;
    }
    try {
      await deleteCollateral(item.id);
      await loadCollateral();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete collateral');
    }
  };

  const collateralStats = {
    held: collateralItems.filter((c) => c.collateralStatus === 'Held').length,
    returned: collateralItems.filter((c) => c.collateralStatus === 'Returned').length,
    forfeited: collateralItems.filter((c) => c.collateralStatus === 'Forfeited').length,
    sold: collateralItems.filter((c) => c.collateralStatus === 'Sold').length,
    totalValue: collateralItems
      .filter((c) => c.collateralStatus === 'Held')
      .reduce((sum, c) => sum + c.estimatedValue, 0),
  };

  const columns = [
    { header: 'Loan ID', render: (item) => <span className="cell-bold">{item.loanId}</span> },
    { header: 'Client Name', render: (item) => item.clientName },
    {
      header: 'Collateral Description',
      render: (item) => <span className="description-cell">{item.description}</span>,
    },
    { header: 'Estimated Value', render: (item) => formatCurrency(item.estimatedValue) },
    { header: 'Loan Status', render: (item) => <StatusBadge status={item.loanStatus} /> },
    {
      header: 'Collateral Status',
      render: (item) => (
        <span className={collateralBadgeClass(item.collateralStatus)}>{item.collateralStatus}</span>
      ),
    },
  ];

  return (
    <div className="collateral-container">
      <PageHeader
        title="Collateral Registry"
        subtitle="Track collateral valuation and legal status by linked loan."
        actions={
          <button className="btn btn-primary" onClick={openCreateDialog}>
            <Plus size={15} />
            Add Collateral
          </button>
        }
      />

      {error ? <div className="error-banner">{error}</div> : null}

      <div className="collateral-stats-grid">
        <div className="card">
          <div className="card-content card-content-pt">
            <div className="stat-row">
              <Package className="stat-icon" />
              <div>
                <p className="stat-number">{collateralStats.held}</p>
                <p className="stat-label">Held</p>
              </div>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-content card-content-pt">
            <div className="stat-row">
              <Package className="stat-icon green" />
              <div>
                <p className="stat-number">{collateralStats.returned}</p>
                <p className="stat-label">Returned</p>
              </div>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-content card-content-pt">
            <div className="stat-row">
              <Package className="stat-icon red" />
              <div>
                <p className="stat-number">{collateralStats.forfeited}</p>
                <p className="stat-label">Forfeited</p>
              </div>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-content card-content-pt">
            <div className="stat-row">
              <Package className="stat-icon purple" />
              <div>
                <p className="stat-number">{collateralStats.sold}</p>
                <p className="stat-label">Sold</p>
              </div>
            </div>
          </div>
        </div>
        <div className="card card-total-value">
          <div className="card-content card-content-pt">
            <p className="total-value-label">Total Value (Held)</p>
            <p className="total-value-amount">{formatCurrency(collateralStats.totalValue)}</p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-content">
          <div className="filter-row">
            <div className="filter-row-fill">
              <input
                className="input"
                placeholder="Search by loan ID, client name, or collateral description..."
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
                <option value="Held">Held</option>
                <option value="Returned">Returned</option>
                <option value="Forfeited">Forfeited</option>
                <option value="Sold">Sold</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">All Collateral Items ({filteredCollateral.length})</h3>
        </div>
        <div className="card-content">
          <ResponsiveDataTable
            columns={columns}
            data={filteredCollateral}
            loading={loading}
            rowKey={(item) => item.id}
            emptyTitle="No collateral found"
            emptyMessage="Try changing your search and filter combination."
            renderActions={(item) => (
              <div className="actions-cell">
                <button className="btn btn-outline btn-sm" onClick={() => handleViewCollateral(item)}>
                  <Eye size={14} />
                </button>
                <button className="btn btn-outline btn-sm" onClick={() => openEditDialog(item)}>
                  <Pencil size={14} />
                </button>
                <button className="btn btn-outline btn-sm" onClick={() => handleDeleteCollateral(item)}>
                  <Trash2 size={14} />
                </button>
              </div>
            )}
            getMobileSummary={(item) => ({
              title: `${item.loanId} • ${item.clientName}`,
              subtitle: formatCurrency(item.estimatedValue),
              badge: <span className={collateralBadgeClass(item.collateralStatus)}>{item.collateralStatus}</span>,
            })}
            getMobileDetails={(item) => [
              { label: 'Description', value: item.description },
              { label: 'Loan Status', value: item.loanStatus },
              { label: 'Collateral Status', value: item.collateralStatus },
            ]}
          />
        </div>
      </div>

      {isViewDialogOpen ? (
        <div className="modal-overlay" onClick={() => setIsViewDialogOpen(false)}>
          <div className="modal-content modal-md" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Collateral Details</h2>
            </div>
            {selectedCollateral ? (
              <div className="modal-body">
                <div className="detail-sections">
                  <div className="card">
                    <div className="card-header">
                      <h3 className="card-title">Item Information</h3>
                    </div>
                    <div className="card-content">
                      <div className="detail-grid">
                        <div>
                          <p className="detail-label">Collateral ID</p>
                          <p className="detail-value">{selectedCollateral.id}</p>
                        </div>
                        <div>
                          <p className="detail-label">Related Loan ID</p>
                          <p className="detail-value">{selectedCollateral.loanId}</p>
                        </div>
                        <div>
                          <p className="detail-label">Client Name</p>
                          <p className="detail-value">{selectedCollateral.clientName}</p>
                        </div>
                        <div>
                          <p className="detail-label">Estimated Value</p>
                          <p className="detail-value detail-value-lg">
                            {formatCurrency(selectedCollateral.estimatedValue)}
                          </p>
                        </div>
                        <div className="detail-col-span-2">
                          <p className="detail-label">Description</p>
                          <p className="detail-value">{selectedCollateral.description}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="card">
                    <div className="card-header">
                      <h3 className="card-title">Status Information</h3>
                    </div>
                    <div className="card-content">
                      <div className="detail-grid">
                        <div>
                          <p className="detail-label">Loan Status</p>
                          <div className="detail-status-wrap">
                            <StatusBadge status={selectedCollateral.loanStatus} />
                          </div>
                        </div>
                        <div>
                          <p className="detail-label">Collateral Status</p>
                          <div className="detail-status-wrap">
                            <span className={collateralBadgeClass(selectedCollateral.collateralStatus)}>
                              {selectedCollateral.collateralStatus}
                            </span>
                          </div>
                        </div>
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
            </div>
          </div>
        </div>
      ) : null}

      {isFormDialogOpen ? (
        <div className="modal-overlay" onClick={() => setIsFormDialogOpen(false)}>
          <div className="modal-content modal-md" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{isEditing ? 'Edit Collateral' : 'Add Collateral'}</h2>
            </div>
            <div className="modal-body">
              <div className="form-sections">
                {!isEditing ? (
                  <>
                    <div className="form-group">
                      <label className="form-label">Collateral ID</label>
                      <input
                        className="input"
                        value={formData.id}
                        onChange={(e) => setFormData((prev) => ({ ...prev, id: e.target.value }))}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Loan ID</label>
                      <input
                        className="input"
                        value={formData.loan_id}
                        onChange={(e) => setFormData((prev) => ({ ...prev, loan_id: e.target.value }))}
                      />
                    </div>
                  </>
                ) : null}
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, description: e.target.value }))
                    }
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Estimated Value</label>
                  <input
                    className="input"
                    type="number"
                    value={formData.estimated_value}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, estimated_value: e.target.value }))
                    }
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={formData.collateral_status}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, collateral_status: e.target.value }))
                    }
                  >
                    <option value="Held">Held</option>
                    <option value="Returned">Returned</option>
                    <option value="Forfeited">Forfeited</option>
                    <option value="Sold">Sold</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setIsFormDialogOpen(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSaveCollateral}>
                {isEditing ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
