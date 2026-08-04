"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";

type Diagnostics = {
  active: Summary;
  mongo: { configured: boolean; secretLength: number; secretPrefix: string | null };
  env: { configured: boolean; secretLength: number; secretPrefix: string | null };
  sheetSecretLength: number | null;
  sheetSecretPrefix: string | null;
};

type Summary = {
  configured: boolean;
  source: "mongo" | "env" | null;
  url: string | null;
  urlHost: string | null;
  deploymentId: string | null;
  secretLength: number;
  secretPrefix: string | null;
};

/** Set once you deploy this app's own Apps Script (see google-apps-script README). */
export const WORKING_WEBHOOK_URL = "";

export default function SheetWebhookSettings() {
  const [diagnostics, setDiagnostics] = useState<Diagnostics | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [url, setUrl] = useState(WORKING_WEBHOOK_URL);
  const [secret, setSecret] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/leads/sheet-webhook");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load");
      setDiagnostics(data);
      setSummary(data.active ?? data);
      if (data.url) setUrl(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!secret.trim()) {
      setError("Paste the secret from Sheet Config column B — required every time you save.");
      return;
    }
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const res = await fetch("/api/admin/leads/sheet-webhook", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, secret: secret.trim(), test: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      if (data.test && !data.test.ok) {
        throw new Error(data.test.error || "Secret test failed");
      }
      setSummary(data);
      if (data.url) setUrl(data.url);
      setSecret("");
      setNotice("Sheet webhook saved and verified — you can Sync to Sheet now.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function testConnection() {
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const res = await fetch("/api/admin/leads/sheet-webhook", { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.test?.ok) {
        throw new Error(data.test?.error || data.error || "Test failed");
      }
      setNotice("Sheet webhook connection OK.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Test failed");
    } finally {
      setSaving(false);
    }
  }

  async function resetSettings() {
    if (!confirm("Clear saved webhook URL and secret? You will need to paste them again.")) return;
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const res = await fetch("/api/admin/leads/sheet-webhook", { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Reset failed");
      setSummary(data);
      setUrl(WORKING_WEBHOOK_URL);
      setSecret("");
      setNotice("Cleared — paste URL and secret from Sheet, then Save & verify.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reset failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-xl border-2 border-blue-200 bg-blue-50/40 px-4 py-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-gray-900">Google Sheet webhook</p>
          <p className="text-xs text-gray-600 mt-1 max-w-2xl">
            Paste URL + secret here on <strong>pixelim.net</strong>. Must match Google Sheet
            → Config → <strong>APPS_SCRIPT_WEBHOOK_SECRET</strong> column B exactly (64 chars,
            no key name).
          </p>
          {!loading && diagnostics && (
            <div className="text-xs text-gray-600 mt-2 space-y-1">
              <p>
                <strong>Sheet expects:</strong> {diagnostics.sheetSecretLength ?? "?"} chars
                {diagnostics.sheetSecretPrefix ? ` (${diagnostics.sheetSecretPrefix}…)` : ""} ·{" "}
                <strong>MongoDB:</strong>{" "}
                {diagnostics.mongo.configured
                  ? `${diagnostics.mongo.secretLength} chars (${diagnostics.mongo.secretPrefix}…)`
                  : "not set"}{" "}
                · <strong>Vercel env:</strong>{" "}
                {diagnostics.env.configured
                  ? `${diagnostics.env.secretLength} chars (${diagnostics.env.secretPrefix}…)`
                  : "not set"}
              </p>
              {diagnostics.sheetSecretPrefix &&
                diagnostics.mongo.configured &&
                diagnostics.mongo.secretPrefix !== diagnostics.sheetSecretPrefix && (
                  <p className="text-red-700 font-medium">
                    MongoDB secret does not match Sheet — click Reset, re-paste column B only, Save
                    & verify.
                  </p>
                )}
              {diagnostics.sheetSecretPrefix &&
                diagnostics.env.configured &&
                diagnostics.env.secretPrefix !== diagnostics.sheetSecretPrefix && (
                  <p className="text-amber-800 font-medium">
                    Vercel env secret does not match Sheet — update APPS_SCRIPT_WEBHOOK_SECRET in
                    Vercel (64 chars, no key name) and redeploy.
                  </p>
                )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {summary?.configured && (
            <button
              type="button"
              onClick={testConnection}
              disabled={saving || loading}
              className="text-sm px-3 py-1.5 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Test
            </button>
          )}
          <button
            type="button"
            onClick={resetSettings}
            disabled={saving || loading}
            className="text-sm px-3 py-1.5 border border-red-200 text-red-700 rounded-lg bg-white hover:bg-red-50 disabled:opacity-50"
          >
            Reset
          </button>
        </div>
      </div>

      {notice && (
        <div className="mt-3 rounded-lg bg-green-50 border border-green-200 px-3 py-2 text-sm text-green-800">
          {notice}
        </div>
      )}

      {error && (
        <div className="mt-3 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-800">
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="mt-4 space-y-3 border-t border-blue-200 pt-4">
        <label className="block">
          <span className="text-xs font-medium text-gray-700">Web App URL</span>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="mt-1 w-full text-sm border border-gray-300 rounded-lg px-3 py-2 font-mono bg-white"
            required
            disabled={loading}
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-gray-700">
            Webhook secret (Sheet Config → APPS_SCRIPT_WEBHOOK_SECRET → column B)
          </span>
          <input
            type="password"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            placeholder="Paste secret — required every save"
            className="mt-1 w-full text-sm border border-gray-300 rounded-lg px-3 py-2 font-mono bg-white"
            required
            disabled={loading}
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={saving || loading || !secret.trim()}
            className="text-sm px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save & verify"}
          </button>
        </div>
      </form>
    </div>
  );
}
