import { getDb } from "@/lib/db";

export type AppsScriptWebhookConfig = {
  url: string;
  secret: string;
  source: "mongo" | "env";
};

type AppsScriptStored = {
  url: string;
  secret: string;
  updatedAt?: Date;
};

interface EmailSettingsDoc {
  _id: string;
  appsScript?: AppsScriptStored;
}

const SETTINGS_ID = "default";

const ENV_PREFIXES = [
  "APPS_SCRIPT_WEBHOOK_URL",
  "APPS_SCRIPT_WEBHOOK_SECRET",
  "WEBHOOK_SECRET",
];

export function normalizeEnvValue(raw: string | undefined): string {
  let v = (raw ?? "").replace(/\r/g, "").trim();
  if (!v) return "";

  if (v.includes("\n")) {
    v = v.split("\n")[0].trim();
  }

  for (const prefix of ENV_PREFIXES) {
    if (v.startsWith(`${prefix}=`)) {
      v = v.slice(prefix.length + 1).trim();
      break;
    }
  }

  if (
    (v.startsWith('"') && v.endsWith('"')) ||
    (v.startsWith("'") && v.endsWith("'"))
  ) {
    v = v.slice(1, -1).trim();
  }

  return v;
}

/** Collapse accidental line breaks inside pasted URLs/secrets. */
export function normalizeWebhookUrl(raw: string): string {
  let v = (raw ?? "").replace(/\r/g, "").trim();
  if (v.startsWith("APPS_SCRIPT_WEBHOOK_URL=")) {
    v = v.slice("APPS_SCRIPT_WEBHOOK_URL=".length).trim();
  }
  return v.replace(/\s+/g, "");
}

function normalizeWebhookSecret(raw: string): string {
  return normalizeEnvValue(raw).replace(/\s+/g, "");
}

/** Must be Apps Script Web App /exec — not a Sheet, Drive, or login page URL. */
export function validateAppsScriptWebhookUrl(url: string): void {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error(
      "Invalid webhook URL — paste the full https://script.google.com/macros/s/…/exec link from Apps Script → Deploy → Web app."
    );
  }

  if (parsed.hostname !== "script.google.com") {
    throw new Error(
      `Wrong URL host "${parsed.hostname}" — use script.google.com/macros/s/…/exec from Apps Script Deploy, not a Google Sheet or Drive link.`
    );
  }

  if (!/\/macros\/s\/[^/]+\/exec\/?$/i.test(parsed.pathname)) {
    throw new Error(
      "Webhook URL must end with /exec — in Apps Script choose Deploy → Web app and copy the URL that ends in /exec (not /dev)."
    );
  }
}

export async function probeAppsScriptWebhookUrl(
  url: string
): Promise<{
  ok: boolean;
  error?: string;
  sheetSecretLength?: number;
  sheetSecretPrefix?: string;
}> {
  validateAppsScriptWebhookUrl(url);
  try {
    const res = await fetch(url, { method: "GET", redirect: "follow" });
    const text = await res.text();
    if (text.trimStart().startsWith("<!DOCTYPE") || text.trimStart().startsWith("<html")) {
      return {
        ok: false,
        error:
          "URL returned a Google web page instead of the webhook — paste the Web App /exec URL from Apps Script → Deploy, not the Sheet link.",
      };
    }
    let parsed: Record<string, unknown> = {};
    try {
      parsed = JSON.parse(text) as Record<string, unknown>;
    } catch {
      return {
        ok: false,
        error: `URL did not return JSON (HTTP ${res.status}) — check the /exec Web App URL.`,
      };
    }
    if (parsed.ok !== true || parsed.service !== "pixelim-leads") {
      return {
        ok: false,
        error: "URL is reachable but does not look like the Pixelim leads webhook.",
      };
    }
    const sheetSecretLength =
      typeof parsed.secretLength === "number" ? parsed.secretLength : undefined;
    const sheetSecretPrefix =
      typeof parsed.secretPrefix === "string" ? parsed.secretPrefix : undefined;
    return { ok: true, sheetSecretLength, sheetSecretPrefix };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not reach webhook URL",
    };
  }
}

function fromEnv(): Omit<AppsScriptWebhookConfig, "source"> | null {
  const url = normalizeWebhookUrl(process.env.APPS_SCRIPT_WEBHOOK_URL || "");
  const secret = normalizeWebhookSecret(
    process.env.APPS_SCRIPT_WEBHOOK_SECRET || ""
  );
  if (!url || !secret) return null;
  return { url, secret };
}

export function getEnvAppsScriptWebhookConfig(): AppsScriptWebhookConfig | null {
  const env = fromEnv();
  return env ? { ...env, source: "env" } : null;
}

export async function getWebhookConfigCandidates(): Promise<AppsScriptWebhookConfig[]> {
  const candidates: AppsScriptWebhookConfig[] = [];
  const env = getEnvAppsScriptWebhookConfig();
  const stored = await getStoredAppsScriptConfig();
  if (env) {
    candidates.push(env);
  }
  if (stored) {
    const duplicate = candidates.some(
      (c) => c.url === stored.url && c.secret === stored.secret
    );
    if (!duplicate) {
      candidates.push({ url: stored.url, secret: stored.secret, source: "mongo" });
    }
  }
  return candidates;
}

export async function getStoredAppsScriptConfig(): Promise<AppsScriptStored | null> {
  const db = await getDb();
  const doc = await db
    .collection<EmailSettingsDoc>("email_settings")
    .findOne({ _id: SETTINGS_ID });
  const s = doc?.appsScript;
  if (!s?.url?.trim() || !s?.secret?.trim()) return null;
  return {
    url: s.url.trim(),
    secret: normalizeWebhookSecret(s.secret),
    updatedAt: s.updatedAt,
  };
}

export async function getAppsScriptWebhookConfig(): Promise<AppsScriptWebhookConfig | null> {
  const candidates = await getWebhookConfigCandidates();
  return candidates[0] ?? null;
}

export async function getAppsScriptWebhookDiagnosticsFull(): Promise<{
  active: Awaited<ReturnType<typeof getAppsScriptWebhookPublicSummary>>;
  mongo: { configured: boolean; secretLength: number; secretPrefix: string | null; url: string | null };
  env: { configured: boolean; secretLength: number; secretPrefix: string | null; url: string | null };
  sheetSecretLength: number | null;
  sheetSecretPrefix: string | null;
}> {
  const active = await getAppsScriptWebhookPublicSummary();
  const stored = await getStoredAppsScriptConfig();
  const env = getEnvAppsScriptWebhookConfig();
  let sheetSecretLength: number | null = null;
  let sheetSecretPrefix: string | null = null;
  const probeUrl = env?.url || stored?.url || null;
  if (probeUrl) {
    const probe = await probeAppsScriptWebhookUrl(probeUrl);
    if (probe.sheetSecretLength) sheetSecretLength = probe.sheetSecretLength;
    if (probe.sheetSecretPrefix) sheetSecretPrefix = probe.sheetSecretPrefix;
  }
  return {
    active,
    mongo: {
      configured: Boolean(stored),
      secretLength: stored?.secret.length ?? 0,
      secretPrefix: stored?.secret.slice(0, 4) ?? null,
      url: stored?.url ?? null,
    },
    env: {
      configured: Boolean(env),
      secretLength: env?.secret.length ?? 0,
      secretPrefix: env?.secret.slice(0, 4) ?? null,
      url: env?.url ?? null,
    },
    sheetSecretLength,
    sheetSecretPrefix,
  };
}

export async function isAppsScriptWebhookConfigured(): Promise<boolean> {
  return Boolean(await getAppsScriptWebhookConfig());
}

export async function saveAppsScriptWebhookConfig(params: {
  url: string;
  secret: string;
}): Promise<AppsScriptWebhookConfig> {
  const url = normalizeWebhookUrl(params.url || "");
  const secret = normalizeWebhookSecret(params.secret || "");

  if (!url) {
    throw new Error("Webhook URL is required");
  }
  if (!secret) {
    throw new Error(
      "Webhook secret is required — open Google Sheet → Config tab → copy the Value in APPS_SCRIPT_WEBHOOK_SECRET (column B only, not the key name)."
    );
  }

  validateAppsScriptWebhookUrl(url);

  const probe = await probeAppsScriptWebhookUrl(url);
  if (!probe.ok) {
    throw new Error(probe.error || "Webhook URL check failed");
  }
  if (
    probe.sheetSecretLength &&
    probe.sheetSecretLength > 0 &&
    secret.length !== probe.sheetSecretLength
  ) {
    throw new Error(
      `Secret length mismatch — Sheet expects ${probe.sheetSecretLength} characters but you pasted ${secret.length}. Copy only column B from APPS_SCRIPT_WEBHOOK_SECRET (no "APPS_SCRIPT_WEBHOOK_SECRET=" prefix).`
    );
  }

  const appsScript: AppsScriptStored = {
    url,
    secret,
    updatedAt: new Date(),
  };

  const db = await getDb();
  await db.collection<EmailSettingsDoc>("email_settings").updateOne(
    { _id: SETTINGS_ID },
    { $set: { appsScript, updatedAt: new Date() } },
    { upsert: true }
  );

  return { url, secret, source: "mongo" };
}

export async function clearAppsScriptWebhookConfig(): Promise<void> {
  const db = await getDb();
  await db.collection<EmailSettingsDoc>("email_settings").updateOne(
    { _id: SETTINGS_ID },
    { $unset: { appsScript: "" }, $set: { updatedAt: new Date() } }
  );
}

export async function getAppsScriptWebhookPublicSummary(): Promise<{
  configured: boolean;
  source: "mongo" | "env" | null;
  url: string | null;
  urlHost: string | null;
  deploymentId: string | null;
  secretLength: number;
  secretPrefix: string | null;
}> {
  const config = await getAppsScriptWebhookConfig();
  if (!config) {
    return {
      configured: false,
      source: null,
      url: null,
      urlHost: null,
      deploymentId: null,
      secretLength: 0,
      secretPrefix: null,
    };
  }

  let urlHost: string | null = null;
  let deploymentId: string | null = null;
  try {
    const parsed = new URL(config.url);
    urlHost = parsed.host;
    const match = parsed.pathname.match(/\/macros\/s\/([^/]+)\//);
    deploymentId = match?.[1] ?? null;
  } catch {
    urlHost = null;
  }

  return {
    configured: true,
    source: config.source,
    url: config.url,
    urlHost,
    deploymentId,
    secretLength: config.secret.length,
    secretPrefix: config.secret.slice(0, 4) || null,
  };
}
