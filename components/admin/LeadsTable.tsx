"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";

type LeadStatus = "new" | "contacted" | "converted" | "rejected";

interface Lead {
  _id: string;
  name: string;
  phone: string;
  email: string;
  service: string;
  status: LeadStatus;
  createdAt: string;
  userAgent?: string;
  referrer?: string;
}

const STATUS_LABELS: Record<LeadStatus, { label: string; cls: string }> = {
  new: { label: "New", cls: "bg-blue-100 text-blue-800" },
  contacted: { label: "Contacted", cls: "bg-yellow-100 text-yellow-800" },
  converted: { label: "Converted", cls: "bg-green-100 text-green-800" },
  rejected: { label: "Rejected", cls: "bg-gray-100 text-gray-600" },
};

const STATUSES: LeadStatus[] = ["new", "contacted", "converted", "rejected"];

function downloadCsv(leads: Lead[]) {
  const headers = ["#", "Name", "Phone", "Email", "Service", "Status", "Date"];
  const rows = leads.map((l, i) => [
    i + 1,
    `"${l.name.replace(/"/g, '""')}"`,
    `"${l.phone}"`,
    `"${l.email}"`,
    `"${l.service}"`,
    l.status,
    new Date(l.createdAt).toLocaleString("en-US"),
  ]);
  const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `pixelim-leads-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function LeadsTable({ initialLeads }: { initialLeads: Lead[] }) {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [updating, setUpdating] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterService, setFilterService] = useState<string>("");
  const [filterFrom, setFilterFrom] = useState<string>("");
  const [filterTo, setFilterTo] = useState<string>("");

  // Unique service list for filter dropdown
  const services = useMemo(() => {
    const all = Array.from(new Set(leads.map((l) => l.service).filter(Boolean)));
    all.sort();
    return all;
  }, [leads]);

  // Apply filters
  const filtered = useMemo(() => {
    return leads.filter((l) => {
      if (filterStatus && l.status !== filterStatus) return false;
      if (filterService && l.service !== filterService) return false;
      if (filterFrom) {
        const from = new Date(filterFrom);
        from.setHours(0, 0, 0, 0);
        if (new Date(l.createdAt) < from) return false;
      }
      if (filterTo) {
        const to = new Date(filterTo);
        to.setHours(23, 59, 59, 999);
        if (new Date(l.createdAt) > to) return false;
      }
      return true;
    });
  }, [leads, filterStatus, filterService, filterFrom, filterTo]);

  const hasFilters = filterStatus || filterService || filterFrom || filterTo;

  async function updateStatus(id: string, status: LeadStatus, e: React.MouseEvent) {
    e.stopPropagation();
    setUpdating(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      setLeads((prev) => prev.map((l) => (l._id === id ? { ...l, status } : l)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setUpdating(null);
    }
  }

  async function syncToSheet() {
    if (
      !confirm(
        `Sync all ${leads.length} leads to the Google Sheet?\n\nThis replaces existing rows in the Sheet Leads tab (no notification emails).`
      )
    ) {
      return;
    }
    setSyncing(true);
    setError(null);
    setSyncNotice(null);
    try {
      let offset = 0;
      let total = leads.length;
      let imported = 0;
      let batches = 0;
      const limit = 20;

      while (true) {
        setSyncNotice(
          imported > 0
            ? `Syncing… ${imported} of ${total} leads`
            : "Syncing to Google Sheet…"
        );

        const res = await fetch("/api/admin/leads/sync-sheet", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            offset,
            limit,
            replace: offset === 0,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Sync failed");

        total = data.total ?? total;
        imported += data.imported ?? 0;
        batches += data.batches ?? 0;

        if (data.done) break;
        offset = data.nextOffset ?? offset + limit;
      }

      setSyncNotice(
        `Synced ${imported} of ${total} leads to Google Sheet (${batches} batch${batches === 1 ? "" : "es"}).`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sync failed");
    } finally {
      setSyncing(false);
    }
  }

  async function deleteLead(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm("Delete this lead? This cannot be undone.")) return;
    setUpdating(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/leads/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed");
      setLeads((prev) => prev.filter((l) => l._id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setUpdating(null);
    }
  }

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex flex-wrap items-center gap-3">
        {/* Status */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
        >
          <option value="">All Statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s].label}
            </option>
          ))}
        </select>

        {/* Service */}
        <select
          value={filterService}
          onChange={(e) => setFilterService(e.target.value)}
          className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 capitalize"
        >
          <option value="">All Services</option>
          {services.map((s) => (
            <option key={s} value={s} className="capitalize">
              {s}
            </option>
          ))}
        </select>

        {/* Date from */}
        <div className="flex items-center gap-1.5">
          <label className="text-xs text-gray-500 font-medium whitespace-nowrap">From</label>
          <input
            type="date"
            value={filterFrom}
            onChange={(e) => setFilterFrom(e.target.value)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Date to */}
        <div className="flex items-center gap-1.5">
          <label className="text-xs text-gray-500 font-medium whitespace-nowrap">To</label>
          <input
            type="date"
            value={filterTo}
            onChange={(e) => setFilterTo(e.target.value)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Clear */}
        {hasFilters && (
          <button
            onClick={() => {
              setFilterStatus("");
              setFilterService("");
              setFilterFrom("");
              setFilterTo("");
            }}
            className="text-sm text-gray-500 hover:text-gray-900 underline"
          >
            Clear
          </button>
        )}

        <div className="ml-auto flex items-center gap-3">
          <span className="text-xs text-gray-400">
            {filtered.length} of {leads.length} leads
          </span>
          <button
            type="button"
            onClick={syncToSheet}
            disabled={syncing || leads.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 bg-green-700 hover:bg-green-800 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-40"
          >
            {syncing ? "Syncing…" : "Sync to Sheet"}
          </button>
          <button
            onClick={() => downloadCsv(filtered)}
            disabled={filtered.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 bg-gray-900 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-40"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export CSV
          </button>
        </div>
      </div>

      {syncNotice && (
        <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
          {syncNotice}
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
          {leads.length === 0 ? "No leads yet." : "No leads match the current filters."}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((lead, index) => {
                const s = STATUS_LABELS[lead.status ?? "new"];
                return (
                  <tr
                    key={lead._id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => router.push(`/admin/leads/${lead._id}`)}
                  >
                    <td className="px-4 py-3 text-gray-400">{index + 1}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{lead.name}</td>
                    <td className="px-4 py-3 text-gray-700">{lead.phone}</td>
                    <td className="px-4 py-3 text-gray-700">{lead.email}</td>
                    <td className="px-4 py-3 text-gray-700 capitalize">{lead.service}</td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={lead.status ?? "new"}
                        disabled={updating === lead._id}
                        onChange={(e) =>
                          updateStatus(lead._id, e.target.value as LeadStatus, e as unknown as React.MouseEvent)
                        }
                        onClick={(e) => e.stopPropagation()}
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold border-0 cursor-pointer ${s.cls} disabled:opacity-50`}
                      >
                        {STATUSES.map((st) => (
                          <option key={st} value={st}>
                            {STATUS_LABELS[st].label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-gray-400 whitespace-nowrap text-xs">
                      {new Date(lead.createdAt).toLocaleString("en-US", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        disabled={updating === lead._id}
                        onClick={(e) => deleteLead(lead._id, e)}
                        className="text-xs text-red-500 hover:text-red-700 font-medium disabled:opacity-40"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
