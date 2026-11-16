import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyPassword, createSession } from "@/lib/auth";
import {getDemoUserBySiteSlug} from "@/lib/dal";

const SignInSchema = z.object({
    email: z.string().min(1),
    password: z.string().min(1),
});


export async function POST(request: NextRequest, { params }: { params: Promise<{sessionCode: string, siteSlug: string}> }) {

    const { sessionCode, siteSlug } = await params;

    const body = await request.json();
    const validation = SignInSchema.safeParse(body);

    if (!validation.success) {
        return NextResponse.json(
            { success: false, message: "Invalid input", errors: validation.error.flatten().fieldErrors },
            { status: 400 }
        );
    }

    const { email, password } = validation.data;

    const user = await getDemoUserBySiteSlug(email, siteSlug, sessionCode); // scope lookup by site if your DAL supports it
    if (!user) {
        return NextResponse.json({ success: false, message: "Invalid Email" }, { status: 401 });
    }

    const verified = await verifyPassword(password, user.password);
    if (!verified) {
        return NextResponse.json({ success: false, message: "Invalid Password" }, { status: 401 });
    }

    // For the cracking tool you probably don't want to actually mint a real session
    // on every one of thousands of guesses — see note below.
    return NextResponse.json({ success: true, message: "Signed In Successfully" });
}