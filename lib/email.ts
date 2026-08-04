import {
  getConnectedEmailSender,
  getEmailSenderRecord,
  markEmailSenderDead,
  updateEmailSenderRefreshToken,
} from "@/lib/email-sender";
import { getGoogleOAuthCredentials } from "@/lib/gmail-oauth";
import { getApprovedEmailsForTopic } from "@/lib/notification-subscribers";
import { logActivity } from "@/lib/activity-log";
import { renderNotificationEmail, type NotificationEmail } from "@/lib/email-template";
import { getSmtpConfig, sendViaSmtp } from "@/lib/smtp-email";
import {
  resolveActiveTransport,
  transportLabel,
  type EmailTransport,
} from "@/lib/email-transport";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://pixelim.net";
/** Google OAuth apps in "Testing" expire refresh tokens after 7 days. */
const TESTING_MODE_TOKEN_DAYS = 7;

export type GmailSendDiagnostics = {
  hypothesisHints: string[];
  senderEmail: string | null;
  connectedAt: string | null;
  tokenAgeDays: number | null;
  tokenLen: number;
  tokenFingerprint: string | null;
  clientIdSuffix: string | null;
  recipientIndex: number;
  recipientCount: number;
  tokensEventFired: boolean;
  newRefreshTokenReturned: boolean;
  googleError: string | null;
  googleErrorDescription: string | null;
  googleErrorStatus: number | null;
};

export class GmailSendError extends Error {
  diagnostics: GmailSendDiagnostics;
  constructor(message: string, diagnostics: GmailSendDiagnostics) {
    super(message);
    this.name = "GmailSendError";
    this.diagnostics = diagnostics;
  }
}

function tokenFingerprint(token: string): string {
  // Non-reversible short fingerprint — never log the token itself
  let h = 0;
  for (let i = 0; i < token.length; i++) h = (h * 31 + token.charCodeAt(i)) | 0;
  return `t${Math.abs(h).toString(16)}_${token.length}`;
}

export async function isEmailConfigured(): Promise<boolean> {
  const { active } = await resolveActiveTransport();
  return Boolean(active);
}

export async function getEmailConfigSummary() {
  const resolved = await resolveActiveTransport();
  // Raw record so an expired connection is still reportable to the admin
  const record = await getEmailSenderRecord();
  const oauthReady = Boolean(getGoogleOAuthCredentials());
  const tokenAgeDays = record?.connectedAt
    ? Math.round(
        ((Date.now() - new Date(record.connectedAt).getTime()) /
          (24 * 60 * 60 * 1000)) *
          10
      ) / 10
    : null;
  const testingModeRisk =
    resolved.active === "oauth" &&
    tokenAgeDays != null &&
    tokenAgeDays >= TESTING_MODE_TOKEN_DAYS - 1;

  const activeFrom =
    resolved.active === "smtp"
      ? resolved.smtpFrom
      : resolved.active === "oauth"
        ? resolved.oauthEmail
        : null;

  return {
    configured: Boolean(resolved.active),
    transport: resolved.active,
    preferredTransport: resolved.preferred,
    oauthAvailable: resolved.oauthAvailable,
    smtpAvailable: resolved.smtpAvailable,
    connectedSenderEmail: activeFrom,
    oauthEmail: resolved.oauthEmail,
    smtpFrom: resolved.smtpFrom,
    connectedAt: record?.connectedAt?.toISOString() || null,
    tokenAgeDays,
    testingModeRisk,
    oauthDead: Boolean(record?.deadSince),
    oauthDeadSince: record?.deadSince?.toISOString() || null,
    oauthDeadReason: record?.deadReason || null,
    oauthDeadSenderEmail: record?.deadSince ? record.senderEmail : null,
    smtpConfigured: resolved.smtpAvailable,
    smtpHost: resolved.smtpHost,
    smtpSource: resolved.smtpSource,
    oauthReady,
    oauthRedirectUri: oauthReady
      ? `${SITE_URL}/api/email/oauth/callback`
      : null,
  };
}

function isInvalidGrantError(msg: string, googleError: string | null): boolean {
  return /invalid_grant/i.test(msg) || googleError === "invalid_grant";
}

function humanInvalidGrantMessage(tokenAgeDays: number | null): string {
  if (tokenAgeDays != null && tokenAgeDays >= 6.5) {
    return (
      "Gmail access expired (invalid_grant). Google OAuth apps in Testing mode " +
      "expire after 7 days — reconnect Gmail, then publish the OAuth consent screen " +
      "to Production in Google Cloud so this stops recurring."
    );
  }
  return (
    "Gmail access was revoked or expired (invalid_grant). " +
    "Reconnect Gmail to restore lead notifications."
  );
}

async function sendViaConnectedGmail(
  sender: {
    senderEmail: string;
    refreshToken: string;
    connectedAt?: Date;
  },
  params: { to: string; subject: string; text: string; html: string },
  meta?: { recipientIndex: number; recipientCount: number }
) {
  const creds = getGoogleOAuthCredentials();
  if (!creds) throw new Error("Google OAuth is not configured");

  const recipientIndex = meta?.recipientIndex ?? 0;
  const recipientCount = meta?.recipientCount ?? 1;
  const tokenAgeDays = sender.connectedAt
    ? Math.round(
        ((Date.now() - new Date(sender.connectedAt).getTime()) /
          (24 * 60 * 60 * 1000)) *
          10
      ) / 10
    : null;

  const diag: GmailSendDiagnostics = {
    hypothesisHints: [],
    senderEmail: sender.senderEmail,
    connectedAt: sender.connectedAt
      ? new Date(sender.connectedAt).toISOString()
      : null,
    tokenAgeDays,
    tokenLen: sender.refreshToken?.length ?? 0,
    tokenFingerprint: sender.refreshToken
      ? tokenFingerprint(sender.refreshToken)
      : null,
    clientIdSuffix: creds.clientId.slice(-8),
    recipientIndex,
    recipientCount,
    tokensEventFired: false,
    newRefreshTokenReturned: false,
    googleError: null,
    googleErrorDescription: null,
    googleErrorStatus: null,
  };


  const { google } = await import("googleapis");
  const oauth2 = new google.auth.OAuth2(creds.clientId, creds.clientSecret);
  oauth2.setCredentials({
    refresh_token: sender.refreshToken,
    scope: "https://www.googleapis.com/auth/gmail.send",
  });

  oauth2.on("tokens", (tokens) => {
    diag.tokensEventFired = true;
    diag.newRefreshTokenReturned = Boolean(tokens.refresh_token);
    if (tokens.refresh_token) {
      diag.hypothesisHints.push("A: Google returned a NEW refresh_token — persisting to Mongo");
      // Fire-and-forget persist; send continues with in-memory credentials
      void updateEmailSenderRefreshToken(tokens.refresh_token).catch((persistErr) => {
        console.error("[email] failed to persist rotated refresh token", persistErr);
      });
    }
  });

  const gmail = google.gmail({ version: "v1", auth: oauth2 });
  const boundary = `pixelim_${Date.now()}`;
  const encodeSubject = (subject: string) =>
    `=?UTF-8?B?${Buffer.from(subject, "utf8").toString("base64")}?=`;

  const lines = [
    `From: ${sender.senderEmail}`,
    `To: ${params.to}`,
    `Subject: ${encodeSubject(params.subject)}`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: base64",
    "",
    Buffer.from(params.text, "utf8").toString("base64"),
    `--${boundary}`,
    "Content-Type: text/html; charset=UTF-8",
    "Content-Transfer-Encoding: base64",
    "",
    Buffer.from(params.html, "utf8").toString("base64"),
    `--${boundary}--`,
  ];

  const raw = Buffer.from(lines.join("\r\n"))
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  try {
    await gmail.users.messages.send({ userId: "me", requestBody: { raw } });
  } catch (err) {
    const anyErr = err as {
      message?: string;
      code?: number | string;
      response?: { status?: number; data?: { error?: string; error_description?: string } };
    };
    diag.googleError =
      anyErr.response?.data?.error ||
      (typeof anyErr.code === "string" ? anyErr.code : null) ||
      null;
    diag.googleErrorDescription =
      anyErr.response?.data?.error_description || null;
    diag.googleErrorStatus = anyErr.response?.status ?? null;

    const msg = anyErr.message || String(err);
    if (isInvalidGrantError(msg, diag.googleError)) {
      if (diag.tokenAgeDays != null && diag.tokenAgeDays >= 6.5) {
        diag.hypothesisHints.push(
          "D: token age >= ~7 days — Google OAuth Testing-mode refresh tokens expire after 7 days"
        );
      }
      if (diag.newRefreshTokenReturned) {
        diag.hypothesisHints.push(
          "A: invalid_grant after Google rotated refresh_token"
        );
      }
      if (recipientIndex > 0) {
        diag.hypothesisHints.push(
          "B: failed on later recipient — possible concurrent/sequential refresh race"
        );
      }
      if (/expired|revoked/i.test(diag.googleErrorDescription || msg)) {
        diag.hypothesisHints.push(
          "C: Google says token expired or revoked (password change, revoke, or security reset)"
        );
      }
      diag.hypothesisHints.push(
        "E: check client secret rotation / reconnect without fresh refresh_token"
      );

      // Dead token — flag it (not delete) so the admin sees why sending stopped
      try {
        await markEmailSenderDead(
          diag.googleErrorDescription ||
            diag.googleError ||
            "invalid_grant"
        );
      } catch (markErr) {
        console.error("[email] failed to flag dead Gmail connection", markErr);
      }
    }


    const publicMsg = isInvalidGrantError(msg, diag.googleError)
      ? humanInvalidGrantMessage(diag.tokenAgeDays)
      : msg;
    throw new GmailSendError(publicMsg, diag);
  }
}

/**
 * Sends ONE message addressed to every recipient rather than looping and
 * sending a separate copy each. One send means one thread the team can reply
 * to, and it removes the partial-failure case where recipient 1 got the lead
 * and recipient 2 did not.
 */
async function dispatch(
  connected: {
    senderEmail: string;
    refreshToken: string;
    connectedAt?: Date;
  } | null,
  recipients: string[],
  msg: { subject: string; text: string; html: string },
  active: EmailTransport
): Promise<void> {
  const to = recipients.join(", ");

  if (active === "smtp") {
    const smtp = await getSmtpConfig();
    if (!smtp) throw new Error("SMTP is selected but not configured");
    try {
      await sendViaSmtp({ to, ...msg });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      throw err;
    }
    return;
  }

  if (!connected) throw new Error("Gmail OAuth is selected but not connected");
  await sendViaConnectedGmail(connected, { to, ...msg }, {
    recipientIndex: 0,
    recipientCount: recipients.length,
  });
}

async function notifyTopic(
  build: () => NotificationEmail
): Promise<void> {
  const content = build();
  const logTitle = content.subheading
    ? `${content.heading} — ${content.subheading}`
    : content.heading;
  const connected = await getConnectedEmailSender();
  const { active } = await resolveActiveTransport();

  if (!active) {
    // Distinguish "never set up" from "Gmail token was rejected" — the second
    // one is a live outage and must not be logged as a benign skip.
    const record = await getEmailSenderRecord();
    if (record?.deadSince) {
      await logActivity({
        type: "notification",
        title: logTitle,
        detail: "leads — gmail expired",
        status: "failed",
        error:
          `Gmail OAuth for ${record.senderEmail} was rejected by Google on ` +
          `${record.deadSince.toISOString()} (${record.deadReason || "invalid_grant"}). ` +
          `Reconnect Gmail or switch to SMTP.`,
      });
      return;
    }
    await logActivity({
      type: "notification",
      title: logTitle,
      detail: "leads — email not configured",
      status: "skipped",
      error: "email_not_configured",
    });
    return;
  }

  const recipients = await getApprovedEmailsForTopic("leads");
  const emails = Array.from(new Set(recipients.map((e) => e.toLowerCase())));

  if (emails.length === 0) {
    await logActivity({
      type: "notification",
      title: logTitle,
      detail: "leads — no approved recipients",
      status: "skipped",
    });
    return;
  }

  const { html, text } = renderNotificationEmail(content);

  try {
    await dispatch(connected, emails, { subject: content.subject, text, html }, active);
    await logActivity({
      type: "notification",
      title: logTitle,
      detail: active === "smtp" ? "leads-smtp" : "leads",
      recipients: emails,
      status: "sent",
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const diagnostics =
      err instanceof GmailSendError ? err.diagnostics : undefined;
    await logActivity({
      type: "notification",
      title: logTitle,
      detail: active === "smtp" ? "leads-smtp" : "leads",
      recipients: emails,
      status: "failed",
      error: diagnostics
        ? `${msg} | diag:${JSON.stringify({
            googleError: diagnostics.googleError,
            googleErrorDescription: diagnostics.googleErrorDescription,
            tokenAgeDays: diagnostics.tokenAgeDays,
            newRefreshTokenReturned: diagnostics.newRefreshTokenReturned,
            tokensEventFired: diagnostics.tokensEventFired,
            recipientIndex: diagnostics.recipientIndex,
            tokenFingerprint: diagnostics.tokenFingerprint,
            hints: diagnostics.hypothesisHints,
          })}`
        : msg,
    });
    throw err;
  }
}

export async function sendTestNotification(
  to?: string
): Promise<{
  recipients: string[];
  transportMeta: {
    preferred: EmailTransport;
    active: EmailTransport | null;
    smtpAvailable: boolean;
    oauthAvailable: boolean;
    from: string;
  };
}> {
  const resolved = await resolveActiveTransport();
  const transportMeta = {
    preferred: resolved.preferred,
    active: resolved.active,
    smtpAvailable: resolved.smtpAvailable,
    oauthAvailable: resolved.oauthAvailable,
    from:
      resolved.active === "smtp"
        ? resolved.smtpFrom ?? "—"
        : resolved.oauthEmail ?? "—",
  };


  if (!resolved.active) {
    throw new Error(
      "Email not configured — connect Gmail OAuth and/or set SMTP_* env vars, then select a transport."
    );
  }

  const connected = await getConnectedEmailSender();
  const fromAddress = transportMeta.from;
  const recipients = to?.trim()
    ? [to.trim().toLowerCase()]
    : await getApprovedEmailsForTopic("leads");

  if (recipients.length === 0) {
    throw new Error("No approved recipients — add an email to the list first.");
  }

  const { html, text } = renderNotificationEmail({
    subject: "Pixelim · Notification Test",
    kicker: "Test",
    heading: "Notification System Test",
    rows: [
      { label: "Type", value: "leads" },
      { label: "Transport", value: transportLabel(resolved.active), ltr: true },
      { label: "Sent from", value: fromAddress, ltr: true },
    ],
    note: { text: "If you received this — notifications are active. ✓", tone: "success" },
  });

  try {
    await dispatch(
      connected,
      recipients,
      {
        subject: "Pixelim · Notification Test",
        text,
        html,
      },
      resolved.active
    );
    await logActivity({
      type: "notification",
      title: "Notification Test",
      detail: resolved.active === "smtp" ? "test-smtp" : "test",
      recipients,
      status: "sent",
    });
    return { recipients, transportMeta };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const diagnostics =
      err instanceof GmailSendError ? err.diagnostics : undefined;
    await logActivity({
      type: "notification",
      title: "Notification Test",
      detail: resolved.active === "smtp" ? "test-smtp" : "test",
      recipients,
      status: "failed",
      error: diagnostics
        ? `${msg} | diag:${JSON.stringify({
            googleError: diagnostics.googleError,
            googleErrorDescription: diagnostics.googleErrorDescription,
            tokenAgeDays: diagnostics.tokenAgeDays,
            newRefreshTokenReturned: diagnostics.newRefreshTokenReturned,
            tokensEventFired: diagnostics.tokensEventFired,
            recipientIndex: diagnostics.recipientIndex,
            tokenFingerprint: diagnostics.tokenFingerprint,
            hints: diagnostics.hypothesisHints,
          })}`
        : `${msg} | transport=${resolved.active} preferred=${resolved.preferred} smtpAvailable=${resolved.smtpAvailable}`,
    });
    const enriched = Object.assign(
      err instanceof Error ? err : new Error(msg),
      { transportMeta }
    );
    throw enriched;
  }
}

interface LeadData {
  name: string;
  phone: string;
  email: string;
  service: string;
  createdAt?: Date;
  _id?: unknown;
}

export async function notifyNewLead(lead: LeadData): Promise<void> {
  await notifyTopic(() => ({
    subject: `Pixelim · New Lead — ${lead.name}`,
    kicker: "New Lead",
    heading: "New Lead from Website",
    subheading: lead.name,
    rows: [
      { label: "Name", value: lead.name },
      { label: "Phone", value: lead.phone, ltr: true },
      { label: "Email", value: lead.email, ltr: true },
      { label: "Service", value: lead.service },
      {
        label: "Submitted",
        value: (lead.createdAt ?? new Date()).toLocaleString("en-US", {
          timeZone: "America/New_York",
          dateStyle: "medium",
          timeStyle: "short",
        }),
        ltr: true,
      },
    ],
    cta: { label: "View in Admin", url: `${SITE_URL}/admin/leads` },
  }));
}
