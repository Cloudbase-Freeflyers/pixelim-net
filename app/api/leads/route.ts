import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Lead from "@/lib/models/Lead";
import {
  isAppsScriptWebhookConfigured,
  notifyLeadViaAppsScript,
} from "@/lib/apps-script-webhook";
import { notifyNewLead } from "@/lib/email";
import { sendLeadToMakeWebhook } from "@/lib/make-webhook";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone, email, service, message } = body;

    if (!name || !phone || !email || !service) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Collapse rapid repeat submissions (double-clicked button, user retrying
    // after a slow response) into the single lead that was already saved.
    const duplicateWindowMs = 2 * 60 * 1000;
    const existing = await Lead.findOne({
      name,
      phone,
      createdAt: { $gte: new Date(Date.now() - duplicateWindowMs) },
    })
      .sort({ createdAt: -1 })
      .lean();

    if (existing) {
      console.warn(
        `[leads] duplicate submission suppressed for ${phone} within ${duplicateWindowMs}ms`
      );
      return NextResponse.json({ success: true, duplicate: true });
    }

    const lead = await Lead.create({
      name,
      phone,
      email,
      service,
      message: message || undefined,
      userAgent: request.headers.get("user-agent") || undefined,
      referrer: request.headers.get("referer") || undefined,
      visitorId: request.cookies.get("pixelim_vid")?.value || body.visitorId || undefined,
    });

    // Awaited on purpose: a fire-and-forget send is killed when the serverless
    // container freezes after the response. The lead is already saved, so a
    // failed notification must never fail the submission.
    const leadData = lead.toObject();

    // Forward to the Make.com scenario before the email so a slow SMTP send
    // can't delay it. A broken webhook must not fail the submission either.
    try {
      await sendLeadToMakeWebhook(leadData);
    } catch (err) {
      console.error("[leads] make.com webhook failed", err);
    }

    try {
      if (await isAppsScriptWebhookConfigured()) {
        try {
          await notifyLeadViaAppsScript(leadData);
        } catch (webhookErr) {
          // A broken webhook (bad secret, bad deployment) must not swallow the
          // lead alert — fall back to sending the email directly.
          console.error("[leads] apps script webhook failed, falling back to email", webhookErr);
          await notifyNewLead(leadData);
        }
      } else {
        await notifyNewLead(leadData);
      }
    } catch (err) {
      console.error("[leads] notification failed", err);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to save lead:", error);
    return NextResponse.json(
      { error: "Failed to save lead" },
      { status: 500 }
    );
  }
}
