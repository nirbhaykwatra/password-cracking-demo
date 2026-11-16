"use server";
import { z } from "zod";
import {
    createDemoUser, verifyPassword, createSession, deleteSession,
    createDemoSession, verifyMd5Password, verifyPlainTextPassword
} from "@/lib/auth";
import {
    getInstructorByUsername,
    getDemoUserByEmail,
    getDemoUserBySiteSlug,
    getSiteBySlug,
    getSessionByCode, generateCreditCard, generateDemoAddress
} from "@/lib/dal";
import { redirect } from "next/navigation";

export type ActionResponse = {
    success: boolean
    message: string
    errors?: Record<string, string[]>
    error?: string
}

// Define Zod schema for signin validation
const SignInSchema = z.object({
    username: z.string().min(1, 'Username is required'),
    password: z.string().min(1, 'Password is required'),
})

const DemoSignInSchema = z.object({
    email: z
        .email('Invalid email format')
        .refine((value) => value.toLowerCase().endsWith('@fmail.test'), {
            message: 'Email must be an @fmail.test address',
        }),
    password: z.string().min(1, 'Password is required'),
})

const DemoSchemaSignUp = z.object({
    email: z
        .email('Invalid email format')
        .refine((value) => value.toLowerCase().endsWith('@fmail.test'), {
            message: 'Email must be an @fmail.test address',
        }),
    password: z.string().min(1, 'Password is required'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
})
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ['confirmPassword'],
    })

const FMailSchemaSignUp = z.object({
    first: z.string().min(1, 'First name is required').nonempty(),
    last: z.string().min(1, 'Last name is required').nonempty(),
    username: z.string().min(1, 'Username is required').nonempty(),
    password: z.string().min(1, 'Password is required'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
})
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ['confirmPassword'],
    })

export const signIn = async (prevState: ActionResponse | null, formData: FormData): Promise<ActionResponse> => {
    try {
        const data = {
            username: formData.get("username") as string,
            password: formData.get("password") as string,
        }

        const validation = SignInSchema.safeParse(data)
        if (!validation.success) {
            return {
                success: false,
                message: "Invalid input",
                errors: validation.error.flatten().fieldErrors,
            }
        }

        const user = await getInstructorByUsername(data.username)
        if (!user) {
            return {
                success: false,
                message: "Invalid Username",
                error: "Invalid Username"
            }
        }

        // Verify Password
        const verified = await verifyPassword(data.password, user.password)
        if (!verified) {
            return {
                success: false,
                message: "Invalid Password",
                error: "Invalid Password"
            }
        }

        await createSession(user.id);

        return {
            success: true,
            message: "Signed In Successfully"
        }
    }
    catch (error) {
        console.log(error);
        return {
            success: false,
            message: "An error occurred",
            error: "An error occurred"
        }
    }
}

//region Demo Sign In Actions

export const signInShopZone = async (prevState: ActionResponse | null, formData: FormData): Promise<ActionResponse> => {
    try {
        const data = {
            email: formData.get("email") as string,
            password: formData.get("password") as string,
            sessionCode: formData.get("sessionCode") as string,
        }

        const validation = DemoSignInSchema.safeParse(data)
        if (!validation.success) {
            return {
                success: false,
                message: "Invalid input",
                errors: validation.error.flatten().fieldErrors,
            }
        }

        const session = await getSessionByCode(data.sessionCode)
        if (!session){
            return {
                success: false,
                message: "Invalid session code",
                error: "Invalid session code"
            }
        }

        const site = await getSiteBySlug('shopzone')
        if (!site){
            return {
                success: false,
                message: "Invalid site",
                error: "Invalid site"
            }
        }

        const user = await getDemoUserBySiteSlug(data.email, 'shopzone', data.sessionCode);
        if (!user) {
            return {
                success: false,
                message: "Something went wrong",
                error: "Something went wrong"
            }
        }

        // Verify Password
        const verified = await verifyPassword(data.password, user.password)
        if (!verified) {
            return {
                success: false,
                message: "Invalid Password",
                error: "Invalid Password"
            }
        }

        await createDemoSession(user.id, session.id, site.id, site.slug);

        return {
            success: true,
            message: "Signed In Successfully"
        }
    }
    catch (error) {
        console.log(error);
        return {
            success: false,
            message: "An error occurred",
            error: "An error occurred"
        }
    }
}

export const signInFlixWatch = async (prevState: ActionResponse | null, formData: FormData): Promise<ActionResponse> => {
    try {
        const data = {
            username: formData.get("username") as string,
            email: formData.get("email") as string,
            password: formData.get("password") as string,
            sessionCode: formData.get("sessionCode") as string,
        }

        const validation = DemoSignInSchema.safeParse(data)
        if (!validation.success) {
            return {
                success: false,
                message: "Invalid input",
                errors: validation.error.flatten().fieldErrors,
            }
        }

        const session = await getSessionByCode(data.sessionCode)
        if (!session){
            return {
                success: false,
                message: "Invalid session code",
                error: "Invalid session code"
            }
        }

        const site = await getSiteBySlug('flixwatch')
        if (!site){
            return {
                success: false,
                message: "Invalid site",
                error: "Invalid site"
            }
        }

        const user = await getDemoUserBySiteSlug(data.email, 'flixwatch', data.sessionCode);
        if (!user) {
            return {
                success: false,
                message: "Something went wrong",
                error: "Something went wrong"
            }
        }

        // Verify Password
        const verified = await verifyMd5Password(data.password, user.password)
        if (!verified) {
            return {
                success: false,
                message: "Invalid Password",
                error: "Invalid Password"
            }
        }

        await createDemoSession(user.id, session.id, site.id, site.slug);

        return {
            success: true,
            message: "Signed In Successfully"
        }
    }
    catch (error) {
        console.log(error);
        return {
            success: false,
            message: "An error occurred",
            error: "An error occurred"
        }
    }
}

export const signInFMail = async (prevState: ActionResponse | null, formData: FormData): Promise<ActionResponse> => {
    try {
        const data = {
            first: formData.get("first-name") as string,
            last: formData.get("last-name") as string,
            username: formData.get("username") as string,
            email: formData.get("email") as string,
            password: formData.get("password") as string,
            sessionCode: formData.get("sessionCode") as string,
        }

        const validation = DemoSignInSchema.safeParse(data)
        if (!validation.success) {
            return {
                success: false,
                message: "Invalid input",
                errors: validation.error.flatten().fieldErrors,
            }
        }

        const session = await getSessionByCode(data.sessionCode)
        if (!session){
            return {
                success: false,
                message: "Invalid session code",
                error: "Invalid session code"
            }
        }

        const site = await getSiteBySlug('fmail')
        if (!site){
            return {
                success: false,
                message: "Invalid site",
                error: "Invalid site"
            }
        }

        const user = await getDemoUserBySiteSlug(data.email, 'fmail', data.sessionCode);
        if (!user) {
            return {
                success: false,
                message: "Something went wrong",
                error: "Something went wrong"
            }
        }

        // Verify Password
        const verified = await verifyPlainTextPassword(data.password, user.password)
        if (!verified) {
            return {
                success: false,
                message: "Invalid Password",
                error: "Invalid Password"
            }
        }

        await createDemoSession(user.id, session.id, site.id, site.slug);

        return {
            success: true,
            message: "Signed In Successfully"
        }
    }
    catch (error) {
        console.log(error);
        return {
            success: false,
            message: "An error occurred",
            error: "An error occurred"
        }
    }
}

//endregion

//region Demo Sign Up Actions

export const signUpShopZone = async (prevState: ActionResponse | null, formData: FormData): Promise<ActionResponse> => {
    try {
        const data = {
            email: formData.get("email") as string,
            password: formData.get("password") as string,
            confirmPassword: formData.get("confirm-password") as string,
            sessionCode: formData.get("sessionCode") as string
        }

        const validation = DemoSchemaSignUp.safeParse(data)
        if (!validation.success) {
            return {
                success: false,
                message: "Invalid input",
                errors: validation.error.flatten().fieldErrors,
            }
        }

        const fmail = await getDemoUserBySiteSlug(data.email, 'fmail', data.sessionCode);
        if (!fmail){
            return {
                success: false,
                message: "That email does not exist!",
                error: "That email does not exist!"
            }
        }

        const existingUser = await getDemoUserBySiteSlug(data.email, 'shopzone', data.sessionCode)
        if (existingUser){
            return {
                success: false,
                message: "Something went wrong",
                error: "Something went wrong"
            }
        }

        const session = await getSessionByCode(data.sessionCode)
        if (!session){
            return {
                success: false,
                message: "Invalid session code",
                error: "Invalid session code"
            }
        }

        const site = await getSiteBySlug('shopzone')
        if (!site){
            return {
                success: false,
                message: "Invalid site",
                error: "Invalid site"
            }
        }

        const creditCard = await generateCreditCard();
        const address = generateDemoAddress(data.email)

        const user = await createDemoUser({
                siteSlug: site.slug, name: fmail.name, email: data.email, password: data.password,
                sessionId: session.id, siteId: site.id, creditCard, address,
            });
        if (!user){
            return {
                success: false,
                message: "Try again",
                error: "Account could not be created"
            }
        }

        await createDemoSession(user.id, session.id, site.id, site.slug);

        return {
            success: true,
            message: "Signed Up Successfully"
        }
    }
    catch (error) {
        console.log(error);
        return {
            success: false,
            message: "An error occurred",
            error: "An error occurred"
        }
    }
}

export const signUpFlixWatch = async (prevState: ActionResponse | null, formData: FormData): Promise<ActionResponse> => {
    try {
        const data = {
            email: formData.get("email") as string,
            password: formData.get("password") as string,
            confirmPassword: formData.get("confirm-password") as string,
            sessionCode: formData.get("sessionCode") as string
        }

        const fmail = await getDemoUserBySiteSlug(data.email, 'fmail', data.sessionCode);
        if (!fmail){
            return {
                 success: false,
                 message: "That email does not exist!",
                 error: "That email does not exist!"
            }
        }

        const validation = DemoSchemaSignUp.safeParse(data)
        if (!validation.success) {
            return {
                success: false,
                message: "Invalid input",
                errors: validation.error.flatten().fieldErrors,
            }
        }

        const existingUser = await getDemoUserBySiteSlug(data.email, 'flixwatch', data.sessionCode)
        if (existingUser){
            return {
                success: false,
                message: "Something went wrong",
                error: "Something went wrong"
            }
        }

        const session = await getSessionByCode(data.sessionCode)
        if (!session){
            return {
                success: false,
                message: "Invalid session code",
                error: "Invalid session code"
            }
        }

        const site = await getSiteBySlug('flixwatch')
        if (!site){
            return {
                success: false,
                message: "Invalid site",
                error: "Invalid site"
            }
        }

        const creditCard = await generateCreditCard();
        const address = generateDemoAddress(data.email)

        const user = await createDemoUser({
                siteSlug: site.slug, name: fmail.name, email: data.email, password: data.password,
                sessionId: session.id, siteId: site.id, creditCard, address,
            });
        if (!user){
            return {
                success: false,
                message: "Try again",
                error: "Account could not be created"
            }
        }

        await createDemoSession(user.id, session.id, site.id, site.slug);

        return {
            success: true,
            message: "Signed Up Successfully"
        }
    }
    catch (error) {
        console.log(error);
        return {
            success: false,
            message: "An error occurred",
            error: "An error occurred"
        }
    }
}

export const signUpFMail = async (prevState: ActionResponse | null, formData: FormData): Promise<ActionResponse> => {
    try {
        const data = {
            first: formData.get("first-name") as string,
            last: formData.get("last-name") as string,
            username: formData.get("username") as string,
            password: formData.get("password") as string,
            confirmPassword: formData.get("confirm-password") as string,
            sessionCode: formData.get("sessionCode") as string
        }

        const email = data.username + "@fmail.test";
        const username = data.first + " " +  data.last;

        const validation = FMailSchemaSignUp.safeParse(data)
        if (!validation.success) {
            return {
                success: false,
                message: "Invalid input",
                errors: validation.error.flatten().fieldErrors,
            }
        }

        const existingUser = await getDemoUserBySiteSlug(email, 'fmail', data.sessionCode)
        if (existingUser){
            return {
                success: false,
                message: "Something went wrong",
                error: "Something went wrong"
            }
        }

        const session = await getSessionByCode(data.sessionCode)
        if (!session){
            return {
                success: false,
                message: "Invalid session code",
                error: "Invalid session code"
            }
        }

        const site = await getSiteBySlug('fmail')
        if (!site){
            return {
                success: false,
                message: "Invalid site",
                error: "Invalid site"
            }
        }

        const creditCard = await generateCreditCard();
        const address = generateDemoAddress(email)

        const user = await createDemoUser({
                siteSlug: site.slug, name: username, email, password: data.password,
                sessionId: session.id, siteId: site.id, creditCard, address,
            });
        if (!user){
            return {
                success: false,
                message: "Try again",
                error: "Account could not be created"
            }
        }

        await createDemoSession(user.id, session.id, site.id, site.slug);

        return {
            success: true,
            message: "Signed Up Successfully"
        }
    }
    catch (error) {
        console.log(error);
        return {
            success: false,
            message: "An error occurred",
            error: "An error occurred"
        }
    }
}

//endregion

export const signOut = async () => {
    try {
        await deleteSession();
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        redirect('/')
    }
}