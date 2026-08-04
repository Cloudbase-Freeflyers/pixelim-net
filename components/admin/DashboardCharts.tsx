"use client";

interface DayCount {
  date: string;
  count: number;
}

interface StatusCount {
  status: string;
  count: number;
}

interface ServiceCount {
  service: string;
  count: number;
}

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-500",
  contacted: "bg-yellow-400",
  converted: "bg-green-500",
  rejected: "bg-gray-300",
};

const STATUS_LABELS: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  converted: "Converted",
  rejected: "Rejected",
};

export function LeadsPerDayChart({ data }: { data: DayCount[] }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  const total = data.reduce((s, d) => s + d.count, 0);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="font-semibold text-gray-900">Leads per Day</h2>
          <p className="text-xs text-gray-400 mt-0.5">Last 30 days</p>
        </div>
        <div className="text-2xl font-bold text-gray-900">{total}</div>
      </div>

      {total === 0 ? (
        <div className="h-24 flex items-center justify-center text-sm text-gray-400">
          No leads in this period
        </div>
      ) : (
        <>
          <div className="flex items-end gap-0.5 h-24">
            {data.map((d) => (
              <div
                key={d.date}
                className="flex-1 flex flex-col items-center justify-end group relative"
              >
                {d.count > 0 && (
                  <div
                    className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] rounded px-1.5 py-0.5 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-10"
                  >
                    {d.date.slice(5)}: {d.count}
                  </div>
                )}
                <div
                  className={`w-full rounded-t transition-all ${d.count > 0 ? "bg-blue-500" : "bg-gray-100"}`}
                  style={{
                    height: d.count > 0 ? `${Math.max((d.count / max) * 100, 8)}%` : "2px",
                  }}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-gray-400 mt-2">
            <span>{data[0]?.date.slice(5)}</span>
            <span>{data[data.length - 1]?.date.slice(5)}</span>
          </div>
        </>
      )}
    </div>
  );
}

export function LeadsByStatusChart({ data }: { data: StatusCount[] }) {
  const total = data.reduce((s, d) => s + d.count, 0);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="mb-4">
        <h2 className="font-semibold text-gray-900">Leads by Status</h2>
        <p className="text-xs text-gray-400 mt-0.5">All time</p>
      </div>

      {total === 0 ? (
        <div className="h-24 flex items-center justify-center text-sm text-gray-400">
          No leads yet
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((d) => {
            const pct = total > 0 ? Math.round((d.count / total) * 100) : 0;
            const color = STATUS_COLORS[d.status] ?? "bg-gray-300";
            const label = STATUS_LABELS[d.status] ?? d.status;
            return (
              <div key={d.status}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-gray-700">{label}</span>
                  <span className="text-gray-500">
                    {d.count} ({pct}%)
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${color} transition-all`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function LeadsByServiceChart({ data }: { data: ServiceCount[] }) {
  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="mb-4">
        <h2 className="font-semibold text-gray-900">Leads by Service</h2>
        <p className="text-xs text-gray-400 mt-0.5">All time</p>
      </div>

      {data.length === 0 ? (
        <div className="h-24 flex items-center justify-center text-sm text-gray-400">
          No leads yet
        </div>
      ) : (
        <div className="space-y-2.5">
          {data.slice(0, 6).map((d) => {
            const pct = Math.round((d.count / max) * 100);
            return (
              <div key={d.service} className="flex items-center gap-3">
                <div className="w-24 shrink-0 text-xs text-gray-700 capitalize truncate">
                  {d.service}
                </div>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-indigo-400 transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="w-5 text-right text-xs font-semibold text-gray-700 shrink-0">
                  {d.count}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
