import { getDb } from "@/lib/db";
import {
  defaultNotificationPreferences,
  mergePreferences,
  normalizePreferences,
  type NotificationPreferences,
  type NotificationSubscriberDoc,
  type NotificationSubscriberStatus,
} from "@/types/notifications";

let indexesReady: Promise<void> | null = null;

function ensureIndexes() {
  if (!indexesReady) {
    indexesReady = (async () => {
      const db = await getDb();
      const coll = db.collection<NotificationSubscriberDoc>("notification_subscribers");
      await coll.createIndex({ email: 1 }, { unique: true });
      await coll.createIndex({ status: 1, createdAt: -1 });
    })();
  }
  return indexesReady;
}

function docWithDefaults(doc: NotificationSubscriberDoc): NotificationSubscriberDoc {
  return { ...doc, preferences: normalizePreferences(doc.preferences) };
}

export async function listNotificationSubscribers(
  status?: NotificationSubscriberStatus
) {
  await ensureIndexes();
  const db = await getDb();
  const filter = status ? { status } : {};
  const rows = await db
    .collection<NotificationSubscriberDoc>("notification_subscribers")
    .find(filter)
    .sort({ createdAt: -1 })
    .toArray();
  return rows.map(docWithDefaults);
}

export async function getApprovedEmailsForTopic(
  topic: keyof NotificationPreferences
): Promise<string[]> {
  await ensureIndexes();
  const db = await getDb();
  const rows = await db
    .collection<NotificationSubscriberDoc>("notification_subscribers")
    .find({ status: "approved", [`preferences.${topic}`]: true })
    .project({ email: 1 })
    .toArray();
  return rows.map((r) => r.email);
}

export async function addApprovedSubscriber(params: {
  email: string;
  name?: string;
  preferences?: Partial<NotificationPreferences>;
}) {
  await ensureIndexes();
  const db = await getDb();
  const coll = db.collection<NotificationSubscriberDoc>("notification_subscribers");
  const email = params.email.trim().toLowerCase();
  const requested = normalizePreferences(
    mergePreferences(defaultNotificationPreferences(), params.preferences ?? {})
  );
  const now = new Date();

  const existing = await coll.findOne({ email });
  const preferences = existing
    ? mergePreferences(normalizePreferences(existing.preferences), requested)
    : requested;
  const name = params.name?.trim() || existing?.name;

  const set: Partial<NotificationSubscriberDoc> = {
    status: "approved",
    preferences,
    approvedAt: existing?.approvedAt ?? now,
    updatedAt: now,
  };
  if (name) set.name = name;

  await coll.updateOne(
    { email },
    { $set: set, $setOnInsert: { email, createdAt: now } },
    { upsert: true }
  );

  const doc = await coll.findOne({ email });
  return doc ? docWithDefaults(doc) : null;
}

export async function updateNotificationSubscriber(
  id: string,
  updates: {
    status?: NotificationSubscriberStatus;
    preferences?: Partial<NotificationPreferences>;
  }
) {
  await ensureIndexes();
  const db = await getDb();
  const { ObjectId } = await import("mongodb");
  if (!ObjectId.isValid(id)) return null;

  const existing = await db
    .collection<NotificationSubscriberDoc>("notification_subscribers")
    .findOne({ _id: new ObjectId(id) as unknown as import("mongoose").Types.ObjectId });
  if (!existing) return null;

  const now = new Date();
  const set: Partial<NotificationSubscriberDoc> = { updatedAt: now };

  if (updates.status) {
    set.status = updates.status;
    if (updates.status === "approved") set.approvedAt = now;
  }

  if (updates.preferences) {
    set.preferences = mergePreferences(
      normalizePreferences(existing.preferences),
      updates.preferences
    );
  } else if (!existing.preferences) {
    set.preferences = defaultNotificationPreferences();
  }

  const result = await db
    .collection<NotificationSubscriberDoc>("notification_subscribers")
    .findOneAndUpdate(
      { _id: new ObjectId(id) as unknown as import("mongoose").Types.ObjectId },
      {
        $set: set,
        ...(updates.status && updates.status !== "approved"
          ? { $unset: { approvedAt: "" } }
          : {}),
      },
      { returnDocument: "after" }
    );

  return result ? docWithDefaults(result) : null;
}

export async function deleteNotificationSubscriber(id: string) {
  await ensureIndexes();
  const db = await getDb();
  const { ObjectId } = await import("mongodb");
  if (!ObjectId.isValid(id)) return false;

  const result = await db
    .collection<NotificationSubscriberDoc>("notification_subscribers")
    .deleteOne({ _id: new ObjectId(id) as unknown as import("mongoose").Types.ObjectId });
  return result.deletedCount === 1;
}
