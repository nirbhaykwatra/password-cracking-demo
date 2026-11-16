import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getConfig, updateConfig } from "@/lib/store";
import { getOwnedSession } from "@/lib/dal";

const ConfigPatchSchema = z.object({
  rateLimit: z.boolean(),
  rateLimitMs: z.number().int().min(0).max(60_000),
  lockout: z.boolean(),
  lockoutThreshold: z.number().int().min(1).max(1000),
  lockoutSeconds: z.number().int().min(1).max(3600),
}).partial();

const BodySchema = ConfigPatchSchema.extend({ sessionCode: z.string().min(1) });

const notFound = () => NextResponse.json({ success: false, message: "Not found" }, { status: 404 });

export async function GET(req: NextRequest) {
  const sessionCode = req.nextUrl.searchParams.get("sessionCode") ?? "";
  if (!(await getOwnedSession(sessionCode))) return notFound();
  return NextResponse.json(getConfig(sessionCode));
}

export async function POST(req: NextRequest) {
  const parsed = BodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ success: false, message: "Invalid input" }, { status: 400 });
  }

  const { sessionCode, ...patch } = parsed.data;
  if (!(await getOwnedSession(sessionCode))) return notFound();

  return NextResponse.json(updateConfig(sessionCode, patch));
}
