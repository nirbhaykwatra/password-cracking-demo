"use client"

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ActionResponse, signUp } from "@/app/actions/auth";
import PrismaticBackground from "@/components/backgrounds/PrismaticBackground";
import Link from "next/link";

export default function SignUpPage() {

    const router = useRouter();
    const [state, formAction, isPending] = useActionState<ActionResponse | null, FormData>(
        signUp,
        null
    );

    useEffect(() => {
        if (state?.success) {
            router.push("/dashboard");
        }
    }, [state, router]);

    return (
        <>
            <PrismaticBackground />

            <main className="flex min-h-screen items-center justify-center p-6 font-sans">
                <div className="max-w-lg w-full rounded-[24px] border border-white/10 bg-black/40 p-10 text-center shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] backdrop-blur-xl">

                    <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-white md:text-5xl">
                        Join The Club!
                    </h1>

                    <form
                        action={formAction}
                        className="mt-8 flex flex-col gap-4 rounded-2xl"
                    >
                        {state && !state.success && (
                            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400">
                                {state.message}
                            </p>
                        )}

                        <div className="flex flex-col gap-1.5">
                            <label
                                htmlFor="username"
                                className="text-xs font-semibold uppercase tracking-wide text-foreground/ text-left"
                            >
                                Username
                            </label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                autoComplete="name"
                                placeholder="ScanlanShorthalt"
                                className="rounded-lg border border-black/10 bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20 dark:border-white/10"
                            />
                            {state?.errors?.email && (
                                <p className="text-xs text-red-500">{state.errors.email[0]}</p>
                            )}
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label
                                htmlFor="email"
                                className="text-xs font-semibold uppercase tracking-wide text-foreground/ text-left"
                            >
                                Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="text"
                                autoComplete="name"
                                placeholder="scanlan@critrole.com"
                                className="rounded-lg border border-black/10 bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20 dark:border-white/10"
                            />
                            {state?.errors?.email && (
                                <p className="text-xs text-red-500">{state.errors.email[0]}</p>
                            )}
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <div className="flex items-center justify-between">
                                <label
                                    htmlFor="password"
                                    className="text-xs font-semibold uppercase tracking-wide text-foreground/70 text-left"
                                >
                                    Password
                                </label>
                            </div>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                placeholder="••••••••"
                                className="rounded-lg border border-black/10 bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20 dark:border-white/10"
                            />
                            {state?.errors?.password && (
                                <p className="text-xs text-red-500">{state.errors.password[0]}</p>
                            )}
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label
                                htmlFor="confirm-password"
                                className="text-xs font-semibold uppercase tracking-wide text-foreground/ text-left"
                            >
                                Confirm Password
                            </label>
                            <input
                                id="confirm-password"
                                name="confirm-password"
                                type="text"
                                autoComplete="name"
                                placeholder="scanlan@critrole.com"
                                className="rounded-lg border border-black/10 bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20 dark:border-white/10"
                            />
                            {state?.errors?.email && (
                                <p className="text-xs text-red-500">{state.errors.email[0]}</p>
                            )}
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label
                                htmlFor="security-stage"
                                className="text-xs font-semibold uppercase tracking-wide text-foreground/ text-left"
                            >
                                Security Stage
                            </label>
                            <select
                                id="security-stage"
                                name="security-stage"
                                defaultValue=""
                                className="rounded-lg border border-black/10 bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20 dark:border-white/10 appearance-none cursor-pointer"
                            >
                                <option value="" disabled>Select a stage…</option>
                                <option value="plain-text">Plain Text</option>
                                <option value="hashed">Hashed</option>
                                <option value="salted">Salted + Hashed</option>
                                <option value="full-security">Fully Secure</option>
                            </select>
                            {state?.errors?.email && (
                                <p className="text-xs text-red-500">{state.errors.email[0]}</p>
                            )}
                        </div>

                        {/* Action Button */}
                        <button
                            type="submit"
                            disabled={isPending}
                            className="rounded-xl bg-white px-7 py-3.5 text-sm font-semibold text-neutral-950 shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(255,255,255,0.4)] active:translate-y-0">
                            {isPending ? "Signing up…" : "Sign Up"}
                        </button>

                    </form>


                </div>
            </main>
        </>
    );
}