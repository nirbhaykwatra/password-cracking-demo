
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyPasswordForSite } from "@/lib/auth";
import { getDemoUserBySiteSlug } from "@/lib/dal";
import { beginAttempt, recordSuccess } from "@/lib/store";

const SignInSchema = z.object({
    email: z.string().min(1),
    password: z.string().min(1),
});

export async function POST(request: NextRequest, { params }: { params: Promise<{ sessionCode: string, siteSlug: string }> }) {
    const { sessionCode, siteSlug } = await params;

    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ success: false, message: "Invalid JSON" }, { status: 400 });
    }

    const validation = SignInSchema.safeParse(body);
    if (!validation.success) {
        return NextResponse.json(
            { success: false, message: "Invalid input", errors: z.flattenError(validation.error).fieldErrors },
            { status: 400 }
        );
    }

    const { email, password } = validation.data;

    const user = await getDemoUserBySiteSlug(email, siteSlug, sessionCode);
    if (!user) {
        return NextResponse.json({ success: false, message: "Invalid Email" }, { status: 401 });
    }

    const check = beginAttempt(sessionCode, siteSlug, user.email);
    if (!check.allowed) {
        return NextResponse.json(
            {
                success: false,
                message: check.reason === "lockout" ? "Account temporarily locked" : "Too many requests",
            },
            { status: 429, headers: { "Retry-After": String(Math.ceil(check.retryAfterMs / 1000)) } }
        );
    }

    const verified = await verifyPasswordForSite(siteSlug, password, user.password);
    if (!verified) {
        return NextResponse.json({ success: false, message: "Invalid Password" }, { status: 401 });
    }

    recordSuccess(sessionCode, siteSlug, user.email);

    // Deliberately no session cookie: the cracker fires thousands of guesses.
    return NextResponse.json({ success: true, message: "Signed In Successfully" });
}