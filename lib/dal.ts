import { eq } from "drizzle-orm";
import { cache } from 'react';
import { db } from '@/db/';
import {classSessions, instructors} from '@/db/schema';
import { getSession } from '@/lib/auth';

export const getCurrentInstructor = cache(async () => {
    const session = await getSession();

    if (!session) {
        return null;
    }

    try {
        const [user] = await db
            .select()
            .from(instructors)
            .where(eq(instructors.id, session.userId));

        return user || null;
    } catch (e) {
        console.error(e);
        return null;
    }
});

export async function getUsersBySession(sessionId: number) {
  return db.query.users.findMany({
    where: (users, { eq }) => eq(users.sessionId, sessionId)
  });
}

export async function getSessionByCode(code: string) {
  return db.query.classSessions.findFirst({
    where: (classSessions, { eq }) => eq(classSessions.code, code)
  });
}

export async function getInstructorByUsername(username: string) {
    return db.query.instructors.findFirst({
        where: (instructors, { eq }) => eq(instructors.username, username)
    })
}

export async function getInstructionSessionsByUserId(userId: number) {
    return db.query.classSessions.findMany({
        where: (classSessions, { eq }) => eq(classSessions.instructorId, userId)
    });
}

export async function getDemoUserByEmail(email: string) {
    return db.query.users.findFirst({
        where: (users, { eq }) => eq(users.email, email)
    })
}

export async function createNewClassSession(instructorId: number, code: string) {
    return db.insert(classSessions).values({
        code,
        instructorId,
    }).returning();
}

export async function generateSessionCode(length: number) {
    // Excluded: 0, 1, 5 (numbers) and O, I, L, S (letters) to avoid confusion
    const alphabet = "2346789ABCDEFGHJKMNPQRSTUVWXY";

    let result = "";
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * alphabet.length);
        result += alphabet[randomIndex];
    }

    return result;
}