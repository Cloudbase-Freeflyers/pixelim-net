import { Suspense } from "react";
import AdminShell from "@/components/admin/AdminShell";
import GmailConnector from "@/components/admin/GmailConnector";

export const metadata = { title: "Settings — Pixelim Admin" };

export default function SettingsPage() {
  return (
    <AdminShell title="Settings">
      <Suspense fallback={<p className="text-sm text-gray-400">Loading…</p>}>
        <GmailConnector />
      </Suspense>
    </AdminShell>
  );
}
