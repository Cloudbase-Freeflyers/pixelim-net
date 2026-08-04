import { logActivity } from "@/lib/activity-log";
import {
  getAppsScriptWebhookPublicSummary,
  isAppsScriptWebhookConfigured,
  normalizeEnvValue,
  validateAppsScriptWebhookUrl,
} from "@/lib/apps-script-settings";

export {
  isAppsScriptWebhookConfigured,
  getAppsScriptWebhookPublicSummary as getAppsScriptWebhookDiagnostics,
  normalizeEnvValue,
  validateAppsScriptWebhookUrl,
};

export interface AppsScriptLeadPayload {
  name: string;
  phone: string;
  email: string;
  service: string;
  status?: string;
  referrer?: string;
  visitorId?: string;
  createdAt?: Date;
}

export type AppsScriptPostOptions = {
  skipNotify?: boolean;
};

function assertValidWebhookUrl(url: string): void {
  validateAppsScriptWebhookUrl(url);
}

function parseAppsScriptResponse(text: string, httpStatus: number): Record<string, unknown> {
  const trimmed = text.trimStart();
  if (trimmed.startsWith("<!DOCTYPE") || trimmed.startsWith("<html")) {
    throw new Error(
      "Webhook URL returned a Google web page (HTML), not JSON — use Apps Script → Deploy → Web app → copy the URL ending in /exec. Do not use the Google Sheet link."
    );
  }
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    throw new Error(
      `Webhook returned invalid JSON (HTTP ${httpStatus}) — check the /exec URL in admin Sheet webhook settings.`
    );
  }
}

function formatWebhookError(
  errMsg: string,
  context?: { siteSecretLength?: number; expectedSecretLength?: number }
): string {
  if (
    errMsg.includes("<!DOCTYPE") ||
    errMsg.includes("<html") ||
    errMsg.toLowerCase().includes("google web page")
  ) {
    return (
      "Wrong webhook URL — paste the Apps Script Web App URL (script.google.com/.../exec), not a Google Sheet or Drive link."
    );
  }
  if (errMsg.toLowerCase().includes("webhook_secret_not_configured")) {
    return (
      "Google Sheet Config is missing the webhook secret — in the Config tab, row APPS_SCRIPT_WEBHOOK_SECRET must have the secret in column B (Value), not only in column A (Key)."
    );
  }
  if (errMsg.toLowerCase().includes("unauthorized")) {
    const siteLen = context?.siteSecretLength;
    const sheetLen = context?.expectedSecretLength;
    if (siteLen && sheetLen && siteLen !== sheetLen) {
      return (
        `Secret mismatch — the site is sending ${siteLen} characters but the Google Sheet expects ${sheetLen}. ` +
        "Open Sheet → Config → APPS_SCRIPT_WEBHOOK_SECRET and copy only column B into admin (no key name, no quotes)."
      );
    }
    return (
      "Webhook secret mismatch — open Google Sheet → Config → APPS_SCRIPT_WEBHOOK_SECRET, copy column B exactly into admin → Save & verify."
    );
  }
  return errMsg;
}

async function postOnce(
  config: { url: string; secret: string; source: "mongo" | "env" },
  body: Record<string, unknown>
): Promise<{ ok: boolean; parsed: Record<string, unknown>; text: string }> {
  assertValidWebhookUrl(config.url);

  let res: Response;
  try {
    res = await fetch(config.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...body, secret: config.secret }),
      redirect: "follow",
    });
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : String(err));
  }

  const text = await res.text();
  const parsed = parseAppsScriptResponse(text, res.status);

  const httpStatus =
    typeof parsed.httpStatus === "number" ? parsed.httpStatus : res.status;
  const ok = parsed.ok === true && httpStatus >= 200 && httpStatus < 300;

  if (!ok) {
    const rawErr =
      (typeof parsed.error === "string" && parsed.error) ||
      `Apps Script webhook failed (HTTP ${httpStatus})`;
    const err = new Error(
      formatWebhookError(rawErr, {
        siteSecretLength: config.secret.length,
        expectedSecretLength:
          typeof parsed.expectedSecretLength === "number"
            ? parsed.expectedSecretLength
            : undefined,
      })
    ) as Error & { rawErr?: string; unauthorized?: boolean };
    err.rawErr = rawErr;
    err.unauthorized = rawErr.toLowerCase().includes("unauthorized");
    throw err;
  }

  return { ok: true, parsed, text };
}

async function postToAppsScript(
  body: Record<string, unknown>,
  logTitle: string
): Promise<{ ok: boolean; parsed: Record<string, unknown>; text: string }> {
  const { getWebhookConfigCandidates } = await import("@/lib/apps-script-settings");
  const candidates = await getWebhookConfigCandidates();
  if (!candidates.length) {
    throw new Error("Apps Script webhook is not configured");
  }

  let lastError: Error | null = null;
  for (let i = 0; i < candidates.length; i++) {
    const config = candidates[i];
    try {
      return await postOnce(config, body);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      lastError = error;
      const unauthorized = (error as Error & { unauthorized?: boolean }).unauthorized;
      if (unauthorized && config.source === "mongo") {
        try {
          const { clearAppsScriptWebhookConfig } = await import(
            "@/lib/apps-script-settings"
          );
          await clearAppsScriptWebhookConfig();
        } catch {
          /* ignore clear failure */
        }
      }
      if (unauthorized && i < candidates.length - 1) {
        continue;
      }
      await logActivity({
        type: "notification",
        title: logTitle,
        detail: `leads-apps-script (${config.source})`,
        status: "failed",
        error: (error as Error & { rawErr?: string }).rawErr || error.message,
      });
      throw error;
    }
  }
  throw lastError ?? new Error("Apps Script webhook failed");
}

export async function testAppsScriptWebhookConnection(): Promise<{
  ok: boolean;
  error?: string;
}> {
  try {
    await postToAppsScript(
      {
        backlog: true,
        skipNotify: true,
        replace: false,
        leads: [
          {
            name: "Webhook Test",
            phone: "050-0000000",
            email: "webhook-test@pixelim.local",
            service: "Test",
            status: "new",
            createdAt: new Date().toISOString(),
          },
        ],
      },
      "Sheet webhook connection test"
    );
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Connection test failed",
    };
  }
}

export async function notifyLeadViaAppsScript(
  lead: AppsScriptLeadPayload,
  options: AppsScriptPostOptions = {}
): Promise<void> {
  const logTitle = `New Lead from Website — ${lead.name}`;
  const { parsed } = await postToAppsScript(
    {
      name: lead.name,
      phone: lead.phone,
      email: lead.email,
      service: lead.service,
      referrer: lead.referrer ?? "",
      visitorId: lead.visitorId ?? "",
      status: lead.status ?? "new",
      createdAt: (lead.createdAt ?? new Date()).toISOString(),
      skipNotify: options.skipNotify === true,
    },
    logTitle
  );

  const recipients = Array.isArray(parsed.recipients)
    ? (parsed.recipients as string[])
    : [];
  await logActivity({
    type: "notification",
    title: logTitle,
    detail: options.skipNotify ? "leads-apps-script-backlog" : "leads-apps-script",
    recipients,
    status: "sent",
  });
}

export async function syncLeadsBacklogToAppsScript(
  leads: AppsScriptLeadPayload[],
  options: { skipNotify?: boolean; batchSize?: number; replace?: boolean } = {}
): Promise<{ imported: number; batches: number }> {
  const batchSize = options.batchSize ?? 25;
  const skipNotify = options.skipNotify !== false;
  const replace = options.replace === true;
  let imported = 0;
  let batches = 0;

  for (let i = 0; i < leads.length; i += batchSize) {
    const chunk = leads.slice(i, i + batchSize);
    const logTitle = `Backlog sync batch ${batches + 1} (${chunk.length} leads)`;
    const { parsed } = await postToAppsScript(
      {
        backlog: true,
        skipNotify,
        replace: replace && batches === 0,
        leads: chunk.map((lead) => ({
          name: lead.name,
          phone: lead.phone,
          email: lead.email,
          service: lead.service,
          status: lead.status ?? "new",
          referrer: lead.referrer ?? "",
          visitorId: lead.visitorId ?? "",
          createdAt: (lead.createdAt ?? new Date()).toISOString(),
        })),
      },
      logTitle
    );
    imported += typeof parsed.imported === "number" ? parsed.imported : chunk.length;
    batches++;
    await logActivity({
      type: "notification",
      title: logTitle,
      detail: "leads-apps-script-backlog",
      status: "sent",
    });
  }

  return { imported, batches };
}
