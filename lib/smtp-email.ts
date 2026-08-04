/**
 * SMTP lead-notification transport (Gmail App Password / any SMTP).
 * Credentials: Mongo admin settings first, then SMTP_* env fallback.
 */

import { getDb } from "@/lib/db";

export type SmtpConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
  source: "mongo" | "env";
};

type SmtpStored = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
  updatedAt?: Date;
};

interface EmailSettingsSmtpDoc {
  _id: string;
  preferredTransport?: "oauth" | "smtp";
  smtp?: SmtpStored;
  updatedAt?: Date;
}

const SETTINGS_ID = "default";

function normalizePass(pass: string): string {
  return pass.trim().replace(/\s+/g, "");
}

function fromEnv(): SmtpConfig | null {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim().replace(/\s+/g, "");
  if (!host || !user || !pass) return null;

  const port = Number(process.env.SMTP_PORT?.trim() || "587");
  const secureEnv = process.env.SMTP_SECURE?.trim().toLowerCase();
  const secure =
    secureEnv === "true" || secureEnv === "1" || port === 465;
  const from = process.env.SMTP_FROM?.trim() || user;

  return { host, port, secure, user, pass, from, source: "env" };
}

export async function getStoredSmtpConfig(): Promise<SmtpStored | null> {
  const db = await getDb();
  const doc = await db
    .collection<EmailSettingsSmtpDoc>("email_settings")
    .findOne({ _id: SETTINGS_ID });
  const s = doc?.smtp;
  if (!s?.host || !s?.user || !s?.pass) return null;
  return s;
}

export async function getSmtpConfig(): Promise<SmtpConfig | null> {
  const stored = await getStoredSmtpConfig();
  if (stored) {
    return {
      host: stored.host,
      port: stored.port || 587,
      secure: Boolean(stored.secure) || stored.port === 465,
      user: stored.user,
      pass: normalizePass(stored.pass),
      from: stored.from || stored.user,
      source: "mongo",
    };
  }
  return fromEnv();
}

export async function isSmtpConfigured(): Promise<boolean> {
  return Boolean(await getSmtpConfig());
}

export async function saveSmtpConfig(params: {
  host: string;
  port?: number;
  secure?: boolean;
  user: string;
  pass: string;
  from?: string;
}): Promise<SmtpConfig> {
  const host = params.host.trim();
  const user = params.user.trim().toLowerCase();
  const pass = normalizePass(params.pass);
  const port = Number(params.port || 587);
  const secure = params.secure ?? port === 465;
  const from = (params.from?.trim() || user).toLowerCase();

  if (!host || !user || !pass) {
    throw new Error("SMTP host, user, and password are required");
  }

  const smtp: SmtpStored = {
    host,
    port,
    secure,
    user,
    pass,
    from,
    updatedAt: new Date(),
  };

  const db = await getDb();
  await db.collection<EmailSettingsSmtpDoc>("email_settings").updateOne(
    { _id: SETTINGS_ID },
    {
      $set: {
        smtp,
        updatedAt: new Date(),
      },
    },
    { upsert: true }
  );

  return { ...smtp, source: "mongo" };
}

export async function clearSmtpConfig(): Promise<void> {
  const db = await getDb();
  await db.collection<EmailSettingsSmtpDoc>("email_settings").updateOne(
    { _id: SETTINGS_ID },
    { $unset: { smtp: "" }, $set: { updatedAt: new Date() } }
  );
}

/** Safe summary for admin UI — never includes the password. */
export async function getSmtpPublicSummary(): Promise<{
  configured: boolean;
  source: "mongo" | "env" | null;
  host: string | null;
  port: number | null;
  user: string | null;
  from: string | null;
  hasPassword: boolean;
}> {
  const cfg = await getSmtpConfig();
  if (!cfg) {
    return {
      configured: false,
      source: null,
      host: null,
      port: null,
      user: null,
      from: null,
      hasPassword: false,
    };
  }
  return {
    configured: true,
    source: cfg.source,
    host: cfg.host,
    port: cfg.port,
    user: cfg.user,
    from: cfg.from,
    hasPassword: Boolean(cfg.pass),
  };
}

export async function sendViaSmtp(params: {
  to: string;
  subject: string;
  text: string;
  html: string;
}): Promise<void> {
  const config = await getSmtpConfig();
  if (!config) throw new Error("SMTP is not configured");

  const nodemailer = await import("nodemailer");
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
    connectionTimeout: 20_000,
    greetingTimeout: 20_000,
    socketTimeout: 20_000,
  });

  try {
    await transporter.sendMail({
      from: config.from,
      to: params.to,
      subject: params.subject,
      text: params.text,
      html: params.html,
    });
  } catch (err) {
    const anyErr = err as {
      message?: string;
      code?: string;
      response?: string;
      responseCode?: number;
      command?: string;
    };
    const parts = [
      anyErr.message || String(err),
      anyErr.code ? `code=${anyErr.code}` : null,
      anyErr.responseCode != null ? `responseCode=${anyErr.responseCode}` : null,
      anyErr.command ? `command=${anyErr.command}` : null,
    ].filter(Boolean);
    throw new Error(parts.join(" | "));
  }
}
