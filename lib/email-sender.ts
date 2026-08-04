import { getDb } from "@/lib/db";

interface EmailSenderDoc {
  _id: string;
  senderEmail: string;
  refreshToken: string;
  connectedAt: Date;
  updatedAt?: Date;
  /** Set when Google rejected the refresh token — kept so the admin can see why. */
  deadSince?: Date;
  deadReason?: string;
}

const DOC_ID = "default";

/** Raw record including dead connections — for admin diagnostics only. */
export async function getEmailSenderRecord(): Promise<EmailSenderDoc | null> {
  const db = await getDb();
  const doc = await db
    .collection<EmailSenderDoc>("email_sender")
    .findOne({ _id: DOC_ID });
  if (!doc?.refreshToken || !doc.senderEmail) return null;
  return doc;
}

/** Usable sender only — a token Google has rejected is not returned. */
export async function getConnectedEmailSender(): Promise<EmailSenderDoc | null> {
  const doc = await getEmailSenderRecord();
  if (!doc || doc.deadSince) return null;
  return doc;
}

export async function saveConnectedEmailSender(params: {
  senderEmail: string;
  refreshToken: string;
}) {
  const db = await getDb();
  const now = new Date();
  await db.collection<EmailSenderDoc>("email_sender").updateOne(
    { _id: DOC_ID },
    {
      $set: {
        senderEmail: params.senderEmail.trim().toLowerCase(),
        refreshToken: params.refreshToken,
        connectedAt: now,
        updatedAt: now,
      },
      $unset: { deadSince: "", deadReason: "" },
    },
    { upsert: true }
  );
}

/** Persist a rotated refresh token without resetting connectedAt. */
export async function updateEmailSenderRefreshToken(refreshToken: string) {
  const db = await getDb();
  await db.collection<EmailSenderDoc>("email_sender").updateOne(
    { _id: DOC_ID },
    {
      $set: {
        refreshToken,
        updatedAt: new Date(),
      },
      $unset: { deadSince: "", deadReason: "" },
    }
  );
}

/**
 * Flag the stored token as rejected by Google instead of deleting it.
 * Keeping the record means the admin shows "Gmail expired — reconnect"
 * rather than silently degrading to "email not configured".
 */
export async function markEmailSenderDead(reason: string) {
  const db = await getDb();
  await db.collection<EmailSenderDoc>("email_sender").updateOne(
    { _id: DOC_ID, deadSince: { $exists: false } },
    {
      $set: {
        deadSince: new Date(),
        deadReason: reason.slice(0, 300),
        updatedAt: new Date(),
      },
    }
  );
}

export async function clearConnectedEmailSender() {
  const db = await getDb();
  await db.collection<EmailSenderDoc>("email_sender").deleteOne({ _id: DOC_ID });
}

export type { EmailSenderDoc };
