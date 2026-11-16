import {eq, and, asc, min} from "drizzle-orm";
import { cache } from 'react';
import { db } from '@/db/';
import {classSessions, instructors, sites, users} from '@/db/schema';
import {getDemoSession, getSession, verifyJWT} from '@/lib/auth';
import { normalizeEmail, normalizeSessionCode } from '@/lib/normalize';
import {notFound, redirect} from "next/navigation";

const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

const streetNames = [
    "Maple", "Oak", "Cedar", "Pine", "Elm", "Willow", "Birch", "Sunset", "Lakeview", "Highland",
    "Walnut", "Chestnut", "Spruce", "Aspen", "Hickory", "Sycamore", "Magnolia", "Poplar", "Cypress", "Juniper",
    "Meadow", "Ridge", "River", "Forest", "Hillcrest", "Park", "Church", "Mill", "Spring", "Valley",
    "Washington", "Lincoln", "Jefferson", "Madison", "Jackson", "Franklin", "Adams", "Monroe", "Roosevelt", "Hamilton",
    "Main", "Broad", "Market", "Union", "Center", "Franklin", "Liberty", "Cherry", "Orchard", "Garden",
    "Sunrise", "Prairie", "Harbor", "Bay", "Summit", "Canyon", "Brook", "Creek", "Stone", "Fairview",
    "Windsor", "Kingston", "Oxford", "Cambridge", "Clifton", "Easton", "Westwood", "Northfield", "Southgate", "Lakeside",
];

const streetTypes = ["St", "Ave", "Blvd", "Rd", "Ln", "Dr", "Way", "Ct", "Pl", "Ter", "Pkwy", "Cir"];

const locations = [
    { city: "Springfield", state: "IL", zip: "62701" },
    { city: "Portland", state: "OR", zip: "97201" },
    { city: "Austin", state: "TX", zip: "73301" },
    { city: "Denver", state: "CO", zip: "80201" },
    { city: "Madison", state: "WI", zip: "53703" },
    { city: "Raleigh", state: "NC", zip: "27601" },
    { city: "Columbus", state: "OH", zip: "43215" },
    { city: "Nashville", state: "TN", zip: "37201" },
    { city: "Phoenix", state: "AZ", zip: "85001" },
    { city: "Seattle", state: "WA", zip: "98101" },
    { city: "Boise", state: "ID", zip: "83702" },
    { city: "Omaha", state: "NE", zip: "68102" },
    { city: "Richmond", state: "VA", zip: "23219" },
    { city: "Albany", state: "NY", zip: "12207" },
    { city: "Sacramento", state: "CA", zip: "95814" },
    { city: "Salt Lake City", state: "UT", zip: "84101" },
    { city: "Charleston", state: "SC", zip: "29401" },
    { city: "Providence", state: "RI", zip: "02903" },
    { city: "Des Moines", state: "IA", zip: "50309" },
    { city: "Little Rock", state: "AR", zip: "72201" },
    { city: "Baton Rouge", state: "LA", zip: "70801" },
    { city: "Jackson", state: "MS", zip: "39201" },
    { city: "Montgomery", state: "AL", zip: "36104" },
    { city: "Tallahassee", state: "FL", zip: "32301" },
    { city: "Atlanta", state: "GA", zip: "30303" },
    { city: "Louisville", state: "KY", zip: "40202" },
    { city: "Indianapolis", state: "IN", zip: "46204" },
    { city: "Lansing", state: "MI", zip: "48933" },
    { city: "Saint Paul", state: "MN", zip: "55101" },
    { city: "Madison Heights", state: "MI", zip: "48071" },
    { city: "Topeka", state: "KS", zip: "66603" },
    { city: "Oklahoma City", state: "OK", zip: "73102" },
    { city: "Santa Fe", state: "NM", zip: "87501" },
    { city: "Cheyenne", state: "WY", zip: "82001" },
    { city: "Helena", state: "MT", zip: "59601" },
    { city: "Bismarck", state: "ND", zip: "58501" },
    { city: "Pierre", state: "SD", zip: "57501" },
    { city: "Concord", state: "NH", zip: "03301" },
    { city: "Montpelier", state: "VT", zip: "05602" },
    { city: "Augusta", state: "ME", zip: "04330" },
    { city: "Hartford", state: "CT", zip: "06103" },
    { city: "Trenton", state: "NJ", zip: "08608" },
    { city: "Dover", state: "DE", zip: "19901" },
    { city: "Annapolis", state: "MD", zip: "21401" },
    { city: "Harrisburg", state: "PA", zip: "17101" },
    { city: "Charleston", state: "WV", zip: "25301" },
    { city: "Carson City", state: "NV", zip: "89701" },
    { city: "Olympia", state: "WA", zip: "98501" },
    { city: "Salem", state: "OR", zip: "97301" },
    { city: "Lincoln", state: "NE", zip: "68508" },
    { city: "Springfield", state: "MO", zip: "65806" },
];

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

export const getCurrentDemoUser = cache(async(sessionCode: string, siteSlug: string) => {
    const session = await getSessionByCode(sessionCode);
    const site = await getSiteBySlug(siteSlug);
     if (!session || !site) {
        return null;
    }
    const jwtSession = await getDemoSession(session.id, site.id, site.slug);

    if  (!jwtSession) {
        return null;
    }

    try {
        const [user] = await db
            .select()
            .from(users)
            .where(
                and(
                    eq(users.id, jwtSession.userId),
                    eq(users.siteId, Number(jwtSession.siteId)),
                    eq(users.sessionId, Number(jwtSession.sessionId))
                ));

        return user || null;
    } catch (e) {
        console.error(e);
        return null;
    }
});

// For student pages. Unknown session/site -> 404. Not logged in to this site -> its sign-in page.
export async function requireDemoUser(sessionCode: string, siteSlug: string) {
    const [session, site] = await Promise.all([
        getSessionByCode(sessionCode),
        getSiteBySlug(siteSlug),
    ]);
    if (!session || !site) {
        notFound();
    }

    const user = await getCurrentDemoUser(sessionCode, siteSlug);
    if (!user) {
        redirect(`/${session.code}/${site.slug}/signin`);
    }

    return user;
}

export async function getUsersBySession(sessionId: number) {
  return db.query.users.findMany({
    where: (users, { eq }) => eq(users.sessionId, sessionId)
  });
}

export async function getSessionByCode(code: string) {
  const normalized = normalizeSessionCode(code);
  return db.query.classSessions.findFirst({
    where: (classSessions, { eq }) => eq(classSessions.code, normalized)
  });
}

// For instructor-only pages. Logged out -> /signin. Not the owner (or no such session) -> 404.
export async function requireOwnedSession(sessionCode: string) {
    const instructor = await getCurrentInstructor();
    if (!instructor) {
        redirect("/signin");
    }

    const session = await getSessionByCode(sessionCode);
    if (!session || session.instructorId !== instructor.id) {
        notFound();
    }

    return session;
}

// For API routes: the session if the logged-in instructor owns it, otherwise null.
export async function getOwnedSession(sessionCode: string) {
    const instructor = await getCurrentInstructor();
    if (!instructor) return null;

    const session = await getSessionByCode(sessionCode);
    return session && session.instructorId === instructor.id ? session : null;
}

export async function getSiteBySlug(slug: string) {
    return db.query.sites.findFirst({
        where: (sites, { eq }) => eq(sites.slug, slug)
    })
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

export async function getDemoUserBySiteSlug(email: string, siteSlug: string, sessionCode: string) {
    const session = await getSessionByCode(sessionCode)

    if (session == null)
        return null;

    const site = await getSiteBySlug(siteSlug)

    if (site == null)
        return null;

    const normalizedEmail = normalizeEmail(email);

    return await db.query.users.findFirst({
        where: (users, { and, eq }) => and(
            eq(users.siteId, site.id),
            eq(users.email, normalizedEmail),
            eq(users.sessionId, session.id)
        ),
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

export async function generateCreditCard(){
    return {
        number: `${generateFourDigitCode()} ${generateFourDigitCode()} ${generateFourDigitCode()} ${generateFourDigitCode()}`,
        exp_month: months[Math.floor(Math.random() * months.length)],
        exp_year: getExpiryYear(),
        cvc: generateThreeDigitCode(),
    }
}

export function generateDemoAddress(userKey: number | string) {
    const baseSeed = typeof userKey === "number" ? userKey : hashString(userKey);
    // Spread small sequential IDs (1, 2, 3...) across the seed space
    const rng = createRng(Math.imul(baseSeed + 1, 2654435761));

    const { city, state, zip } = pick(locations, rng);

    return {
        line1: `${Math.floor(rng() * 9900) + 100} ${pick(streetNames, rng)} ${pick(streetTypes, rng)}`,
        line2: rng() < 0.3 ? `Apt ${Math.floor(rng() * 400) + 1}` : null,
        city,
        state,
        postal_code: zip,
        country: "US",
    };
}

export type DemoUsername = {
    name: string;
    email: string;
};

export type DemoWebsite = {
    name: string;
    slug: string;
};

export const getDemoUsernames = async (sessionCode: string): Promise<DemoUsername[]> => {
    const session = await getSessionByCode(sessionCode);
    if (!session) return [];

    // One row per email (the same student has an account on each demo site),
    // ordered by when they first signed up.
    return db
        .select({ name: users.name, email: users.email })
        .from(users)
        .where(eq(users.sessionId, session.id))
        .groupBy(users.email, users.name)
        .orderBy(asc(min(users.id)));
};

export const getDemoWebsites = async (): Promise<DemoWebsite[]> => {
    return db
        .select({ name: sites.name, slug: sites.slug })
        .from(sites)
        .orderBy(asc(sites.id));
};

const generateFourDigitCode = (): string => {
    const num = Math.floor(Math.random() * 10000);
    return num.toString().padStart(4, '0');
};

const generateThreeDigitCode = (): string => {
    const num = Math.floor(Math.random() * 1000);
    return num.toString().padStart(3, '0');
};

const getExpiryYear = (): number => {
    return new Date().getFullYear() + 5;
};

// Small, fast seeded PRNG (mulberry32): same seed => same sequence
function createRng(seed: number): () => number {
    let a = seed >>> 0;
    return () => {
        a = (a + 0x6d2b79f5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

// Turns a string (e.g. an email) into a numeric seed
function hashString(value: string): number {
    let hash = 2166136261;
    for (let i = 0; i < value.length; i++) {
        hash ^= value.charCodeAt(i);
        hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
}

function pick<T>(items: T[], rng: () => number): T {
    return items[Math.floor(rng() * items.length)];
}
