import { db } from '@/db/';
import {instructors, users} from '@/db/schema';
import { compare, hash } from 'bcrypt';
import { cookies } from "next/headers";
import * as jose from 'jose';
import { cache } from 'react';
import {createHash, hash as cryptoHash, randomBytes} from 'node:crypto';
import {integer, text} from "drizzle-orm/pg-core";

// JWT types
interface JWTPayload {
    userId: number
    [key: string]: string | number | boolean | null | undefined
}

// Secret key for JWT signing (in a real app, use an environment variable)
const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'your-secret-key-min-32-chars-long!!!'
)

// JWT expiration time
const JWT_EXPIRATION = '7d' // 7 days

// Token refresh threshold (refresh if less than this time left)
const REFRESH_THRESHOLD = 24 * 60 * 60 // 24 hours in seconds

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

export async function createInstructor(name: string, password: string) {
    const hashedPassword = await hashPassword(password);

    const [newInstructor] = await db.insert(instructors).values({
        username: name,
        password: hashedPassword
    }).returning({ id: instructors.id });

    return { id:  newInstructor.id, name };
}

export async function createFlixWatchUser(
    name: string,
    email: string,
    password: string,
    sessionId: number,
    siteId: number,
    creditCard: {
        number: string,
        exp_month: number,
        exp_year: number,
        cvc: string,
    },
    address: {
        line1: string,
        line2: string | null,
        city: string,
        state: string,
        postal_code: string,
        country: string,
    }
){

    const hashedPassword = await md5Hash(password);

    const [newUser] = await db.insert(users).values({
        name,
        email,
        password: hashedPassword,
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
    }).returning({ id: users.id });

    return { id: newUser.id , name, email }
}

export async function createFMailUser(
    name: string,
    email: string,
    password: string,
    sessionId: number,
    siteId: number,
    creditCard: {
        number: string,
        exp_month: number,
        exp_year: number,
        cvc: string,
    },
    address: {
        line1: string,
        line2: string | null,
        city: string,
        state: string,
        postal_code: string,
        country: string,
    }
){

    const [newUser] = await db.insert(users).values({
        name,
        email,
        password,
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
    }).returning({ id: users.id });

    return { id: newUser.id , name, email }
}

export async function createShopZoneUser(
    name: string,
    email: string,
    password: string,
    sessionId: number,
    siteId: number,
    creditCard: {
        number: string,
        exp_month: number,
        exp_year: number,
        cvc: string,
    },
    address: {
        line1: string,
        line2: string | null,
        city: string,
        state: string,
        postal_code: string,
        country: string,
    }
){

    const hashedPassword = await hashPassword(password);

    const [newUser] = await db.insert(users).values({
        name,
        email,
        password: hashedPassword,
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
    }).returning({ id: users.id });

    return { id: newUser.id , name, email }
}

// Generate a JWT token
export async function generateJWT(payload: JWTPayload) {
    return await new jose.SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(JWT_EXPIRATION)
        .sign(JWT_SECRET)
}

// Verify a JWT token
export async function verifyJWT(token: string): Promise<JWTPayload | null> {
    try {
        const { payload } = await jose.jwtVerify(token, JWT_SECRET)
        return payload as JWTPayload
    } catch (error) {
        console.error('JWT verification failed:', error)
        return null
    }
}

// Check if token needs refresh
export async function shouldRefreshToken(token: string): Promise<boolean> {
    try {
        const { payload } = await jose.jwtVerify(token, JWT_SECRET, {
            clockTolerance: 15, // 15 seconds tolerance for clock skew
        })

        // Get expiration time
        const exp = payload.exp as number
        const now = Math.floor(Date.now() / 1000)

        // If token expires within the threshold, refresh it
        return exp - now < REFRESH_THRESHOLD
    } catch {
        // If verification fails, token is invalid or expired
        return false
    }
}

// Create a session using JWT
export async function createSession(userId: number) {
    try {
        // Create JWT with user data
        const token = await generateJWT({ userId })

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

export async function createDemoSession(userId: number, sessionId: number, siteId: number){
    try {
        // Create JWT with user data
        const token = await generateJWT({ userId, sessionId, siteId })

        // Store JWT in a cookie
        const cookieStore = await cookies()
        cookieStore.set({
            name: 'demo_auth_token',
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
        const payload = await verifyJWT(token)

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

export const getDemoSession = cache(async (sessionId: number, siteId: number) => {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('demo_auth_token')?.value

        if (!token) return null
        const payload = await verifyJWT(token)

        return payload ? { userId: payload.userId, sessionId: payload.sessionId, siteId: payload.siteId } : null
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

// Delete session by clearing the JWT cookie
export async function deleteSession() {
    const cookieStore = await cookies()
    cookieStore.delete('auth_token')
}