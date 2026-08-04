"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";

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
};

export default function GmailConnector() {
  const searchParams = useSearchParams();
  const [config, setConfig] = useState<Config | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [smtpUser, setSmtpUser] = useState("");
  const [smtpPass, setSmtpPass] = useState("");
  const [smtpHost, setSmtpHost] = useState("smtp.gmail.com");
  const [smtpPort] = useState("587");

  useEffect(() => {
    if (searchParams.get("connected") === "1") {
      setNotice(
        `Google account connected — ${searchParams.get("email") || "your account"}.`
      );
    } else if (searchParams.get("error")) {
      setError(decodeURIComponent(searchParams.get("error") || "oauth_error"));
    }
  }, [searchParams]);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/notifications");
      const d = await res.json();
      if (d.ok) {
        setConfig(d.config);
        if (d.config?.smtpFrom) setSmtpUser(d.config.smtpFrom);
        if (d.config?.smtpHost) setSmtpHost(d.config.smtpHost);
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function saveSmtp(e: FormEvent) {
    e.preventDefault();
    setSaving("smtp");
    setError(null);
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
          from: user,
          activate: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      setSmtpPass("");
      if (data.config) setConfig(data.config);
      setNotice(`Sender email saved — notifications will send from ${user}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setSaving(null);
    }
  }

  async function disconnect() {
    if (!confirm("Disconnect Google account?")) return;
    setSaving("disconnect");
    try {
      const res = await fetch("/api/admin/email/connect", { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Disconnect failed");
      setNotice("Google account disconnected.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setSaving(null);
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <p className="text-sm text-gray-400">Loading…</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
      <div>
        <h2 className="font-bold text-lg text-gray-900">Sender email</h2>
        <p className="mt-1 text-sm text-gray-500">
          Lead notifications are sent from this address. Full controls also live under{" "}
          <a href="/admin/notifications" className="text-blue-700 underline">
            Notifications
          </a>
          .
        </p>
      </div>

      {notice && (
        <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
          {notice}
        </div>
      )}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {config && (
        <div className="space-y-4 text-sm">
          <div
            className={`rounded-xl border px-4 py-3 ${
              config.connectedSenderEmail
                ? "border-green-200 bg-green-50"
                : "border-amber-200 bg-amber-50"
            }`}
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Currently sending from
            </p>
            <p className="mt-1 font-semibold text-gray-900">
              {config.connectedSenderEmail ?? "Not set up yet"}
            </p>
          </div>

          <form onSubmit={saveSmtp} className="rounded-xl border border-blue-200 bg-blue-50/40 p-4 space-y-3">
            <p className="font-semibold text-gray-900">Set up your email (App Password)</p>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Sender email
              </label>
              <input
                type="email"
                required
                value={smtpUser}
                onChange={(e) => setSmtpUser(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
                placeholder="you@yourcompany.com"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Google App Password
              </label>
              <input
                type="password"
                required
                value={smtpPass}
                onChange={(e) => setSmtpPass(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
                placeholder="16-character app password"
                autoComplete="new-password"
              />
            </div>
            <button
              type="submit"
              disabled={saving === "smtp"}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg disabled:opacity-50"
            >
              {saving === "smtp" ? "Saving…" : "Save & use this email"}
            </button>
            <p className="text-xs text-gray-500">
              Create an App Password at{" "}
              <a
                href="https://myaccount.google.com/apppasswords"
                target="_blank"
                rel="noreferrer"
                className="underline text-blue-800"
              >
                myaccount.google.com/apppasswords
              </a>
            </p>
          </form>

          {config.oauthReady && (
            <div className="flex flex-wrap gap-2">
              <a
                href={
                  config.oauthAvailable
                    ? "/api/admin/email/connect?reconnect=1"
                    : "/api/admin/email/connect"
                }
                className="px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg"
              >
                {config.oauthAvailable ? "Reconnect Google" : "Connect Google account"}
              </a>
              {config.oauthAvailable && (
                <button
                  type="button"
                  disabled={saving === "disconnect"}
                  onClick={disconnect}
                  className="px-4 py-2 border border-gray-300 text-sm rounded-lg disabled:opacity-50"
                >
                  Disconnect Google
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
