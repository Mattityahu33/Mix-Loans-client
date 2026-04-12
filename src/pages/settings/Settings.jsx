import { useEffect, useState } from 'react';
import { AlertCircle, Save, Settings as SettingsIcon } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import PageHeader from '../../components/shared/PageHeader';
import './Settings.css';

export default function Settings() {
  const { settings: globalSettings, loading, updateSettings } = useSettings();

  const [localSettings, setLocalSettings] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (globalSettings) {
      setLocalSettings(globalSettings);
      setHasChanges(false);
    }
  }, [globalSettings]);

  const handleInputChange = (field, value) => {
    setLocalSettings((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSettings(localSettings);
      setHasChanges(false);
    } catch {
      alert('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setLocalSettings(globalSettings);
    setHasChanges(false);
  };

  if (loading || !localSettings) return <div className="settings-container">Loading settings...</div>;

  return (
    <div className="settings-container">
      <PageHeader
        title="System Settings"
        subtitle="Configure defaults and operating preferences."
        actions={<SettingsIcon className="settings-header-icon" />}
      />

      {hasChanges ? (
        <div className="card unsaved-banner">
          <div className="card-content card-content-pt">
            <div className="unsaved-banner-row">
              <AlertCircle className="unsaved-banner-icon" />
              <p className="unsaved-banner-text">
                You have unsaved changes. Save settings to apply or reset to discard.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">General Preferences</h3>
        </div>
        <div className="card-content">
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="theme">
                Theme
              </label>
              <select
                className="form-select"
                id="theme"
                value={localSettings.theme}
                onChange={(e) => handleInputChange('theme', e.target.value)}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
              <p className="form-hint">Application visual theme</p>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="language">
                Language
              </label>
              <select
                className="form-select"
                id="language"
                value={localSettings.language}
                onChange={(e) => handleInputChange('language', e.target.value)}
              >
                <option value="en">English</option>
                <option value="fr">French</option>
              </select>
              <p className="form-hint">Application language</p>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="currency_format">
                Currency Format
              </label>
              <select
                className="form-select"
                id="currency_format"
                value={localSettings.currency_format}
                onChange={(e) => handleInputChange('currency_format', e.target.value)}
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="ZMW">ZMW (ZK)</option>
              </select>
              <p className="form-hint">Default currency display format</p>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="items_per_page">
                Items Per Page
              </label>
              <select
                className="form-select"
                id="items_per_page"
                value={localSettings.items_per_page}
                onChange={(e) => handleInputChange('items_per_page', parseInt(e.target.value, 10))}
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
              <p className="form-hint">Number of rows in tables</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Default Loan Parameters</h3>
        </div>
        <div className="card-content">
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="default_loan_amount">
                Default Loan Amount
              </label>
              <input
                className="form-input"
                id="default_loan_amount"
                type="number"
                step="100"
                value={localSettings.default_loan_amount}
                onChange={(e) => handleInputChange('default_loan_amount', parseFloat(e.target.value))}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="default_interest_rate">
                Default Interest Rate (%)
              </label>
              <input
                className="form-input"
                id="default_interest_rate"
                type="number"
                step="0.01"
                value={localSettings.default_interest_rate}
                onChange={(e) => handleInputChange('default_interest_rate', parseFloat(e.target.value))}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="default_interest_type">
                Default Interest Type
              </label>
              <select
                className="form-select"
                id="default_interest_type"
                value={localSettings.default_interest_type}
                onChange={(e) => handleInputChange('default_interest_type', e.target.value)}
              >
                <option value="Monthly">Monthly</option>
                <option value="Weekly">Weekly</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="default_grace_period">
                Default Grace Period (days)
              </label>
              <input
                className="form-input"
                id="default_grace_period"
                type="number"
                value={localSettings.default_grace_period}
                onChange={(e) => handleInputChange('default_grace_period', parseInt(e.target.value || '0', 10))}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Portfolio Rules</h3>
        </div>
        <div className="card-content">
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="due_soon_threshold_days">
                Due Soon Threshold (days)
              </label>
              <input
                className="form-input"
                id="due_soon_threshold_days"
                type="number"
                value={localSettings.due_soon_threshold_days}
                onChange={(e) =>
                  handleInputChange('due_soon_threshold_days', parseInt(e.target.value || '0', 10))
                }
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="penalty_rate_per_day">
                Penalty Rate Per Day (%)
              </label>
              <input
                className="form-input"
                id="penalty_rate_per_day"
                type="number"
                step="0.01"
                value={localSettings.penalty_rate_per_day}
                onChange={(e) =>
                  handleInputChange('penalty_rate_per_day', parseFloat(e.target.value || '0'))
                }
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="total_capital_available">
                Total Capital Available
              </label>
              <input
                className="form-input"
                id="total_capital_available"
                type="number"
                value={localSettings.total_capital_available}
                onChange={(e) =>
                  handleInputChange('total_capital_available', parseFloat(e.target.value || '0'))
                }
              />
            </div>

            <div className="checkbox-group">
              <input
                type="checkbox"
                id="allow_multiple_open_loans"
                checked={Boolean(localSettings.allow_multiple_open_loans)}
                onChange={(e) => handleInputChange('allow_multiple_open_loans', e.target.checked)}
              />
              <label className="form-label" htmlFor="allow_multiple_open_loans">
                Allow multiple open loans per client
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Security & Notifications</h3>
        </div>
        <div className="card-content">
          <div className="form-grid-2">
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="notifications_enabled"
                checked={localSettings.notifications_enabled}
                onChange={(e) => handleInputChange('notifications_enabled', e.target.checked)}
              />
              <label className="form-label" htmlFor="notifications_enabled">
                Enable System Notifications
              </label>
            </div>

            <div className="checkbox-group">
              <input
                type="checkbox"
                id="hide_sensitive_info"
                checked={localSettings.hide_sensitive_info}
                onChange={(e) => handleInputChange('hide_sensitive_info', e.target.checked)}
              />
              <label className="form-label" htmlFor="hide_sensitive_info">
                Hide Sensitive Dashboard Information
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="settings-action-bar">
        <button className="btn btn-outline" onClick={handleReset} disabled={!hasChanges || isSaving}>
          Reset Changes
        </button>
        <button className="btn btn-primary" onClick={handleSave} disabled={!hasChanges || isSaving}>
          <Save className="icon-sm icon-mr" />
          {isSaving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}
