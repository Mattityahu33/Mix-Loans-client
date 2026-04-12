import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Bell, ShieldAlert } from 'lucide-react';
import { getNotifications } from '../../services/notificationService';
import PageHeader from '../../components/shared/PageHeader';
import './Notifications.css';

const severityClass = (severity = '') => {
  const normalized = severity.toLowerCase();
  if (normalized.includes('urgent') || normalized.includes('critical')) return 'severity-badge critical';
  if (normalized.includes('high')) return 'severity-badge high';
  return 'severity-badge medium';
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        setNotifications(await getNotifications({ status: 'unread' }));
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load notifications');
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const stats = useMemo(() => {
    const critical = notifications.filter((n) =>
      String(n.severity || '')
        .toLowerCase()
        .includes('critical')
    ).length;
    const high = notifications.filter((n) =>
      String(n.severity || '')
        .toLowerCase()
        .includes('high')
    ).length;
    return { total: notifications.length, critical, high };
  }, [notifications]);

  if (loading) return <div className="notifications-container">Loading notifications...</div>;

  return (
    <div className="notifications-container">
      <PageHeader
        title="Notifications & Alerts"
        subtitle="Persisted operational alerts from the backend."
      />

      {error ? <div className="error-banner">{error}</div> : null}

      <div className="alert-summary-grid">
        <div className="card">
          <div className="card-content card-content-pt">
            <div className="summary-stat-row">
              <Bell className="summary-icon summary-icon-blue" />
              <div>
                <p className="summary-number">{stats.total}</p>
                <p className="summary-label">Unread Alerts</p>
              </div>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-content card-content-pt">
            <div className="summary-stat-row">
              <AlertTriangle className="summary-icon summary-icon-amber" />
              <div>
                <p className="summary-number">{stats.high}</p>
                <p className="summary-label">High Severity</p>
              </div>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-content card-content-pt">
            <div className="summary-stat-row">
              <ShieldAlert className="summary-icon summary-icon-red" />
              <div>
                <p className="summary-number">{stats.critical}</p>
                <p className="summary-label">Critical Alerts</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Unread Notifications ({notifications.length})</h3>
        </div>
        <div className="card-content">
          {notifications.length === 0 ? (
            <div className="empty-state">
              <h3>No Active Alerts</h3>
              <p>Everything is currently in a healthy state.</p>
            </div>
          ) : (
            <div className="alert-list">
              {notifications.map((notification) => (
                <article key={notification.id} className="alert-card">
                  <header className="alert-title-row">
                    <h3 className="alert-title">{notification.title}</h3>
                    <span className={severityClass(notification.severity)}>{notification.severity}</span>
                  </header>
                  <p className="alert-message">{notification.message}</p>
                  <div className="alert-meta">
                    <span>Type: {notification.type}</span>
                    <span>Created: {new Date(notification.created_at).toLocaleString()}</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
