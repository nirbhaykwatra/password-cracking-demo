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

const firstNames = [
    "Ava", "Liam", "Noah", "Emma", "Mia", "Lucas", "Zoe", "Ethan", "Chloe", "Owen",
    "Ella", "Jack", "Nora", "Leo", "Ruby", "Finn", "Ivy", "Theo", "Maya", "Sam",
];

const lastNames = [
    "Nguyen", "Patel", "Kim", "Singh", "Chen", "Garcia", "Smith", "Brown", "Wilson", "Lee",
    "Martin", "Clark", "Young", "Walker", "Hall", "Allen", "King", "Wright", "Scott", "Green",
];

// Mostly weak passwords that sit in common wordlists, plus a few that don't
const weakPasswords = [
    "password", "123456", "qwerty", "letmein", "dragon", "monkey",
    "sunshine", "iloveyou", "welcome", "football", "baseball", "superman",
];
const strongPasswords = ["vK9#mQ2$xL7!", "correct-horse-battery-staple", "T7r!pZ0qWn4e"];

// Base words for the rule-crackable passwords below. Confirmed present in
// common-100.txt, so these crack at any wordlist size the instructor picks.
const ruleBaseWords = ["dragon", "monkey", "shadow", "superman"];
// Top 6 entries of english-*.txt, in order — matches the Rules panel's default
// vocabulary size for the xkcd-style patterns regardless of list size chosen.
const xkcdWords = ["the", "and", "for", "that", "this", "with"];

// Mirrors the digit-suffix rule: word + 3 digits (e.g. "dragon482")
function wordDigitsPassword(rng: () => number): string {
    const word = pick(ruleBaseWords, rng);
    const digits = String(Math.floor(rng() * 1000)).padStart(3, "0");
    return word + digits;
}

// Mirrors the word-year rule: Capitalized word + birth/grad year (e.g. "Shadow2008")
function wordYearPassword(rng: () => number): string {
    const word = pick(ruleBaseWords, rng);
    const capitalized = word.charAt(0).toUpperCase() + word.slice(1);
    const year = 1960 + Math.floor(rng() * (2026 - 1960 + 1));
    return capitalized + year;
}

const LEET_SUBS: Record<string, string> = { a: "4", e: "3", i: "1", o: "0", s: "5", t: "7" };

// Mirrors the leet-word rule: a random subset of substitutable letters swapped (e.g. "5up3rm4n")
function leetPassword(rng: () => number): string {
    const word = pick(ruleBaseWords, rng);
    return word
        .split("")
        .map((ch) => (rng() < 0.6 && LEET_SUBS[ch] ? LEET_SUBS[ch] : ch))
        .join("");
}

// Mirrors the xkcd4 / xkcd4-sep rules: 4 words from the default vocabulary slice
function xkcdPassword(rng: () => number, separator: string): string {
    return Array.from({ length: 4 }, () => pick(xkcdWords, rng)).join(separator);
}

// Mirrors Pure Brute Force mode: short enough that iterating the full a-z
// keyspace finds it quickly once the instructor sets the length slider to match.
const SHORT_PASSWORD_LENGTH = 4;
const ALPHABET = "abcdefghijklmnopqrstuvwxyz";

function shortPassword(rng: () => number): string {
    let out = "";
    for (let i = 0; i < SHORT_PASSWORD_LENGTH; i++) {
        out += ALPHABET[Math.floor(rng() * ALPHABET.length)];
    }
    return out;
}

// One entry per attack this demo is built to showcase: a dictionary hit, each
// rule pattern from the Rules panel, a brute-forceable short password, and an
// unguessable control password.
export type PasswordCategory = "weak" | "short" | "word-digits" | "word-year" | "leet-word" | "xkcd4" | "xkcd4-sep" | "strong";

export const PASSWORD_CATEGORIES: PasswordCategory[] = [
    "weak", "short", "word-digits", "word-year", "leet-word", "xkcd4", "xkcd4-sep", "strong",
];

function passwordForCategory(category: PasswordCategory, rng: () => number): string {
    switch (category) {
        case "weak": return pick(weakPasswords, rng);
        case "short": return shortPassword(rng);
        case "word-digits": return wordDigitsPassword(rng);
        case "word-year": return wordYearPassword(rng);
        case "leet-word": return leetPassword(rng);
        case "xkcd4": return xkcdPassword(rng, "");
        case "xkcd4-sep": return xkcdPassword(rng, "-");
        case "strong": return pick(strongPasswords, rng);
    }
}

export type LeakedCredential = {
    name: string;
    email: string;
    hash: string;
};

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
    where: (users, { eq }) => eq(users.sessionId, sessionId),
    with: { site: true }
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

export async function getSiteById(id: number) {
    return db.query.sites.findFirst({
        where: (sites, { eq }) => eq(sites.id, id)
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

// Builds a plausible NANP area code: NXX where N is 2-9, the second digit is 0-8,
// it isn't an N11 service code (e.g. 911), and it avoids the reserved 37X and 96X blocks.
function generateAreaCode(rng: () => number): string {
    while (true) {
        const first = 2 + Math.floor(rng() * 8); // 2-9
        const second = Math.floor(rng() * 9);    // 0-8
        const third = Math.floor(rng() * 10);    // 0-9

        const isServiceCode = second === 1 && third === 1;
        const isReservedBlock = (first === 3 && second === 7) || (first === 9 && second === 6);
        if (isServiceCode || isReservedBlock) continue;

        return `${first}${second}${third}`;
    }
}

export async function generateDemoPhoneNumber(userKey: number | string) {
    const baseSeed = typeof userKey === "number" ? userKey : hashString(userKey);
    // Different multiplier from generateDemoAddress so the two aren't correlated
    const rng = createRng(Math.imul(baseSeed + 1, 2246822519));

    const areaCode = generateAreaCode(rng);
    // 555-0100 through 555-0199 are reserved for fictional use in every area code
    const line = String(Math.floor(rng() * 100)).padStart(2, "0");

    return {
        display: `(${areaCode}) 555-01${line}`,
        e164: `+1${areaCode}55501${line}`,
    };
}

export async function generateDemoAddress(userKey: number | string) {
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

// Simulates a breach: the email + stored password column for one site in one session.
// Callers must check ownership first (e.g. requireOwnedSession).
export const getLeakedCredentials = async (sessionCode: string, siteSlug: string): Promise<LeakedCredential[]> => {
    const [session, site] = await Promise.all([
        getSessionByCode(sessionCode),
        getSiteBySlug(siteSlug),
    ]);
    if (!session || !site) return [];

    return db
        .select({ name: users.name, email: users.email, hash: users.password })
        .from(users)
        .where(and(eq(users.sessionId, session.id), eq(users.siteId, site.id)))
        .orderBy(asc(users.id));
};

export const getDemoWebsites = async (): Promise<DemoWebsite[]> => {
    return db
        .select({ name: sites.name, slug: sites.slug })
        .from(sites)
        .orderBy(asc(sites.id));
};

export function rollDemoStudent(category: PasswordCategory) {

    const rng = createRng(Math.imul(Math.random() * 100 + 1, 2654435761));
    const first = pick(firstNames, rng);
    const last = pick(lastNames, rng);
    const suffix = Math.floor(Math.random() * 90) + 10;

    return {
        name: `${first} ${last}`,
        email: `${first}.${last}${suffix}@fmail.test`.toLowerCase(),
        password: passwordForCategory(category, rng),
    };
}

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
