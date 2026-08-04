import { Suspense } from "react";
import AdminShell from "@/components/admin/AdminShell";
import NotificationManager from "@/components/admin/NotificationManager";
import SheetWebhookSettings from "@/components/admin/SheetWebhookSettings";

export const metadata = { title: "Notifications — Pixelim Admin" };

export default function NotificationsPage() {
  return (
    <AdminShell title="Email Notifications">
      <div className="space-y-6">
        <SheetWebhookSettings />
        <Suspense fallback={<p className="text-sm text-gray-400">Loading…</p>}>
          <NotificationManager />
        </Suspense>
      </div>
    </AdminShell>
  );
}
