import { sql } from "drizzle-orm";
import { db } from '@/db/';
import { users } from '@/db/schema';

export async function getUsers() {
  return sql`SELECT * FROM ${users}`;
}

export async function getUserByEmail(email: string) {
    return db.query.users.findFirst({
        where: (users, { eq }) => eq(users.email, email)
    })
}