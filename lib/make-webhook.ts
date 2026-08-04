import { logActivity } from "@/lib/activity-log";
import { normalizeEnvValue } from "@/lib/apps-script-settings";

export interface MakeLeadPayload {
  _id?: unknown;
  name: string;
  phone: string;
  email: string;
  service: string;
  status?: string;
  userAgent?: string;
  referrer?: string;
  visitorId?: string;
  createdAt?: Date;
}

export function getMakeWebhookUrl(): string {
  return normalizeEnvValue(process.env.MAKE_WEBHOOK_URL);
}

export function isMakeWebhookConfigured(): boolean {
  return getMakeWebhookUrl().length > 0;
}

/**
 * Forwards a lead to the Make.com scenario webhook. Awaited on purpose by the
 * caller: a fire-and-forget send is killed when the serverless container
 * freezes after the response. The lead is already saved, so a failed send must
 * never fail the submission.
 */
export async function sendLeadToMakeWebhook(lead: MakeLeadPayload): Promise<void> {
  const url = getMakeWebhookUrl();
  if (!url) return;

  const logTitle = `Make.com webhook — ${lead.name}`;
  const createdAt = lead.createdAt ?? new Date();

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        leadId: lead._id ? String(lead._id) : undefined,
        name: lead.name,
        phone: lead.phone,
        email: lead.email,
        service: lead.service,
        status: lead.status ?? "new",
        userAgent: lead.userAgent ?? "",
        referrer: lead.referrer ?? "",
        visitorId: lead.visitorId ?? "",
        createdAt: createdAt.toISOString(),
        source: process.env.NEXT_PUBLIC_SITE_URL || "",
      }),
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) {
      const text = (await res.text().catch(() => "")).slice(0, 300);
      throw new Error(
        `Make webhook failed (HTTP ${res.status})${text ? ` — ${text}` : ""}`
      );
    }

    await logActivity({
      type: "notification",
      title: logTitle,
      detail: "leads-make-webhook",
      status: "sent",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await logActivity({
      type: "notification",
      title: logTitle,
      detail: "leads-make-webhook",
      status: "failed",
      error: message,
    });
    throw err instanceof Error ? err : new Error(message);
  }
}
