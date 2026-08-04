import { connectDB } from "@/lib/mongodb";
import Lead from "@/lib/models/Lead";
import AdminShell from "@/components/admin/AdminShell";
import LeadsTable from "@/components/admin/LeadsTable";
import SheetWebhookSettings from "@/components/admin/SheetWebhookSettings";

export const dynamic = "force-dynamic";
export const metadata = { title: "Leads — Pixelim Admin" };

export default async function LeadsPage() {
  await connectDB();
  const leads = await Lead.find().sort({ createdAt: -1 }).lean();

  const serialized = leads.map((l) => ({
    _id: String(l._id),
    name: l.name,
    phone: l.phone,
    email: l.email,
    service: l.service,
    status: (l.status || "new") as "new" | "contacted" | "converted" | "rejected",
    createdAt: l.createdAt instanceof Date ? l.createdAt.toISOString() : String(l.createdAt),
    userAgent: l.userAgent,
    referrer: l.referrer,
  }));

  return (
    <AdminShell title={`Leads (${leads.length})`}>
      <div className="space-y-4">
        <SheetWebhookSettings />
        <LeadsTable initialLeads={serialized} />
      </div>
    </AdminShell>
  );
}
