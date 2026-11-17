import { db } from '@/db/';
import {instructors, users} from '@/db/schema';
import {compare, genSalt, hash} from 'bcrypt';
import { cookies } from "next/headers";
import * as jose from 'jose';
import { cache } from 'react';
import {createHash, randomInt} from 'node:crypto';
import {normalizeEmail} from "@/lib/normalize";

// JWT types
interface JWTPayload {
    userId: number
    [key: string]: string | number | boolean | null | undefined
}

// Who a token was issued for. A token for one audience is rejected by the other.
type TokenAudience = 'instructor' | 'student'

export type DemoCreditCard = {
    number: string
    exp_month: number
    exp_year: number
    cvc: string
}

export type DemoAddress = {
    line1: string
    line2: string | null
    city: string
    state: string
    postal_code: string
    country: string
}

export type DemoPhone = {
    display: string,
    e164: string,
}

/* Read lazily so a missing secret doesn't break `next build`, only the first real use. */
let jwtSecret: Uint8Array | undefined
function getJwtSecret(): Uint8Array {
    if (!jwtSecret) {
        const secret = process.env.JWT_SECRET
        if (!secret || secret.length < 32) {
            throw new Error('JWT_SECRET must be set to a random string of at least 32 characters')
        }
        jwtSecret = new TextEncoder().encode(secret)
    }
    return jwtSecret
}

// JWT expiration time
const JWT_EXPIRATION = '7d' // 7 days

// One cookie per demo site, so signing in to one site doesn't sign you out of another.
const DEMO_COOKIE_PREFIX = 'demo_auth_token_'
const demoCookieName = (siteSlug: string) => `${DEMO_COOKIE_PREFIX}${siteSlug}`

// TODO: Create different hashing, verification, session and user auth functions for all the different security stages

export async function hashPassword(password: string): Promise<string> {
    return await hash(password, 10);
}

export async function verifyPassword(password: string, storedPassword: string): Promise<boolean> {
    return await compare(password, storedPassword);
}

export async function md5Hash(password: string): Promise<string> {
    return createHash('md5').update(password).digest('hex');
}

export async function verifyMd5Password(password: string, storedPassword: string): Promise<boolean> {
    return createHash('md5').update(password).digest('hex') === storedPassword;
}
export async function verifyPlainTextPassword(password: string, storedPassword: string): Promise<boolean> {
    return password === storedPassword;
}

export type StorageMode = 'plain-text' | 'hashed' | 'salted'

export type PasswordPreview = {
    mode: StorageMode
    algorithm: string
    salt: string | null
    saltedPassword: string | null // salt + password, before hashing
    digest: string                // the hash (or the plain text) on its own
    stored: string                // exactly what would go in the database
}

const SALT_ALPHABET = 'abcdefghijklmnopqrstuvwxyz0123456789'

// Short random string for the demo. Uses crypto's randomInt so it isn't guessable.
export function generateSimpleSalt(length = 8): string {
    let salt = ''
    for (let i = 0; i < length; i++) {
        salt += SALT_ALPHABET[randomInt(SALT_ALPHABET.length)]
    }
    return salt
}

// Teaching helper: shows what each storage method would put in the password column.
export async function previewPasswordStorage(mode: StorageMode, password: string): Promise<PasswordPreview> {
    switch (mode) {
        case 'plain-text':
            return { mode, algorithm: 'None', salt: null, saltedPassword: null, digest: password, stored: password }
        case 'hashed': {
            const digest = await md5Hash(password)
            return { mode, algorithm: 'MD5', salt: null, saltedPassword: null, digest, stored: digest }
        }
        case 'salted': {
            const salt = generateSimpleSalt()
            const saltedPassword = salt + password
            const digest = await md5Hash(saltedPassword)
            return {
                mode,
                algorithm: 'MD5 (applied to salt + password)',
                salt,
                saltedPassword,
                digest,
                stored: `${salt}:${digest}`,
            }
        }
    }
}

// How each demo site stores and checks passwords. Add a new security stage by adding an entry.
type PasswordScheme = {
    hash: (password: string) => Promise<string>
    verify: (password: string, storedPassword: string) => Promise<boolean>
}

const PASSWORD_SCHEMES: Record<string, PasswordScheme> = {
    shopzone: { hash: hashPassword, verify: verifyPassword },                       // bcrypt
    flixwatch: { hash: md5Hash, verify: verifyMd5Password },                        // unsalted MD5
    fmail: { hash: async (password) => password, verify: verifyPlainTextPassword }, // plain text
}

export async function hashPasswordForSite(siteSlug: string, password: string): Promise<string> {
    const scheme = PASSWORD_SCHEMES[siteSlug]
    if (!scheme) throw new Error(`Unknown site: ${siteSlug}`)
    return scheme.hash(password)
}

export async function verifyPasswordForSite(siteSlug: string, password: string, storedPassword: string): Promise<boolean> {
    const scheme = PASSWORD_SCHEMES[siteSlug]
    return scheme ? scheme.verify(password, storedPassword) : false
}

export async function createInstructor(name: string, password: string) {
    const hashedPassword = await hashPassword(password);

    const [newInstructor] = await db.insert(instructors).values({
        username: name,
        password: hashedPassword
    }).returning({ id: instructors.id });

    return { id:  newInstructor.id, name };
}

export async function createDemoUser(input: {
    siteSlug: string
    name: string
    email: string
    password: string
    sessionId: number
    siteId: number
    creditCard: DemoCreditCard
    address: DemoAddress
    phoneNumber: DemoPhone
}) {
    const { siteSlug, name, password, sessionId, siteId, creditCard, address, phoneNumber } = input
    const email = normalizeEmail(input.email)

    const [newUser] = await db.insert(users).values({
        name,
        email,
        password: await hashPasswordForSite(siteSlug, password),
        sessionId,
        siteId,
        creditCard: creditCard.number,
        cardExpMonth: creditCard.exp_month,
        cardExpYear: creditCard.exp_year,
        cardCvc: creditCard.cvc,
        addressLine1: address.line1,
        addressLine2: address.line2,
        addressCity: address.city,
        addressState: address.state,
        addressZip: address.postal_code,
        addressCountry: address.country,
        phoneNumber: phoneNumber.display
    }).returning({ id: users.id })

    return { id: newUser.id, name, email }
}

// Generate a JWT token
export async function generateJWT(payload: JWTPayload, audience: TokenAudience) {
    return await new jose.SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setAudience(audience)
        .setExpirationTime(JWT_EXPIRATION)
        .sign(getJwtSecret())
}

// Verify a JWT token
export async function verifyJWT(token: string, audience: TokenAudience): Promise<JWTPayload | null> {
    const secret = getJwtSecret() // outside the try: a missing secret is a config error, not a bad token
    try {
        const { payload } = await jose.jwtVerify(token, secret, { audience })
        return payload as JWTPayload
    } catch (error) {
        console.error('JWT verification failed:', error)
        return null
    }
}

// Create a session using JWT
export async function createSession(userId: number) {
    try {
        // Create JWT with user data
        const token = await generateJWT({ userId }, 'instructor')

        // Store JWT in a cookie
        const cookieStore = await cookies()
        cookieStore.set({
            name: 'auth_token',
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 7, // 1 week
            path: '/',
            sameSite: 'lax',
        })

        return true
    } catch (error) {
        console.error('Error creating session:', error)
        return false
    }
}

export async function createDemoSession(userId: number, sessionId: number, siteId: number, siteSlug: string){
    try {
        // Create JWT with user data
        const token = await generateJWT({ userId, sessionId, siteId }, 'student')

        // Store JWT in a cookie
        const cookieStore = await cookies()
        cookieStore.set({
            name: demoCookieName(siteSlug),
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 7, // 1 week
            path: '/',
            sameSite: 'lax',
        })

        return true
    } catch (error) {
        console.error('Error creating session:', error)
        return false
    }
}

// Get current session from JWT
export const getSession = cache(async () => {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('auth_token')?.value

        if (!token) return null
        const payload = await verifyJWT(token, 'instructor')

        return payload ? { userId: payload.userId } : null
    } catch (error) {
        // Handle the specific prerendering error
        if (
            error instanceof Error &&
            error.message.includes('During prerendering, `cookies()` rejects')
        ) {
            console.log(
                'Cookies not available during prerendering, returning null session'
            )
            return null
        }

        console.error('Error getting session:', error)
        return null
    }
})

export const getDemoSession = cache(async (sessionId: number, siteId: number, siteSlug: string) => {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get(demoCookieName(siteSlug))?.value

        if (!token) return null
        const payload = await verifyJWT(token, 'student')
        if (!payload || payload.sessionId !== sessionId || payload.siteId !== siteId) return null

        return { userId: payload.userId, sessionId, siteId }
    } catch (error) {
        // Handle the specific prerendering error
        if (
            error instanceof Error &&
            error.message.includes('During prerendering, `cookies()` rejects')
        ) {
            console.log(
                'Cookies not available during prerendering, returning null session'
            )
            return null
        }

        console.error('Error getting session:', error)
        return null
    }
})

export async function deleteSession() {
    const cookieStore = await cookies()
    cookieStore.delete('auth_token')
    for (const { name } of cookieStore.getAll()) {
        if (name.startsWith(DEMO_COOKIE_PREFIX)) cookieStore.delete(name)
    }
}