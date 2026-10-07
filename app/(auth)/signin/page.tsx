"use client"

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {ActionResponse, signIn} from "@/app/actions/auth";
import { GURedHeader } from "@/components/common/headers";
import { ThemeToggle } from "@/components/common/theme-toggle";
import Link from "next/link";

export default function SignInPage() {

    const router = useRouter();
    const [state, formAction, isPending] = useActionState<ActionResponse | null, FormData>(
        signIn,
        null
    );

    useEffect(() => {
        if (state?.success) {
            router.push("/dashboard");
        }
    }, [state, router]);

    return (
        <>
            <GURedHeader />
            <main className="flex min-h-screen items-center justify-center p-6 font-sans">
                {/* Sign In Box */}
                <div className="max-w-lg w-full rounded-3xl border border-white/10 bg-(--color-background)/40 p-10 text-center shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] backdrop-blur-xl">
                    <h2 className="mb-4 tracking-tight text-color-(--color-primary) md:text-5xl">
                        Instructor Sign In
                    </h2>
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
                                htmlFor="email"
                                className="text-xs font-semibold uppercase tracking-wide text-(--color-foreground) text-left"
                            >
                                Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="text"
                                autoComplete="name"
                                placeholder="scanlan@critrole.com"
                                className="rounded-lg border border-black/10 bg-background px-3.5 py-2.5 text-sm text-(--color-foreground) outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20 dark:border-white/10"
                            />
                            {state?.errors?.email && (
                                <p className="text-xs text-red-500">{state.errors.email[0]}</p>
                            )}
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <div className="flex items-center justify-between">
                                <label
                                    htmlFor="password"
                                    className="text-xs font-semibold uppercase tracking-wide text-(--color-foreground) text-left"
                                >
                                    Password
                                </label>
                                <Link
                                    href="#"
                                    className="text-xs font-semibold text-brand hover:opacity-80 text-right"
                                >
                                    Forgot?
                                </Link>
                            </div>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                placeholder="••••••••"
                                className="rounded-lg border border-black/10 bg-background px-3.5 py-2.5 text-sm text-(--color-foreground) outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20 dark:border-white/10"
                            />
                            {state?.errors?.password && (
                                <p className="text-xs text-red-500">{state.errors.password[0]}</p>
                            )}
                        </div>

                        {/* Action Button */}
                        <button
                            type="submit"
                            disabled={isPending}
                            className="rounded-xl bg-(--color-background) px-7 py-3.5 text-sm text-(--color-primary-foreground) font-semibold shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(255,255,255,0.4)] hover:bg-(--color-primary) active:translate-y-0">
                            {isPending ? "Signing in…" : "Sign In"}
                        </button>

                    </form>
                </div>

            </main>
        </>
    );
}