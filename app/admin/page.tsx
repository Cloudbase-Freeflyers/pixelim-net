import { connectDB } from "@/lib/mongodb";
import Lead from "@/lib/models/Lead";
import AdminShell from "@/components/admin/AdminShell";
import {
  LeadsPerDayChart,
  LeadsByStatusChart,
  LeadsByServiceChart,
} from "@/components/admin/DashboardCharts";

export const dynamic = "force-dynamic";
export const metadata = { title: "Dashboard — Pixelim Admin" };

interface DayCount { date: string; count: number }
interface StatusCount { status: string; count: number }
interface ServiceCount { service: string; count: number }

async function getStats() {
  await connectDB();

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [total, newLeads, contacted, recentLeads, perDayRaw, byStatus, byService] =
    await Promise.all([
      Lead.countDocuments(),
      Lead.countDocuments({ status: "new" }),
      Lead.countDocuments({ status: "contacted" }),
      Lead.find().sort({ createdAt: -1 }).limit(5).lean(),
      Lead.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Lead.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      Lead.aggregate([
        { $group: { _id: "$service", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 6 },
      ]),
    ]);

  // Build a full 30-day range filling gaps with 0
  const dayMap: Record<string, number> = {};
  for (const row of perDayRaw as Array<{ _id: string; count: number }>) {
    dayMap[row._id] = row.count;
  }
  const perDay: DayCount[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10);
    perDay.push({ date: key, count: dayMap[key] ?? 0 });
  }

  const statusOrder = ["new", "contacted", "converted", "rejected"];
  const statusMap: Record<string, number> = {};
  for (const row of byStatus as Array<{ _id: string; count: number }>) {
    statusMap[row._id] = row.count;
  }
  const statusCounts: StatusCount[] = statusOrder.map((s) => ({
    status: s,
    count: statusMap[s] ?? 0,
  }));

  const serviceCounts: ServiceCount[] = (byService as Array<{ _id: string; count: number }>).map(
    (r) => ({ service: r._id, count: r.count })
  );

  return {
    total,
    newLeads,
    contacted,
    recentLeads,
    perDay,
    statusCounts,
    serviceCounts,
  };
}

export default async function AdminDashboard() {
  const {
    total,
    newLeads,
    contacted,
    recentLeads,
    perDay,
    statusCounts,
    serviceCounts,
  } = await getStats();

  return (
    <AdminShell title="Dashboard">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="Total Leads" value={total} />
        <StatCard label="New" value={newLeads} highlight />
        <StatCard label="Contacted" value={contacted} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <LeadsPerDayChart data={perDay} />
        <LeadsByStatusChart data={statusCounts} />
      </div>

      {serviceCounts.length > 0 && (
        <div className="mb-6">
          <LeadsByServiceChart data={serviceCounts} />
        </div>
      )}

      {/* Recent leads */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Recent Leads</h2>
          <a href="/admin/leads" className="text-sm text-blue-600 hover:underline">
            View all →
          </a>
        </div>
        {recentLeads.length === 0 ? (
          <p className="px-5 py-8 text-center text-gray-400 text-sm">No leads yet.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {recentLeads.map((lead) => (
              <a
                key={String(lead._id)}
                href={`/admin/leads/${String(lead._id)}`}
                className="px-5 py-3 flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors"
              >
                <div>
                  <div className="font-medium text-gray-900 text-sm">{lead.name}</div>
                  <div className="text-xs text-gray-400">
                    {lead.email} · {lead.service}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <StatusBadge status={(lead.status as string) || "new"} />
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {new Date(lead.createdAt).toLocaleDateString("en-US")}
                  </span>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </AdminShell>
  );
}

function StatCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-5 ${
        highlight
          ? "bg-blue-600 border-blue-600 text-white"
          : "bg-white border-gray-200"
      }`}
    >
      <div
        className={`text-3xl font-bold ${highlight ? "text-white" : "text-gray-900"}`}
      >
        {value}
      </div>
      <div
        className={`text-sm mt-1 ${highlight ? "text-blue-100" : "text-gray-500"}`}
      >
        {label}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    new: { label: "New", cls: "bg-blue-100 text-blue-700" },
    contacted: { label: "Contacted", cls: "bg-yellow-100 text-yellow-700" },
    converted: { label: "Converted", cls: "bg-green-100 text-green-700" },
    rejected: { label: "Rejected", cls: "bg-gray-100 text-gray-500" },
  };
  const { label, cls } = map[status] ?? map.new;
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`}
    >
      {label}
    </span>
  );
}
