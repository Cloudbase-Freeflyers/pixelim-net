"use client";

import { useState } from "react";

type LeadStatus = "new" | "contacted" | "converted" | "rejected";

interface VisitorEvent {
  _id: string;
  visitorId: string;
  sessionId?: string;
  type: string;
  url?: string;
  path?: string;
  referrer?: string;
  utms?: Record<string, string>;
  clickIds?: Record<string, string>;
  userAgent?: string;
  timestamp: string;
}

interface Lead {
  _id: string;
  name: string;
  phone: string;
  email: string;
  service: string;
  message?: string;
  status: LeadStatus;
  userAgent?: string;
  referrer?: string;
  visitorId?: string;
  createdAt: string;
  updatedAt?: string;
}

const STATUS_CONFIG: Record<
  LeadStatus,
  { label: string; bg: string; text: string }
> = {
  new: { label: "New", bg: "bg-blue-100", text: "text-blue-800" },
  contacted: { label: "Contacted", bg: "bg-yellow-100", text: "text-yellow-800" },
  converted: { label: "Converted", bg: "bg-green-100", text: "text-green-800" },
  rejected: { label: "Rejected", bg: "bg-gray-100", text: "text-gray-600" },
};

const STATUSES: LeadStatus[] = ["new", "contacted", "converted", "rejected"];

function sourceMedium(e: VisitorEvent): string {
  if (e.utms?.utm_source) {
    return `${e.utms.utm_source} / ${e.utms.utm_medium || "—"}`;
  }
  if (e.clickIds?.gclid) return "google / cpc";
  if (e.clickIds?.fbclid) return "facebook / paid_media";
  if (e.clickIds?.ttclid) return "tiktok / paid_media";
  if (e.clickIds?.msclkid) return "bing / cpc";
  if (e.referrer) {
    try {
      return new URL(e.referrer).hostname + " / referral";
    } catch {
      return "referral";
    }
  }
  return "(direct)";
}

function campaign(e: VisitorEvent): string {
  return e.utms?.utm_campaign || "—";
}

export default function LeadDetailView({
  lead: initialLead,
  events,
}: {
  lead: Lead;
  events: VisitorEvent[];
}) {
  const [lead, setLead] = useState(initialLead);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function updateStatus(status: LeadStatus) {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/leads/${lead._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      setLead((prev) => ({ ...prev, status }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setSaving(false);
    }
  }

  const s = STATUS_CONFIG[lead.status ?? "new"];

  // Group events by session
  const sessionOrder: string[] = [];
  const sessionMap: Record<string, VisitorEvent[]> = {};
  for (const e of events) {
    const sid = e.sessionId || "unknown";
    if (!sessionMap[sid]) {
      sessionMap[sid] = [];
      sessionOrder.push(sid);
    }
    sessionMap[sid].push(e);
  }

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* Back link */}
      <a
        href="/admin/leads"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
      >
        ← Back to Leads
      </a>

      {/* Contact & Lead card */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 text-sm uppercase tracking-wide text-xs text-gray-500">
            Contact &amp; Lead
          </h2>
          <div className="flex items-center gap-3">
            <select
              value={lead.status}
              disabled={saving}
              onChange={(e) => updateStatus(e.target.value as LeadStatus)}
              className={`rounded-full px-3 py-1 text-xs font-semibold border-0 cursor-pointer ${s.bg} ${s.text} disabled:opacity-50`}
            >
              {STATUSES.map((st) => (
                <option key={st} value={st}>
                  {STATUS_CONFIG[st].label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-0 divide-x divide-y divide-gray-100">
          <InfoCell label="Name" value={lead.name} />
          <InfoCell label="Email" value={lead.email} mono />
          <InfoCell label="Phone" value={lead.phone} mono />
          <InfoCell label="Service" value={lead.service} capitalize />
          <InfoCell
            label="Submitted"
            value={new Date(lead.createdAt).toLocaleString("en-US", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          />
          {lead.visitorId && (
            <InfoCell label="Visitor ID" value={lead.visitorId} mono small />
          )}
          {lead.referrer && (
            <InfoCell label="Referrer" value={lead.referrer} mono small />
          )}
          {lead.message && (
            <InfoCell label="Message" value={lead.message} span />
          )}
          {lead.userAgent && (
            <InfoCell label="User Agent" value={lead.userAgent} small span />
          )}
        </div>
      </div>

      {/* Funnel card */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900 text-xs uppercase tracking-wide text-gray-500">
            Funnel
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-gray-100 p-0">
          <FunnelCell
            label="Lead"
            value={new Date(lead.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
            active
          />
          <FunnelCell
            label="Contacted"
            value={
              lead.status === "contacted" ||
              lead.status === "converted"
                ? lead.updatedAt
                  ? new Date(lead.updatedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  : "✓"
                : "—"
            }
          />
          <FunnelCell
            label="Won"
            value={lead.status === "converted" ? "✓" : "—"}
          />
          <FunnelCell
            label="Lost"
            value={lead.status === "rejected" ? "✓" : "—"}
          />
        </div>
      </div>

      {/* Session Path */}
      {events.length > 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Session Path ({events.length} events · {sessionOrder.length}{" "}
              {sessionOrder.length === 1 ? "session" : "sessions"})
            </h2>
          </div>

          {sessionOrder.map((sid, sIdx) => {
            const sessionEvents = sessionMap[sid];
            const firstEvent = sessionEvents[0];
            const src = sourceMedium(firstEvent);
            const hasUtmOrClick =
              firstEvent.utms || firstEvent.clickIds;

            return (
              <div key={sid} className="border-b border-gray-100 last:border-0">
                {/* Session header */}
                <div className="px-5 py-2.5 bg-gray-50 flex items-center gap-3 text-xs text-gray-600 font-medium">
                  <span className="bg-gray-200 text-gray-700 rounded-full w-5 h-5 flex items-center justify-center font-semibold text-[10px]">
                    {sIdx + 1}
                  </span>
                  <span>
                    {new Date(firstEvent.timestamp).toLocaleString("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </span>
                  <span className="text-gray-400">·</span>
                  <span className="font-semibold">{src}</span>
                  {campaign(firstEvent) !== "—" && (
                    <>
                      <span className="text-gray-400">·</span>
                      <span>{campaign(firstEvent)}</span>
                    </>
                  )}
                  {hasUtmOrClick && (
                    <span className="ml-auto bg-blue-100 text-blue-700 rounded-full px-2 py-0.5 text-[10px] font-semibold">
                      Paid
                    </span>
                  )}
                </div>

                {/* Events in this session */}
                <div className="divide-y divide-gray-50">
                  {sessionEvents.map((evt, eIdx) => (
                    <div
                      key={evt._id + eIdx}
                      className="px-5 py-2 flex items-center gap-4 text-sm"
                    >
                      <span className="w-6 text-center text-xs text-gray-400 shrink-0">
                        {eIdx + 1}
                      </span>
                      <span className="text-xs text-gray-400 whitespace-nowrap">
                        {new Date(evt.timestamp).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span className="font-mono text-xs text-gray-700 truncate flex-1">
                        {evt.path || evt.url || "—"}
                      </span>
                      {evt.clickIds && (
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(evt.clickIds).map(([k, v]) => (
                            <span
                              key={k}
                              className="bg-purple-100 text-purple-700 rounded px-1.5 py-0.5 text-[10px] font-mono"
                              title={`${k}: ${v}`}
                            >
                              {k}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 px-5 py-8 text-center">
          <p className="text-sm text-gray-400">
            {lead.visitorId
              ? "No page visit events recorded for this visitor yet."
              : "No visitor tracking data — this lead was submitted before tracking was enabled."}
          </p>
        </div>
      )}
    </div>
  );
}

function InfoCell({
  label,
  value,
  mono,
  small,
  capitalize,
  span,
}: {
  label: string;
  value: string;
  mono?: boolean;
  small?: boolean;
  capitalize?: boolean;
  span?: boolean;
}) {
  return (
    <div className={`px-5 py-4 ${span ? "col-span-2 sm:col-span-3" : ""}`}>
      <div className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-1">
        {label}
      </div>
      <div
        className={`text-gray-900 break-all ${mono ? "font-mono text-xs" : small ? "text-xs" : "text-sm"} ${capitalize ? "capitalize" : ""}`}
      >
        {value || "—"}
      </div>
    </div>
  );
}

function FunnelCell({
  label,
  value,
  active,
}: {
  label: string;
  value: string;
  active?: boolean;
}) {
  return (
    <div className="px-5 py-5">
      <div className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-2">
        {label}
      </div>
      <div
        className={`text-sm font-semibold ${active ? "text-gray-900" : value === "—" ? "text-gray-300" : "text-green-600"}`}
      >
        {value}
      </div>
    </div>
  );
}
