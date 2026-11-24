import { useEffect, useState } from "react";
import PageHeader from "../../auth/components/PageHeader";
import { Input, Toggle } from "../../auth/components/FormFields";
import { useToast } from "../../auth/components/Toast";
import { getZoneSettings } from "../services/zoneService";
import type { ZoneSettings as ZoneSettingsData } from "../types/zone";

export default function Settings() {
  const toast = useToast();
  const [settings, setSettings] = useState<ZoneSettingsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getZoneSettings().then(setSettings).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-5" aria-busy="true">
        <PageHeader title="Zone settings" subtitle="Loading alert configuration" />
        <div className="card h-64 animate-pulse bg-line" />
      </div>
    );
  }
  if (!settings) return null;

  const updateNumber = (key: "highConsumption" | "lowConsumption" | "abnormalReadingFrequency" | "inactiveMeterDuration", value: number) => {
    setSettings((current) => current ? { ...current, [key]: value } : current);
  };

  const updateChannel = (key: "email" | "sms" | "push", value: boolean) => {
    setSettings((current) => current ? { ...current, channels: { ...current.channels, [key]: value } } : current);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Zone settings"
        subtitle="Alert thresholds and notification channels"
        actions={<button type="button" className="btn btn-primary" onClick={() => toast.success("Settings changes were validated. No data was saved in Phase 1.")}>Save settings</button>}
      />

      <form className="card grid gap-5 md:grid-cols-2" onSubmit={(event) => event.preventDefault()}>
        <Input label="High consumption threshold" required type="number" min="0" step="0.1" value={settings.highConsumption} onChange={(event) => updateNumber("highConsumption", Number(event.target.value))} hint="kWh above normal daily usage" />
        <Input label="Low consumption threshold" required type="number" min="0" step="0.1" value={settings.lowConsumption} onChange={(event) => updateNumber("lowConsumption", Number(event.target.value))} hint="kWh below normal daily usage" />
        <Input label="Abnormal reading frequency" required type="number" min="1" value={settings.abnormalReadingFrequency} onChange={(event) => updateNumber("abnormalReadingFrequency", Number(event.target.value))} hint="Hours between expected readings" />
        <Input label="Inactive-meter duration" required type="number" min="1" value={settings.inactiveMeterDuration} onChange={(event) => updateNumber("inactiveMeterDuration", Number(event.target.value))} hint="Days before an inactive meter alert" />

        <fieldset className="md:col-span-2">
          <legend className="mb-1 font-bold">Notification channels</legend>
          <div className="divide-y divide-line rounded-card border border-line px-4">
            <Toggle label="Email notifications" description="Send zone alerts to administrator email" checked={settings.channels.email} onChange={(event) => updateChannel("email", event.target.checked)} />
            <Toggle label="SMS notifications" description="Send critical alerts by SMS" checked={settings.channels.sms} onChange={(event) => updateChannel("sms", event.target.checked)} />
            <Toggle label="Push notifications" description="Send alerts to the MDMS application" checked={settings.channels.push} onChange={(event) => updateChannel("push", event.target.checked)} />
          </div>
        </fieldset>
      </form>
    </div>
  );
}
