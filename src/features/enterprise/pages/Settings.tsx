import { useEffect, useState } from "react";
import { Input, Select, Toggle } from "../../auth/components/FormFields";
import PageHeader from "../../auth/components/PageHeader";
import { useToast } from "../../auth/components/Toast";
import { getEnterpriseSettings } from "../services/enterpriseService";
import type { EnterpriseSettings as EnterpriseSettingsData } from "../types/enterprise";

export default function Settings() {
  const toast = useToast();
  const [settings, setSettings] = useState<EnterpriseSettingsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEnterpriseSettings().then(setSettings).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-5" aria-busy="true">
        <PageHeader title="Settings & configuration" subtitle="Loading enterprise configuration" />
        <div className="card h-72 animate-pulse bg-line" />
      </div>
    );
  }
  if (!settings) return null;

  const updateChannel = (key: "email" | "sms" | "push", checked: boolean) => {
    setSettings((current) => current ? { ...current, channels: { ...current.channels, [key]: checked } } : current);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Settings & configuration"
        subtitle="Retention, policy and localisation settings"
        actions={<button type="button" className="btn btn-primary" onClick={() => toast.success("Settings were validated. No data was saved in Phase 1.")}>Save settings</button>}
      />
      <form className="card grid gap-5 md:grid-cols-2" onSubmit={(event) => event.preventDefault()}>
        <fieldset className="grid gap-4">
          <legend className="mb-1 font-bold">Retention</legend>
          <Input label="Data retention period" required type="number" min="1" value={settings.dataRetentionDays} onChange={(event) => setSettings({ ...settings, dataRetentionDays: Number(event.target.value) })} hint="Days" />
          <Input label="Audit-log retention" required type="number" min="1" value={settings.auditLogRetentionDays} onChange={(event) => setSettings({ ...settings, auditLogRetentionDays: Number(event.target.value) })} hint="Days" />
        </fieldset>
        <fieldset className="grid gap-4">
          <legend className="mb-1 font-bold">Policies</legend>
          <Input label="Auto-logout timer" required type="number" min="1" value={settings.autoLogoutMinutes} onChange={(event) => setSettings({ ...settings, autoLogoutMinutes: Number(event.target.value) })} hint="Minutes" />
        </fieldset>
        <fieldset className="grid gap-4 md:col-span-2">
          <legend className="mb-1 font-bold">Localisation</legend>
          <div className="grid gap-4 sm:grid-cols-3">
            <Input label="Time zone" required value={settings.timeZone} onChange={(event) => setSettings({ ...settings, timeZone: event.target.value })} />
            <Select label="Default language" required value={settings.defaultLanguage} onChange={(event) => setSettings({ ...settings, defaultLanguage: event.target.value as EnterpriseSettingsData["defaultLanguage"] })} options={[
              { value: "English", label: "English" },
              { value: "Hindi", label: "Hindi" },
              { value: "Tamil", label: "Tamil" },
            ]} />
            <Select label="Currency" required value={settings.currency} onChange={(event) => setSettings({ ...settings, currency: event.target.value as "INR" })} options={[{ value: "INR", label: "INR" }]} />
          </div>
        </fieldset>
        <fieldset className="md:col-span-2">
          <legend className="mb-1 font-bold">Notification defaults</legend>
          <div className="divide-y divide-line rounded-card border border-line px-4">
            <Toggle label="Email notifications" checked={settings.channels.email} onChange={(event) => updateChannel("email", event.target.checked)} />
            <Toggle label="SMS notifications" checked={settings.channels.sms} onChange={(event) => updateChannel("sms", event.target.checked)} />
            <Toggle label="Push notifications" checked={settings.channels.push} onChange={(event) => updateChannel("push", event.target.checked)} />
          </div>
        </fieldset>
      </form>
    </div>
  );
}
