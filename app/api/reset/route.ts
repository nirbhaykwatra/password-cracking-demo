import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { resetAttempts } from "@/lib/store";
import { getOwnedSession } from "@/lib/dal";

const BodySchema = z.object({ sessionCode: z.string().min(1) });

export async function POST(req: NextRequest) {
  const parsed = BodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ success: false, message: "Invalid input" }, { status: 400 });
  }

  if (!(await getOwnedSession(parsed.data.sessionCode))) {
    return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
  }

  resetAttempts(parsed.data.sessionCode);
  return NextResponse.json({ ok: true });
}
