import { NextResponse } from "next/server";
import {
  setPreferredTransport,
  type EmailTransport,
} from "@/lib/email-transport";
import { getEmailConfigSummary } from "@/lib/email";

export const runtime = "nodejs";

export async function PATCH(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  const transport = (body as { transport?: string })?.transport;
  if (transport !== "oauth" && transport !== "smtp") {
    return NextResponse.json(
      { ok: false, error: "transport must be 'oauth' or 'smtp'" },
      { status: 400 }
    );
  }

  try {
    await setPreferredTransport(transport as EmailTransport);
    const config = await getEmailConfigSummary();
    return NextResponse.json({ ok: true, config });
  } catch (err) {
    console.error("[admin/email/transport PATCH]", err);
    return NextResponse.json(
      { ok: false, error: "Failed to update transport" },
      { status: 500 }
    );
  }
}
