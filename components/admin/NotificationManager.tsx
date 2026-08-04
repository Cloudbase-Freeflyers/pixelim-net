"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";

type SubscriberRow = {
  _id: string;
  email: string;
  name?: string;
  status: "pending" | "approved" | "rejected";
  preferences: { leads: boolean };
  createdAt: string;
  approvedAt?: string;
};

type ActivityRow = {
  _id: string;
  type: "lead" | "notification";
  at: string;
  title: string;
  detail?: string;
  recipients?: string[];
  status?: "sent" | "failed" | "skipped";
  error?: string;
};

type Config = {
  configured: boolean;
  transport?: "smtp" | "oauth" | null;
  preferredTransport?: "smtp" | "oauth";
  oauthAvailable?: boolean;
  smtpAvailable?: boolean;
  connectedSenderEmail: string | null;
  oauthEmail?: string | null;
  smtpFrom?: string | null;
  connectedAt: string | null;
  tokenAgeDays?: number | null;
  testingModeRisk?: boolean;
  smtpConfigured?: boolean;
  smtpHost?: string | null;
  smtpSource?: "mongo" | "env" | null;
  oauthReady: boolean;
  oauthRedirectUri: string | null;
  approvedSubscriberCount: number;
  pendingCount: number;
};

export default function NotificationManager() {
  const searchParams = useSearchParams();
  const [rows, setRows] = useState<SubscriberRow[]>([]);
  const [config, setConfig] = useState<Config | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [testEmail, setTestEmail] = useState("");
  const [activity, setActivity] = useState<ActivityRow[]>([]);
  const [smtpHost, setSmtpHost] = useState("smtp.gmail.com");
  const [smtpPort, setSmtpPort] = useState("587");
  const [smtpUser, setSmtpUser] = useState("");
  const [smtpPass, setSmtpPass] = useState("");
  const [smtpFrom, setSmtpFrom] = useState("");
  const [showSmtpForm, setShowSmtpForm] = useState(false);

  useEffect(() => {
    if (searchParams.get("connected") === "1") {
      setNotice(`Gmail connected — notifications will be sent from ${searchParams.get("email") || "your account"}.`);
    } else if (searchParams.get("error")) {
      setError(decodeURIComponent(searchParams.get("error") || "oauth_error"));
    }
  }, [searchParams]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const qs = filter === "all" ? "" : `?status=${filter}`;
      const res = await fetch(`/api/admin/notifications${qs}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load");
      setRows(data.rows);
      setConfig(data.config);
      if (data.config?.smtpHost) setSmtpHost(data.config.smtpHost);
      if (data.config?.smtpFrom) {
        setSmtpFrom(data.config.smtpFrom);
        setSmtpUser(data.config.smtpFrom);
      }
      if (!data.config?.smtpAvailable) setShowSmtpForm(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  const refreshActivity = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/activity");
      const data = await res.json();
      if (res.ok) setActivity(data.rows ?? []);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    load();
    refreshActivity();
  }, [load, refreshActivity]);

  async function sendTest() {
    setSaving("test");
    setError(null);
    setNotice(null);
    try {
      const res = await fetch("/api/admin/notifications/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: testEmail.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        const meta = data.transportMeta
          ? ` [preferred=${data.transportMeta.preferred} active=${data.transportMeta.active} smtp=${data.transportMeta.smtpAvailable} oauth=${data.transportMeta.oauthAvailable}]`
          : "";
        await load();
        await refreshActivity();
        throw new Error(`${data.error || "Send failed"}${meta}`);
      }
      const via = data.transportMeta?.active
        ? ` via ${data.transportMeta.active}`
        : "";
      setNotice(
        `Test notification sent${via} to: ${(data.recipients ?? []).join(", ")}`
      );
      await load();
      await refreshActivity();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setSaving(null);
    }
  }

  async function disconnectGmail() {
    if (!confirm("Disconnect Gmail OAuth account? SMTP settings are unaffected.")) return;
    setSaving("disconnect");
    try {
      const res = await fetch("/api/admin/email/connect", { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Disconnect failed");
      setNotice("Gmail OAuth disconnected.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setSaving(null);
    }
  }

  async function selectTransport(transport: "oauth" | "smtp") {
    setSaving(`transport-${transport}`);
    setError(null);
    setNotice(null);
    try {
      const res = await fetch("/api/admin/email/transport", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transport }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to switch transport");
      if (data.config) {
        setConfig((prev) =>
          prev
            ? {
                ...prev,
                ...data.config,
                approvedSubscriberCount: prev.approvedSubscriberCount,
                pendingCount: prev.pendingCount,
              }
            : { ...data.config, approvedSubscriberCount: 0, pendingCount: 0 }
        );
      } else {
        await load();
      }
      setNotice(
        transport === "smtp"
          ? "Active transport set to SMTP."
          : "Active transport set to Gmail OAuth."
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setSaving(null);
    }
  }

  async function saveSmtp(e: FormEvent) {
    e.preventDefault();
    setSaving("smtp-save");
    setError(null);
    setNotice(null);
    try {
      const user = smtpUser.trim();
      const res = await fetch("/api/admin/email/smtp", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          host: smtpHost.trim() || "smtp.gmail.com",
          port: Number(smtpPort) || 587,
          user,
          pass: smtpPass,
          from: smtpFrom.trim() || user,
          activate: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save SMTP");
      setSmtpPass("");
      setShowSmtpForm(false);
      if (data.config) {
        setConfig((prev) =>
          prev
            ? {
                ...prev,
                ...data.config,
                approvedSubscriberCount: prev.approvedSubscriberCount,
                pendingCount: prev.pendingCount,
              }
            : { ...data.config, approvedSubscriberCount: 0, pendingCount: 0 }
        );
      } else {
        await load();
      }
      setNotice(`Sender email saved — notifications will send from ${user}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setSaving(null);
    }
  }

  async function clearSmtp() {
    if (!confirm("Remove saved SMTP credentials? Env-based SMTP (if any) remains.")) return;
    setSaving("smtp-clear");
    try {
      const res = await fetch("/api/admin/email/smtp", { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to clear SMTP");
      setShowSmtpForm(true);
      await load();
      setNotice("Saved SMTP credentials removed.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setSaving(null);
    }
  }

  async function setStatus(id: string, status: SubscriberRow["status"]) {
    setSaving(id);
    try {
      const res = await fetch(`/api/admin/notifications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setSaving(null);
    }
  }

  async function toggleLeads(id: string, enabled: boolean) {
    setSaving(`${id}-leads`);
    try {
      const res = await fetch(`/api/admin/notifications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferences: { leads: enabled } }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      if (data.row) {
        setRows((prev) =>
          prev.map((r) => (r._id === id ? { ...r, preferences: data.row.preferences } : r))
        );
      } else {
        await load();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setSaving(null);
    }
  }

  async function addEmail(e: React.FormEvent) {
    e.preventDefault();
    const email = newEmail.trim();
    if (!email) return;
    setSaving("add");
    setError(null);
    try {
      const res = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name: newName.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add");
      setNewEmail("");
      setNewName("");
      setNotice(`${data.row?.email || email} added and approved.`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setSaving(null);
    }
  }

  async function remove(id: string) {
    if (!confirm("Remove this subscriber?")) return;
    setSaving(id);
    try {
      const res = await fetch(`/api/admin/notifications/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Sender email setup — client-facing */}
      <section className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-bold text-lg text-gray-900">Sender email</h2>
        <p className="mt-1 text-sm text-gray-500">
          Choose which email address lead notifications are sent <span className="font-medium text-gray-700">from</span>.
          Recipients are managed separately below.
        </p>

        {notice && (
          <div className="mt-4 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
            {notice}
          </div>
        )}
        {error && (
          <div className="mt-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}

        {config && (
          <div className="mt-4 space-y-4 text-sm">
            <div
              className={`rounded-xl border px-4 py-3 ${
                config.connectedSenderEmail
                  ? "border-green-200 bg-green-50"
                  : "border-amber-200 bg-amber-50"
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Notifications currently send from
              </p>
              <p
                className={`mt-1 text-base font-semibold ${
                  config.connectedSenderEmail ? "text-green-900" : "text-amber-950"
                }`}
              >
                {config.connectedSenderEmail ?? "Not set up yet"}
              </p>
              {config.connectedSenderEmail && (
                <p className="mt-1 text-xs text-gray-600">
                  Method:{" "}
                  {config.transport === "smtp"
                    ? "Gmail App Password"
                    : config.transport === "oauth"
                      ? "Google account connect"
                      : "—"}
                </p>
              )}
            </div>

            <StatusRow
              label="People who receive alerts"
              value={`${config.approvedSubscriberCount} approved`}
              ok={config.approvedSubscriberCount > 0}
            />
            {config.pendingCount > 0 && (
              <p className="rounded-lg bg-yellow-50 border border-yellow-200 px-3 py-2 text-sm font-semibold text-yellow-900">
                {config.pendingCount} pending approval
              </p>
            )}

            {/* Primary: set sender with App Password */}
            <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-4 space-y-3">
              <div>
                <p className="font-semibold text-gray-900">
                  Set up your Gmail / Google Workspace email
                </p>
                <p className="mt-1 text-xs text-gray-600 leading-relaxed">
                  Enter the email that should appear as the sender, plus a Google{" "}
                  <a
                    href="https://myaccount.google.com/apppasswords"
                    target="_blank"
                    rel="noreferrer"
                    className="underline font-medium text-blue-800"
                  >
                    App Password
                  </a>{" "}
                  (not your normal login password). Requires 2-Step Verification on that Google account.
                </p>
              </div>

              {(showSmtpForm || !config.smtpAvailable) && (
                <form onSubmit={saveSmtp} className="grid gap-3 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Sender email address
                    </label>
                    <input
                      type="email"
                      required
                      value={smtpUser}
                      onChange={(e) => {
                        setSmtpUser(e.target.value);
                        if (!smtpFrom || smtpFrom === smtpUser) setSmtpFrom(e.target.value);
                      }}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                      placeholder="you@yourcompany.com"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Google App Password
                    </label>
                    <input
                      type="password"
                      required
                      value={smtpPass}
                      onChange={(e) => setSmtpPass(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                      placeholder="16-character app password"
                      autoComplete="new-password"
                    />
                  </div>

                  <details className="sm:col-span-2 text-xs text-gray-600">
                    <summary className="cursor-pointer font-semibold text-gray-700">
                      Advanced (host / port) — leave default for Gmail
                    </summary>
                    <div className="mt-2 grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">SMTP host</label>
                        <input
                          value={smtpHost}
                          onChange={(e) => setSmtpHost(e.target.value)}
                          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
                          placeholder="smtp.gmail.com"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Port</label>
                        <input
                          value={smtpPort}
                          onChange={(e) => setSmtpPort(e.target.value)}
                          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
                          placeholder="587"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          From address (optional)
                        </label>
                        <input
                          type="email"
                          value={smtpFrom}
                          onChange={(e) => setSmtpFrom(e.target.value)}
                          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
                          placeholder="Same as sender email if blank"
                        />
                      </div>
                    </div>
                  </details>

                  <div className="sm:col-span-2 flex flex-wrap gap-2">
                    <button
                      type="submit"
                      disabled={saving === "smtp-save"}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg disabled:opacity-50"
                    >
                      {saving === "smtp-save"
                        ? "Saving…"
                        : config.smtpAvailable
                          ? "Update sender email"
                          : "Save & use this email"}
                    </button>
                    {config.smtpSource === "mongo" && (
                      <button
                        type="button"
                        disabled={saving === "smtp-clear"}
                        onClick={clearSmtp}
                        className="px-4 py-2 border border-gray-300 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                      >
                        Remove saved email
                      </button>
                    )}
                  </div>
                </form>
              )}

              {config.smtpAvailable && !showSmtpForm && (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setShowSmtpForm(true)}
                    className="px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-800 rounded-lg hover:bg-gray-50"
                  >
                    Change sender email / password
                  </button>
                  {config.preferredTransport !== "smtp" && (
                    <button
                      type="button"
                      disabled={saving === "transport-smtp"}
                      onClick={() => selectTransport("smtp")}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg disabled:opacity-50"
                    >
                      Use this email now
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Secondary: Google connect */}
            <div className="rounded-xl border border-gray-200 p-4 space-y-3">
              <div>
                <p className="font-semibold text-gray-900">Or connect a Google account</p>
                <p className="mt-1 text-xs text-gray-500">
                  Sign in with Google to authorize sending. May need reconnecting every ~7 days if
                  the Google Cloud app is still in Testing mode.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {config.oauthReady ? (
                  <a
                    href={
                      config.oauthAvailable
                        ? "/api/admin/email/connect?reconnect=1"
                        : "/api/admin/email/connect"
                    }
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded-lg transition-colors"
                  >
                    {config.oauthAvailable
                      ? "Reconnect Google account"
                      : "Connect Google account"}
                  </a>
                ) : (
                  <p className="text-xs text-gray-500">
                    Google connect is not enabled on this site — use the App Password form above.
                  </p>
                )}
                {config.oauthAvailable && (
                  <>
                    {config.preferredTransport !== "oauth" && (
                      <button
                        type="button"
                        disabled={saving === "transport-oauth"}
                        onClick={() => selectTransport("oauth")}
                        className="px-4 py-2 border border-gray-300 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                      >
                        Use Google account now
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={saving === "disconnect"}
                      onClick={disconnectGmail}
                      className="px-4 py-2 border border-gray-300 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    >
                      Disconnect Google
                    </button>
                  </>
                )}
              </div>
              {config.oauthAvailable && (
                <p className="text-xs text-gray-500">
                  Connected Google: <span className="font-medium">{config.oauthEmail}</span>
                  {config.testingModeRisk ? " — may expire soon" : ""}
                </p>
              )}
            </div>

            {config.oauthAvailable && config.smtpAvailable && (
              <p className="text-xs text-gray-500">
                Both methods are set up. Active:{" "}
                <span className="font-semibold text-gray-800">
                  {config.transport === "smtp"
                    ? `App Password (${config.smtpFrom})`
                    : `Google (${config.oauthEmail})`}
                </span>
                . Use the buttons above to switch.
              </p>
            )}

            <div className="flex flex-wrap items-end gap-2 pt-3 border-t border-gray-100">
              <div className="flex-1 min-w-48">
                <label htmlFor="test-email" className="block text-xs font-semibold text-gray-700 mb-1">
                  Test notification (blank = all approved recipients)
                </label>
                <input
                  id="test-email"
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <button
                type="button"
                disabled={saving === "test" || !config.configured}
                onClick={sendTest}
                className="px-4 py-2 border border-gray-300 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {saving === "test" ? "Sending…" : "Send Test"}
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Recipients list */}
      <section className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="font-bold text-lg text-gray-900">Who receives alerts</h2>
            <p className="mt-0.5 text-sm text-gray-500">
              These people get an email for every new lead. Separate from the sender address above.
            </p>
          </div>
          <div className="flex gap-2">
            {(["all", "pending", "approved", "rejected"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                  filter === f
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <form
          onSubmit={addEmail}
          className="flex flex-wrap items-end gap-2 rounded-lg bg-gray-50 p-3 mb-4"
        >
          <div className="flex-1 min-w-48">
            <label htmlFor="add-email" className="block text-xs font-semibold text-gray-700 mb-1">
              Add email (auto-approved)
            </label>
            <input
              id="add-email"
              type="email"
              required
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="min-w-32">
            <label htmlFor="add-name" className="block text-xs font-semibold text-gray-700 mb-1">
              Name (optional)
            </label>
            <input
              id="add-name"
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={saving === "add"}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
          >
            {saving === "add" ? "Adding…" : "Add"}
          </button>
        </form>

        {loading ? (
          <p className="text-sm text-gray-400 py-4">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-gray-400 py-4">No subscribers yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Name</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Email</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Leads</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Added</th>
                  <th className="px-3 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((row) => (
                  <tr key={row._id} className="hover:bg-gray-50">
                    <td className="px-3 py-3 text-gray-700">{row.name || "—"}</td>
                    <td className="px-3 py-3 font-mono text-xs text-gray-700">{row.email}</td>
                    <td className="px-3 py-3">
                      <StatusBadge status={row.status} />
                    </td>
                    <td className="px-3 py-3">
                      {row.status === "approved" ? (
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={row.preferences.leads}
                            disabled={saving?.startsWith(row._id) ?? false}
                            onChange={(e) => toggleLeads(row._id, e.target.checked)}
                            className="rounded border-gray-300"
                          />
                          <span className="text-xs text-gray-600">On</span>
                        </label>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-xs text-gray-400">
                      {new Date(row.createdAt).toLocaleDateString("en-US")}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        {row.status !== "approved" && (
                          <button
                            type="button"
                            disabled={saving === row._id}
                            onClick={() => setStatus(row._id, "approved")}
                            className="text-xs font-semibold text-blue-600 hover:underline disabled:opacity-40"
                          >
                            Approve
                          </button>
                        )}
                        {row.status !== "rejected" && (
                          <button
                            type="button"
                            disabled={saving === row._id}
                            onClick={() => setStatus(row._id, "rejected")}
                            className="text-xs font-semibold text-gray-500 hover:underline disabled:opacity-40"
                          >
                            Reject
                          </button>
                        )}
                        <button
                          type="button"
                          disabled={saving === row._id}
                          onClick={() => remove(row._id)}
                          className="text-xs font-semibold text-red-500 hover:underline disabled:opacity-40"
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Activity log */}
      <section className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-bold text-lg text-gray-900">Activity Log</h2>
            <p className="mt-0.5 text-sm text-gray-500">Recent notification events.</p>
          </div>
          <button
            type="button"
            onClick={refreshActivity}
            className="px-3 py-1.5 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
          >
            Refresh
          </button>
        </div>

        {activity.length === 0 ? (
          <p className="text-sm text-gray-400 py-4">No activity yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Time</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Event</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Recipients</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {activity.map((a) => (
                  <tr key={a._id} className="align-top">
                    <td className="px-3 py-3 text-xs text-gray-400 whitespace-nowrap">
                      {new Date(a.at).toLocaleString("en-US")}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <ActivityBadge type={a.type} status={a.status} />
                        <div>
                          <div className="font-medium text-gray-900">{a.title}</div>
                          {a.detail && <div className="text-xs text-gray-500">{a.detail}</div>}
                          {a.error && <div className="text-xs text-red-500">{a.error}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-xs text-gray-500">
                      {a.recipients?.length ? a.recipients.join(", ") : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function StatusBadge({ status }: { status: SubscriberRow["status"] }) {
  const map = {
    pending: { label: "Pending", cls: "bg-yellow-100 text-yellow-800" },
    approved: { label: "Approved", cls: "bg-green-100 text-green-800" },
    rejected: { label: "Rejected", cls: "bg-gray-100 text-gray-600" },
  };
  const { label, cls } = map[status];
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`}>
      {label}
    </span>
  );
}

function ActivityBadge({
  type,
  status,
}: {
  type: ActivityRow["type"];
  status?: ActivityRow["status"];
}) {
  const statusMap: Record<string, { label: string; cls: string }> = {
    sent: { label: "Sent", cls: "bg-green-100 text-green-700" },
    failed: { label: "Failed", cls: "bg-red-100 text-red-700" },
    skipped: { label: "Skipped", cls: "bg-gray-100 text-gray-500" },
  };
  const typeMap: Record<ActivityRow["type"], { label: string; cls: string }> = {
    lead: { label: "Lead", cls: "bg-blue-100 text-blue-700" },
    notification: { label: "Notif", cls: "bg-purple-100 text-purple-700" },
  };
  const t = typeMap[type];
  const s = status ? statusMap[status] : null;
  return (
    <div className="flex flex-col gap-1">
      <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${t.cls}`}>
        {t.label}
      </span>
      {s && (
        <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${s.cls}`}>
          {s.label}
        </span>
      )}
    </div>
  );
}

function StatusRow({ label, value, ok }: { label: string; value: string; ok?: boolean }) {
  return (
    <div className="flex flex-wrap gap-2 items-baseline">
      <span className="font-semibold text-gray-700 min-w-32">{label}:</span>
      <span className={ok ? "text-green-700" : "text-gray-500"}>{value}</span>
    </div>
  );
}
