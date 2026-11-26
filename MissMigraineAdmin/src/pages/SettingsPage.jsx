import { useEffect, useState } from 'react';
import { Save, ChevronDown } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { fetchSettings, saveSettings } from '../services/api';

// ─────────────────────────────────────────────────────
// Inline components
// ─────────────────────────────────────────────────────

function Section({ title, subtitle, children }) {
  return (
    <div className="rounded-[24px] bg-surface border border-border p-6 mb-6">
      <div className="mb-5">
        <h2 className="font-reem text-xl text-text-primary">{title}</h2>
        {subtitle && (
          <p className="mt-1 font-plein text-sm text-text-muted">{subtitle}</p>
        )}
      </div>
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <div>
      <label className="block mb-2 font-plein-medium text-sm text-text-secondary">
        {label}
      </label>
      {children}
      {hint && (
        <p className="mt-1.5 font-plein text-xs text-text-muted">{hint}</p>
      )}
    </div>
  );
}

function ToggleRow({ label, hint, checked, onChange }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-elevated px-4 py-3">
      <div className="flex-1 pr-4">
        <p className="font-plein-medium text-sm text-text-primary">{label}</p>
        {hint && (
          <p className="font-plein text-xs text-text-muted mt-0.5">{hint}</p>
        )}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className="relative rounded-full transition-colors shrink-0"
        style={{
          width: 48,
          height: 28,
          backgroundColor: checked ? '#ad89dc' : '#2f174f',
        }}
      >
        <span
          className="absolute rounded-full bg-wisteria-50 transition-all"
          style={{
            width: 20,
            height: 20,
            top: 4,
            left: checked ? 24 : 4,
          }}
        />
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────
// Main screen
// ─────────────────────────────────────────────────────

export function SettingsPage() {
  const { showToast } = useToast();
  const [settings, setSettings] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings()
      .then(setSettings)
      .catch((err) => console.log('SETTINGS LOAD ERROR:', err));
  }, []);

  function update(key, value) {
    setSettings((s) => ({ ...s, [key]: value }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await saveSettings(settings);
      showToast('Settings saved successfully');
    } catch (err) {
      console.log('SETTINGS SAVE ERROR:', err);
      showToast('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  }

  if (!settings) {
    return (
      <div className="py-16 text-center font-plein text-base text-text-muted">
        Loading settings…
      </div>
    );
  }

  const isFirstSave = settings._exists === false;

  return (
    <form onSubmit={handleSave}>
      {/* Notification Defaults */}
      <Section
        title="Notification Defaults"
        subtitle="Global defaults applied to new accounts"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Default Log Reminder Time">
            <input
              type="time"
              value={settings.default_log_reminder_time}
              onChange={(e) => update('default_log_reminder_time', e.target.value)}
              className="w-full h-11 rounded-xl bg-elevated px-4 font-plein text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </Field>

          <Field
            label="Cycle Reminder Days Before"
            hint="How many days before the predicted period"
          >
            <input
              type="number"
              min={0}
              value={settings.default_cycle_reminder_days_before}
              onChange={(e) => update('default_cycle_reminder_days_before', Number(e.target.value))}
              className="w-full h-11 rounded-xl bg-elevated px-4 font-plein text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </Field>

          <Field
            label="Emergency Alert Threshold"
            hint="Migraine intensity that triggers a trusted-person alert"
          >
            <input
              type="number"
              min={1}
              max={10}
              value={settings.emergency_alert_threshold}
              onChange={(e) => update('emergency_alert_threshold', Number(e.target.value))}
              className="w-full h-11 rounded-xl bg-elevated px-4 font-plein text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </Field>

          <Field label="OTP Expiry (minutes)">
            <input
              type="number"
              min={1}
              value={settings.otp_expiry_minutes}
              onChange={(e) => update('otp_expiry_minutes', Number(e.target.value))}
              className="w-full h-11 rounded-xl bg-elevated px-4 font-plein text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </Field>
        </div>
      </Section>

      {/* Data & Storage */}
      <Section
        title="Data & Storage"
        subtitle="Control how much data is retained and stored"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Data Retention (days)">
            <input
              type="number"
              min={1}
              value={settings.data_retention_days}
              onChange={(e) => update('data_retention_days', Number(e.target.value))}
              className="w-full h-11 rounded-xl bg-elevated px-4 font-plein text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </Field>

          <Field label="Max Quick Logs Per Day">
            <input
              type="number"
              min={1}
              value={settings.max_quick_logs_per_day}
              onChange={(e) => update('max_quick_logs_per_day', Number(e.target.value))}
              className="w-full h-11 rounded-xl bg-elevated px-4 font-plein text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </Field>

          <Field label="Max Offline Logs">
            <input
              type="number"
              min={1}
              value={settings.max_offline_logs}
              onChange={(e) => update('max_offline_logs', Number(e.target.value))}
              className="w-full h-11 rounded-xl bg-elevated px-4 font-plein text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </Field>
        </div>
      </Section>

      {/* Feature Flags */}
      <Section
        title="Feature Flags"
        subtitle="Toggle app-wide capabilities"
      >
        <ToggleRow
          label="Allow Data Export"
          hint="Users can export their migraine history"
          checked={settings.allow_data_export}
          onChange={(v) => update('allow_data_export', v)}
        />
        <ToggleRow
          label="Allow Account Deletion"
          hint="Users can permanently delete their account"
          checked={settings.allow_account_deletion}
          onChange={(v) => update('allow_account_deletion', v)}
        />
        <ToggleRow
          label="App Maintenance Mode"
          hint="Show a maintenance screen to all users"
          checked={settings.app_maintenance_mode}
          onChange={(v) => update('app_maintenance_mode', v)}
        />
      </Section>

      {/* Version & Compatibility */}
      <Section
        title="Version & Compatibility"
        subtitle="Minimum requirements and generation cadence"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field
            label="Min Android Version"
            hint="Older versions will be blocked from the app"
          >
            <input
              type="text"
              value={settings.min_android_version}
              onChange={(e) => update('min_android_version', e.target.value)}
              className="w-full h-11 rounded-xl bg-elevated px-4 font-plein text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </Field>

          <Field
            label="Insight Generation Frequency"
            hint="How often user insights are recomputed"
          >
            <div className="relative">
              <select
                value={settings.insight_generation_frequency}
                onChange={(e) => update('insight_generation_frequency', e.target.value)}
                className="w-full h-11 appearance-none rounded-xl bg-elevated pl-4 pr-10 font-plein text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand cursor-pointer"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
            </div>
          </Field>
        </div>
      </Section>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className={`h-12 rounded-full px-8 font-plein-medium text-sm transition-colors inline-flex items-center gap-2 shadow-md shadow-wisteria-900/20 ${
            saving
              ? 'bg-wisteria-700 text-wisteria-300 cursor-not-allowed'
              : 'bg-wisteria-300 text-wisteria-950 hover:bg-wisteria-200'
          }`}
        >
          <Save size={16} />
          {saving ? 'Saving…' : isFirstSave ? 'Create Settings' : 'Save Settings'}
        </button>
      </div>
    </form>
  );
}