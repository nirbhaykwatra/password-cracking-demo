"use server";
import { z } from "zod";
import { createUser, verifyPassword, createSession, deleteSession } from "@/lib/auth";
import { getInstructorByUsername, getDemoUserByEmail } from "@/lib/dal";
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

// Define Zod schema for signup validation
const SignUpSchema = z
    .object({
        username: z.string().min(1, 'Username is required').nonempty(),
        email: z.string().min(1, 'Email is required').email('Invalid email format'),
        password: z.string().min(8, 'Password must be at least 8 characters'),
        confirmPassword: z.string().min(1, 'Please confirm your password'),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ['confirmPassword'],
    })

// TODO: Implement actions for instructor sign-in and individual sign-in and sign-up for each demo website (ShopZone, Poodle, FlixWatch), each website having a different password storage method.
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

export const signInDemo = async (prevState: ActionResponse | null, formData: FormData): Promise<ActionResponse> => {
    try {
        const data = {
            username: formData.get("username") as string,
            email: formData.get("email") as string,
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

        const user = await getDemoUserByEmail(data.email)
        if (!user) {
            return {
                success: false,
                message: "Invalid Email",
                error: "Invalid Email"
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

export const signUpDemo = async (prevState: ActionResponse | null, formData: FormData): Promise<ActionResponse> => {
    try {
        const data = {
            username: formData.get("username") as string,
            email: formData.get("email") as string,
            password: formData.get("password") as string,
            confirmPassword: formData.get("confirm-password") as string,
        }

        const validation = SignUpSchema.safeParse(data)
        if (!validation.success) {
            return {
                success: false,
                message: "Invalid input",
                errors: validation.error.flatten().fieldErrors,
            }
        }

        const existingUser = await getDemoUserByEmail(data.email)
        if (existingUser){
            return {
                success: false,
                message: "Something went wrong",
                error: "Something went wrong"
            }
        }

        const user = await createUser(data.username, data.email, data.password);
        if (!user){
            return {
                success: false,
                message: "Try again",
                error: "Account could not be created"
            }
        }

        await createSession(user.id);

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