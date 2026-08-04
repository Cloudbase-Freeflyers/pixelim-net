import { notFound } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import Lead from "@/lib/models/Lead";
import { getDb } from "@/lib/db";
import AdminShell from "@/components/admin/AdminShell";
import LeadDetailView from "@/components/admin/LeadDetailView";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  await connectDB();
  const lead = await Lead.findById(id).lean();
  return { title: lead ? `${lead.name} — Pixelim Admin` : "Lead — Pixelim Admin" };
}

export default async function LeadDetailPage({ params }: Props) {
  const { id } = await params;
  await connectDB();
  const lead = await Lead.findById(id).lean();
  if (!lead) notFound();

  let events: unknown[] = [];
  if (lead.visitorId) {
    const db = await getDb();
    events = await db
      .collection("visitor_events")
      .find({ visitorId: lead.visitorId })
      .sort({ timestamp: 1 })
      .limit(200)
      .toArray();
  }

  const serializedLead = {
    _id: String(lead._id),
    name: lead.name,
    phone: lead.phone,
    email: lead.email,
    service: lead.service,
    message: lead.message,
    status: (lead.status || "new") as "new" | "contacted" | "converted" | "rejected",
    userAgent: lead.userAgent,
    referrer: lead.referrer,
    visitorId: lead.visitorId,
    createdAt: lead.createdAt instanceof Date ? lead.createdAt.toISOString() : String(lead.createdAt),
    updatedAt: lead.updatedAt instanceof Date ? lead.updatedAt.toISOString() : undefined,
  };

  const serializedEvents = events.map((e) => {
    const ev = e as Record<string, unknown>;
    return {
      _id: String(ev._id),
      visitorId: String(ev.visitorId || ""),
      sessionId: ev.sessionId ? String(ev.sessionId) : undefined,
      type: String(ev.type || "pageview"),
      url: ev.url ? String(ev.url) : undefined,
      path: ev.path ? String(ev.path) : undefined,
      referrer: ev.referrer ? String(ev.referrer) : undefined,
      utms: (ev.utms as Record<string, string>) || undefined,
      clickIds: (ev.clickIds as Record<string, string>) || undefined,
      userAgent: ev.userAgent ? String(ev.userAgent) : undefined,
      timestamp: ev.timestamp instanceof Date ? ev.timestamp.toISOString() : String(ev.timestamp),
    };
  });

  return (
    <AdminShell title={lead.name}>
      <LeadDetailView lead={serializedLead} events={serializedEvents} />
    </AdminShell>
  );
}
