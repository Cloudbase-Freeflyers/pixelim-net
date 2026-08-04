import { getDb } from "@/lib/db";
import type { ObjectId } from "mongodb";

export type ActivityType = "lead" | "notification";
export type ActivityStatus = "sent" | "failed" | "skipped";

export interface ActivityDoc {
  _id?: ObjectId;
  type: ActivityType;
  at: Date;
  title: string;
  detail?: string;
  recipients?: string[];
  status?: ActivityStatus;
  error?: string;
}

let indexReady: Promise<void> | null = null;

function ensureIndex() {
  if (!indexReady) {
    indexReady = (async () => {
      const db = await getDb();
      await db.collection<ActivityDoc>("activity_log").createIndex({ at: -1 });
    })();
  }
  return indexReady;
}

export async function logActivity(
  entry: Omit<ActivityDoc, "_id" | "at"> & { at?: Date }
): Promise<void> {
  try {
    await ensureIndex();
    const db = await getDb();
    await db.collection<ActivityDoc>("activity_log").insertOne({
      ...entry,
      at: entry.at ?? new Date(),
    });
  } catch (err) {
    console.error("[activity-log]", err);
  }
}

export async function listActivity(limit = 100): Promise<ActivityDoc[]> {
  await ensureIndex();
  const db = await getDb();
  return db
    .collection<ActivityDoc>("activity_log")
    .find({})
    .sort({ at: -1 })
    .limit(limit)
    .toArray();
}
