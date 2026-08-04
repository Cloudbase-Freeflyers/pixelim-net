import { getDb } from "@/lib/db";
import { getConnectedEmailSender } from "@/lib/email-sender";
import {
  getSmtpConfig,
  getSmtpPublicSummary,
  isSmtpConfigured,
} from "@/lib/smtp-email";

export type EmailTransport = "oauth" | "smtp";

interface EmailSettingsDoc {
  _id: string;
  preferredTransport: EmailTransport;
  updatedAt?: Date;
}

const DOC_ID = "default";

export async function getPreferredTransport(): Promise<EmailTransport> {
  const db = await getDb();
  const doc = await db
    .collection<EmailSettingsDoc>("email_settings")
    .findOne({ _id: DOC_ID });
  if (doc?.preferredTransport === "smtp" || doc?.preferredTransport === "oauth") {
    return doc.preferredTransport;
  }
  return "oauth";
}

export async function setPreferredTransport(
  transport: EmailTransport
): Promise<void> {
  const db = await getDb();
  await db.collection<EmailSettingsDoc>("email_settings").updateOne(
    { _id: DOC_ID },
    {
      $set: {
        preferredTransport: transport,
        updatedAt: new Date(),
      },
    },
    { upsert: true }
  );
}

export async function resolveActiveTransport(): Promise<{
  preferred: EmailTransport;
  active: EmailTransport | null;
  oauthAvailable: boolean;
  smtpAvailable: boolean;
  oauthEmail: string | null;
  smtpFrom: string | null;
  smtpHost: string | null;
  smtpSource: "mongo" | "env" | null;
}> {
  const preferred = await getPreferredTransport();
  const smtp = await getSmtpConfig();
  const connected = await getConnectedEmailSender();
  const smtpAvailable = Boolean(smtp);
  const oauthAvailable = Boolean(connected);

  let active: EmailTransport | null = null;
  if (preferred === "smtp" && smtpAvailable) active = "smtp";
  else if (preferred === "oauth" && oauthAvailable) active = "oauth";
  else if (preferred === "smtp" && oauthAvailable) active = "oauth";
  else if (preferred === "oauth" && smtpAvailable) active = "smtp";

  return {
    preferred,
    active,
    oauthAvailable,
    smtpAvailable,
    oauthEmail: connected?.senderEmail ?? null,
    smtpFrom: smtp?.from ?? null,
    smtpHost: smtp?.host ?? null,
    smtpSource: smtp?.source ?? null,
  };
}

export function transportLabel(t: EmailTransport | null): string {
  if (t === "smtp") return "SMTP";
  if (t === "oauth") return "Gmail OAuth";
  return "None";
}

export { getSmtpPublicSummary, isSmtpConfigured };
