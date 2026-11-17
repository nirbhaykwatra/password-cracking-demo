'use server';

import { z } from "zod";
import { revalidatePath } from "next/cache";
import type { ActionResponse } from "@/app/actions/auth";
import { createDemoUser, previewPasswordStorage, type PasswordPreview } from "@/lib/auth";
import {
    generateCreditCard, generateDemoAddress, generateDemoPhoneNumber,
    getCurrentInstructor, getDemoUserBySiteSlug, getOwnedSession, getSiteBySlug,
    PASSWORD_CATEGORIES, rollDemoStudent,
} from "@/lib/dal";

const SITE_SLUGS = ["fmail", "shopzone", "flixwatch"] as const;
const MAX_RETRIES_PER_CATEGORY = 5;

export const rollDemoAccounts = async (sessionCode: string): Promise<ActionResponse> => {
    const session = await getOwnedSession(sessionCode);
    if (!session) {
        return { success: false, message: "Session not found." };
    }

    const found = await Promise.all(SITE_SLUGS.map((slug) => getSiteBySlug(slug)));
    const sites = found.filter((s): s is NonNullable<typeof s> => !!s);
    if (sites.length !== SITE_SLUGS.length) {
        return { success: false, message: "Demo sites are missing from the database." };
    }

    try {
        let created = 0;

        // One student per category, in order, so every roll covers every
        // attack the lab demonstrates (instead of leaving it to chance).
        for (const category of PASSWORD_CATEGORIES) {
            let student = rollDemoStudent(category);
            let retries = 0;

            // Re-roll only on an email collision within this session; the category stays fixed.
            while (await getDemoUserBySiteSlug(student.email, "fmail", session.code)) {
                if (++retries >= MAX_RETRIES_PER_CATEGORY) break;
                student = rollDemoStudent(category);
            }
            if (retries >= MAX_RETRIES_PER_CATEGORY) continue;

            for (const site of sites) {
                await createDemoUser({
                    siteSlug: site.slug,
                    name: student.name,
                    email: student.email,
                    password: student.password,
                    sessionId: session.id,
                    siteId: site.id,
                    creditCard: await generateCreditCard(),
                    address: await generateDemoAddress(student.email),
                    phoneNumber: await generateDemoPhoneNumber(student.email),
                });
            }
            created++;
        }

        revalidatePath(`/${session.code}/admin/database`);
        return { success: true, message: `Rolled ${created} demo accounts (one per attack category).` };
    } catch (error) {
        console.error("Failed to roll demo accounts:", error);
        return { success: false, message: "Could not create demo accounts." };
    }
};

const PreviewSchema = z.object({
    mode: z.enum(["plain-text", "hashed", "salted"]),
    password: z.string().min(1, "Enter a password.").max(64, "Keep it to 64 characters or fewer."),
});

export const previewStorage = async (
    mode: string,
    password: string
): Promise<{ success: true; result: PasswordPreview } | { success: false; message: string }> => {
    if (!(await getCurrentInstructor())) {
        return { success: false, message: "You must be logged in." };
    }

    const parsed = PreviewSchema.safeParse({ mode, password });
    if (!parsed.success) {
        return { success: false, message: parsed.error.issues[0]?.message ?? "Invalid input." };
    }

    return { success: true, result: await previewPasswordStorage(parsed.data.mode, parsed.data.password) };
};
