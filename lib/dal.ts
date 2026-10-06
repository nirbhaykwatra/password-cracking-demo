import { sql } from "drizzle-orm";
import { db } from '@/db/';
import { users } from '@/db/schema';

export async function getUsers() {
  return sql`SELECT * FROM ${users}`;
}

export async function getInstructorByUsername(username: string) {
    return db.query.instructors.findFirst({
        where: (instructors, { eq }) => eq(instructors.username, username)
    })
}

export async function getDemoUserByEmail(email: string) {
    return db.query.users.findFirst({
        where: (users, { eq }) => eq(users.email, email)
    })
}