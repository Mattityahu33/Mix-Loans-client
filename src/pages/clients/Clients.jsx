import { useEffect, useMemo, useState } from 'react';
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import {
  createClient,
  deleteClient,
  getClientLoans,
  getClients,
  updateClient,
} from '../../services/clientService';
import PageHeader from '../../components/shared/PageHeader';
import ResponsiveDataTable from '../../components/shared/ResponsiveDataTable';
import './Clients.css';

const emptyForm = {
  name: '',
  phone: '',
  id_number: '',
  address: '',
  risk_level: 'Low',
  notes: '',
};

const riskClass = (riskLevel) => {
  if (riskLevel === 'High') return 'risk-badge high';
  if (riskLevel === 'Medium') return 'risk-badge medium';
  return 'risk-badge low';
};

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedLoans, setSelectedLoans] = useState([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadClients = async () => {
    try {
      setLoading(true);
      setError(null);
      setClients(await getClients());
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load clients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  const filteredClients = useMemo(
    () =>
      clients.filter((client) => {
        const term = searchTerm.toLowerCase();
        return (
          client.name.toLowerCase().includes(term) ||
          client.phone.toLowerCase().includes(term) ||
          client.nrc.toLowerCase().includes(term)
        );
      }),
    [clients, searchTerm]
  );

  const resetForm = () => {
    setFormData(emptyForm);
    setSaving(false);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleViewClient = async (client) => {
    setSelectedClient(client);
    setIsViewDialogOpen(true);
    try {
      const loans = await getClientLoans(client.id);
      setSelectedLoans(loans);
    } catch {
      setSelectedLoans([]);
    }
  };

  const handleCreateClient = async () => {
    try {
      setSaving(true);
      await createClient({
        name: formData.name,
        phone: formData.phone,
        id_number: formData.id_number,
        address: formData.address,
        risk_level: formData.risk_level,
        notes: formData.notes,
      });
      setIsAddDialogOpen(false);
      resetForm();
      await loadClients();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create client');
    } finally {
      setSaving(false);
    }
  };

  const handleEditClick = (client) => {
    setSelectedClient(client);
    setFormData({
      name: client.name,
      phone: client.phone,
      id_number: client.nrc,
      address: client.address,
      risk_level: client.riskLevel,
      notes: client.notes,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateClient = async () => {
    try {
      setSaving(true);
      await updateClient(selectedClient.id, {
        name: formData.name,
        phone: formData.phone,
        id_number: formData.id_number,
        address: formData.address,
        risk_level: formData.risk_level,
        notes: formData.notes,
      });
      setIsEditDialogOpen(false);
      resetForm();
      await loadClients();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update client');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClient = async (client) => {
    if (!window.confirm(`Delete ${client.name}?`)) {
      return;
    }
    try {
      await deleteClient(client.id);
      await loadClients();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete client');
    }
  };

  const renderClientForm = (onSubmit, isEditing = false) => (
    <div className="form-sections">
      <div className="form-grid">
        <div className="form-group">
          <label className="form-label" htmlFor="name">
            Full Name *
          </label>
          <input
            className="input"
            id="name"
            value={formData.name}
            onChange={(event) => handleInputChange('name', event.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="phone">
            Phone Number *
          </label>
          <input
            className="input"
            id="phone"
            value={formData.phone}
            onChange={(event) => handleInputChange('phone', event.target.value)}
          />
        </div>
      </div>
      <div className="form-grid">
        <div className="form-group">
          <label className="form-label" htmlFor="idNumber">
            ID Number / NRC *
          </label>
          <input
            className="input"
            id="idNumber"
            value={formData.id_number}
            onChange={(event) => handleInputChange('id_number', event.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="riskLevel">
            Risk Level *
          </label>
          <select
            className="form-select"
            id="riskLevel"
            value={formData.risk_level}
            onChange={(event) => handleInputChange('risk_level', event.target.value)}
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="address">
          Address
        </label>
        <input
          className="input"
          id="address"
          value={formData.address}
          onChange={(event) => handleInputChange('address', event.target.value)}
        />
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="notes">
          Notes
        </label>
        <textarea
          className="form-textarea"
          id="notes"
          rows={4}
          value={formData.notes}
          onChange={(event) => handleInputChange('notes', event.target.value)}
        />
      </div>
      <div className="modal-footer">
        <button
          className="btn btn-outline"
          onClick={() => {
            resetForm();
            setIsAddDialogOpen(false);
            setIsEditDialogOpen(false);
          }}
          type="button"
        >
          Cancel
        </button>
        <button className="btn btn-primary" onClick={onSubmit} type="button" disabled={saving}>
          {saving ? 'Saving...' : isEditing ? 'Update Client' : 'Save Client'}
        </button>
      </div>
    </div>
  );

  const columns = [
    { header: 'Client ID', render: (client) => <span className="cell-bold">{client.id}</span> },
    { header: 'Name', render: (client) => client.name },
    { header: 'Phone', render: (client) => client.phone },
    { header: 'NRC', render: (client) => client.nrc },
    { header: 'Address', render: (client) => <span className="truncate-cell">{client.address}</span> },
    {
      header: 'Risk',
      render: (client) => <span className={riskClass(client.riskLevel)}>{client.riskLevel}</span>,
    },
    {
      header: 'Open Metrics',
      render: (client) => (
        <div className="metrics-mini">
          <strong>{client.loanCount} loans</strong>
          <span>Outstanding: {client.totalOutstanding.toFixed(2)}</span>
        </div>
      ),
    },
  ];

  return (
    <div className="clients-container">
      <PageHeader
        title="Client Management"
        subtitle="Manage borrower records and review linked loan exposure."
        actions={
          <button className="btn btn-primary" onClick={() => setIsAddDialogOpen(true)}>
            <Plus size={16} />
            Add Client
          </button>
        }
      />

      {error ? <div className="error-banner">{error}</div> : null}

      <div className="card">
        <div className="card-content">
          <input
            className="input"
            placeholder="Search by name, phone, or NRC..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">All Clients ({filteredClients.length})</h3>
        </div>
        <div className="card-content">
          <ResponsiveDataTable
            columns={columns}
            data={filteredClients}
            loading={loading}
            rowKey={(client) => client.id}
            emptyTitle="No clients found"
            emptyMessage="Try changing your search criteria."
            renderActions={(client) => (
              <div className="actions-cell">
                <button className="btn btn-outline btn-sm" onClick={() => handleViewClient(client)}>
                  <Eye size={14} />
                </button>
                <button className="btn btn-outline btn-sm" onClick={() => handleEditClick(client)}>
                  <Pencil size={14} />
                </button>
                <button className="btn btn-outline btn-sm" onClick={() => handleDeleteClient(client)}>
                  <Trash2 size={14} />
                </button>
              </div>
            )}
            getMobileSummary={(client) => ({
              title: client.name,
              subtitle: `${client.id} • ${client.phone}`,
              badge: <span className={riskClass(client.riskLevel)}>{client.riskLevel}</span>,
            })}
            getMobileDetails={(client) => [
              { label: 'NRC', value: client.nrc },
              { label: 'Address', value: client.address },
              { label: 'Open Loans', value: client.loanCount },
              { label: 'Outstanding', value: client.totalOutstanding.toFixed(2) },
            ]}
          />
        </div>
      </div>

      {isAddDialogOpen ? (
        <div
          className="modal-overlay"
          onClick={() => {
            setIsAddDialogOpen(false);
            resetForm();
          }}
        >
          <div className="modal-content modal-md" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Client</h2>
            </div>
            <div className="modal-body">{renderClientForm(handleCreateClient)}</div>
          </div>
        </div>
      ) : null}

      {isEditDialogOpen ? (
        <div
          className="modal-overlay"
          onClick={() => {
            setIsEditDialogOpen(false);
            resetForm();
          }}
        >
          <div className="modal-content modal-md" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Client</h2>
            </div>
            <div className="modal-body">{renderClientForm(handleUpdateClient, true)}</div>
          </div>
        </div>
      ) : null}

      {isViewDialogOpen && selectedClient ? (
        <div className="modal-overlay" onClick={() => setIsViewDialogOpen(false)}>
          <div className="modal-content modal-lg" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h2>Client Details</h2>
            </div>
            <div className="modal-body">
              <div className="detail-sections">
                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title">Personal Information</h3>
                  </div>
                  <div className="card-content">
                    <div className="detail-grid">
                      <div>
                        <p className="detail-label">Client ID</p>
                        <p className="detail-value">{selectedClient.id}</p>
                      </div>
                      <div>
                        <p className="detail-label">Full Name</p>
                        <p className="detail-value">{selectedClient.name}</p>
                      </div>
                      <div>
                        <p className="detail-label">Phone Number</p>
                        <p className="detail-value">{selectedClient.phone}</p>
                      </div>
                      <div>
                        <p className="detail-label">NRC</p>
                        <p className="detail-value">{selectedClient.nrc}</p>
                      </div>
                      <div>
                        <p className="detail-label">Address</p>
                        <p className="detail-value">{selectedClient.address}</p>
                      </div>
                      <div>
                        <p className="detail-label">Risk Level</p>
                        <span className={riskClass(selectedClient.riskLevel)}>{selectedClient.riskLevel}</span>
                      </div>
                      <div className="detail-col-span-2">
                        <p className="detail-label">Notes</p>
                        <p className="detail-value">{selectedClient.notes || '—'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title">Loan History</h3>
                  </div>
                  <div className="card-content">
                    {selectedLoans.length === 0 ? (
                      <p className="no-loans-message">No loans found for this client.</p>
                    ) : (
                      <div className="table-wrapper">
                        <table className="clients-loan-history">
                          <thead>
                            <tr>
                              <th>Loan ID</th>
                              <th>Status</th>
                              <th>Remaining</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedLoans.map((loan) => (
                              <tr key={loan.id}>
                                <td>{loan.id}</td>
                                <td>{loan.status}</td>
                                <td>{loan.remaining_balance}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setIsViewDialogOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
