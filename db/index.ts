import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Reuse one client across dev hot reloads instead of leaking a pool per reload.
const globalForDb = globalThis as unknown as { pgClient?: ReturnType<typeof postgres> };

function createClient() {
    const url = process.env.DATABASE_URL;
    if (!url) {
        throw new Error("DATABASE_URL is not set");
    }
    return postgres(url);
}

const client = globalForDb.pgClient ?? createClient();
if (process.env.NODE_ENV !== "production") {
    globalForDb.pgClient = client;
}

export const db = drizzle(client, { schema });