import { db } from '@/db/';
import { users } from '@/db/schema';
import { compare, hash } from 'bcrypt';
import { cookies } from "next/headers";
import * as jose from 'jose';
import { cache } from 'react';
import { hash as  cryptoHash, randomBytes } from 'node:crypto';

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

export async function hashPassword(password: string, securityStage: string): Promise<string> {
    switch (securityStage) {
        case 'plain-text':
            return password;
        case 'hashed':
            return cryptoHash('md5', password, 'hex');
        case 'salted': {
            const salt = randomBytes(16).toString('hex');
            const hashed = cryptoHash('sha256', salt + password, 'hex');
            return `${salt}:${hashed}`;
        }
        case 'full-security':
            return await hash(password, 10);
        default:
            throw new Error('Invalid security stage');
    }
}

export async function verifyPassword(password: string, storedPassword: string, securityStage: string): Promise<boolean> {
    switch (securityStage) {
        case 'plain-text':
            return password === storedPassword;
        case 'hashed':
            return cryptoHash('md5', password, 'hex') === storedPassword;
        case 'salted': {
            const [salt, storedHash] = storedPassword.split(':');
            return cryptoHash('sha256', salt + password, 'hex') === storedHash;
        }
        case 'full-security':
            return await compare(password, storedPassword);
        default:
            throw new Error('Invalid security stage');
    }
}

export async function createUser(name: string, email: string, password: string, securityStage: string){

    const hashedPassword = await hashPassword(password,  securityStage);

    const [newUser] = await db.insert(users).values({
        name,
        email,
        password: hashedPassword,
        securityStage
    }).returning({ id: users.id });

    return { id: newUser.id , name, email, securityStage }
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

// Delete session by clearing the JWT cookie
export async function deleteSession() {
    const cookieStore = await cookies()
    cookieStore.delete('auth_token')
}