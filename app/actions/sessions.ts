'use server';

import {createNewClassSession, generateSessionCode, getCurrentInstructor, getSessionByCode} from "@/lib/dal";
import { ActionResponse } from "@/app/actions/auth"
import postgres from "postgres";
import {redirect} from "next/navigation";

export const createNewSession = async (prevState: ActionResponse | null): Promise<ActionResponse> => {
    const instructor = await getCurrentInstructor();
    if  (!instructor) {
        return { success: false, message: "You must be logged in to create a session. Please log in and try again.", error: "You must be logged in to create a session." };
    }

    let session;
    const maxAttempts = 5;
    let attempts = 0;

    while (attempts < maxAttempts) {
        const code = await generateSessionCode(8);

        try {
            const [sessionResult] = await createNewClassSession(instructor.id, code);
            session = sessionResult;
            break;

        } catch (error) {
            // Catch postgres-js Unique Constraint violation (23505)
            if (error instanceof postgres.PostgresError && error.code === "23505") {
                attempts++;
                continue; // Try again with a new code
            }

            // Log the real error on the server for debugging, but hide details from the user
            console.error("Database error during session creation:", error);
            return { success: false, message: "A database error occurred. Please try again.", error: "A database error occurred. Please try again." };
        }
    }

    // Return success data directly to the client component
    return { success: true, message: `Session created successfully with code ${session?.code}` };
}

export const joinSession = async (prevState: ActionResponse | null, formData: FormData): Promise<ActionResponse> => {

    const joinCode = formData.get("sessionCode")?.toString();
    if (!joinCode) {
        return { success: false, message: "Session code is required" };
    }

    const session = await getSessionByCode(joinCode);
    if (!session) {
        return { success: false, message: "Session code is invalid" };
    }

    redirect(`/${session.code}/dashboard`);
}