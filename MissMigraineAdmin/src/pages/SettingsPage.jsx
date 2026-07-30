import { useEffect, useState } from 'react';
import { PageHeader, Toggle } from '../components/ui/PageHeader';
import { useToast } from '../context/ToastContext';
import { fetchSettings, saveSettings } from '../services/api';

export function SettingsPage() {
  const { showToast } = useToast();
  const [settings, setSettings] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings().then(setSettings);
  }, []);

  function update(key, value) {
    setSettings((s) => ({ ...s, [key]: value }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    await saveSettings(settings);
    setSaving(false);
    showToast('Settings saved successfully');
  }

  if (!settings) {
    return (
      <div className="page">
        <p>Loading settings…</p>
      </div>
    );
  }

  return (
    <div className="page">
      <PageHeader title="System Settings" subtitle="Configure global system defaults" />

      <form onSubmit={handleSave} className="settings-form">
        <section className="card settings-section">
          <h2 className="section-title">Notification Defaults</h2>
          <label className="field">
            <span className="field__label">Default Log Reminder Time</span>
            <input
              type="time"
              value={settings.default_log_reminder_time}
              onChange={(e) => update('default_log_reminder_time', e.target.value)}
            />
          </label>
          <label className="field">
            <span className="field__label">Default Cycle Reminder Days Before</span>
            <input
              type="number"
              min={0}
              value={settings.default_cycle_reminder_days_before}
              onChange={(e) =>
                update('default_cycle_reminder_days_before', Number(e.target.value))
              }
            />
          </label>
          <label className="field">
            <span className="field__label">Emergency Alert Threshold</span>
            <input
              type="number"
              min={1}
              value={settings.emergency_alert_threshold}
              onChange={(e) => update('emergency_alert_threshold', Number(e.target.value))}
            />
          </label>
          <label className="field">
            <span className="field__label">OTP Expiry Minutes</span>
            <input
              type="number"
              min={1}
              value={settings.otp_expiry_minutes}
              onChange={(e) => update('otp_expiry_minutes', Number(e.target.value))}
            />
          </label>
        </section>

        <section className="card settings-section">
          <h2 className="section-title">Data &amp; Storage</h2>
          <label className="field">
            <span className="field__label">Data Retention Days</span>
            <input
              type="number"
              min={1}
              value={settings.data_retention_days}
              onChange={(e) => update('data_retention_days', Number(e.target.value))}
            />
          </label>
          <label className="field">
            <span className="field__label">Max Quick Logs Per Day</span>
            <input
              type="number"
              min={1}
              value={settings.max_quick_logs_per_day}
              onChange={(e) => update('max_quick_logs_per_day', Number(e.target.value))}
            />
          </label>
          <label className="field">
            <span className="field__label">Max Offline Logs</span>
            <input
              type="number"
              min={1}
              value={settings.max_offline_logs}
              onChange={(e) => update('max_offline_logs', Number(e.target.value))}
            />
          </label>
        </section>

        <section className="card settings-section">
          <h2 className="section-title">Feature Flags</h2>
          <Toggle
            checked={settings.allow_data_export}
            onChange={(v) => update('allow_data_export', v)}
            label="Allow Data Export"
          />
          <Toggle
            checked={settings.allow_account_deletion}
            onChange={(v) => update('allow_account_deletion', v)}
            label="Allow Account Deletion"
          />
          <Toggle
            checked={settings.app_maintenance_mode}
            onChange={(v) => update('app_maintenance_mode', v)}
            label="App Maintenance Mode"
          />
        </section>

        <section className="card settings-section">
          <h2 className="section-title">Version &amp; Compatibility</h2>
          <label className="field">
            <span className="field__label">Min Android Version</span>
            <input
              type="text"
              value={settings.min_android_version}
              onChange={(e) => update('min_android_version', e.target.value)}
            />
          </label>
          <label className="field">
            <span className="field__label">Insight Generation Frequency</span>
            <select
              value={settings.insight_generation_frequency}
              onChange={(e) => update('insight_generation_frequency', e.target.value)}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </label>
        </section>

        <button type="submit" className="btn btn--primary" disabled={saving}>
          {saving ? 'Saving…' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
}
