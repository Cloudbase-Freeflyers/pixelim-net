export type NotificationTopic = "leads";

export type NotificationSubscriberStatus = "pending" | "approved" | "rejected";

export type NotificationPreferences = { leads: boolean };

export interface NotificationSubscriberDoc {
  _id?: import("mongoose").Types.ObjectId;
  email: string;
  name?: string;
  status: NotificationSubscriberStatus;
  preferences: NotificationPreferences;
  createdAt: Date;
  updatedAt?: Date;
  approvedAt?: Date;
}

export function defaultNotificationPreferences(): NotificationPreferences {
  return { leads: true };
}

export function normalizePreferences(
  raw?: Partial<NotificationPreferences> | null
): NotificationPreferences {
  if (!raw) return defaultNotificationPreferences();
  return { leads: raw.leads !== false };
}

export function mergePreferences(
  base: NotificationPreferences,
  patch: Partial<NotificationPreferences>
): NotificationPreferences {
  return { leads: patch.leads ?? base.leads };
}
