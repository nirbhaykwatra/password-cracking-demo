"use client"

import {useActionState, useEffect, useState} from "react";
import { useRouter } from "next/navigation";
import { ActionResponse, signInFlixWatch, signInFMail, signInShopZone } from "@/app/actions/auth";

//region Demo Sites

//region FlixWatch

export function FlixWatchLogin() {
    const router = useRouter();
    const [state, formAction, isPending] = useActionState<ActionResponse | null, FormData>(
        signInFlixWatch,
        null
    );

    useEffect(() => {
        if (state?.success) {
            router.push("/dashboard");
        }
    }, [state, router]);

    return (
        <div className="flex min-h-screen flex-col bg-black text-white">
            <div className="relative flex flex-1 flex-col bg-[radial-gradient(ellipse_at_top,#3a0a0e_0%,#000_70%)]">
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60" />

                <header className="relative z-10 px-6 py-5 md:px-14">
                    <span className="text-3xl font-extrabold uppercase tracking-tight text-[#e50914] md:text-4xl">FlixWatch</span>
                </header>

                <main className="relative z-10 flex flex-1 items-start justify-center px-4 pb-16 md:items-center">
                    <form
                        action={formAction}
                        className="w-full max-w-[450px] rounded bg-black/75 px-8 py-10 md:px-16 md:py-14"
                    >
                        <h1 className="mb-7 text-[32px] font-bold">Sign In</h1>

                        <div className="relative mb-4">
                            <input
                                id="email"
                                type="email"
                                required
                                placeholder=" "
                                className="peer w-full rounded bg-[#333] px-4 pb-2 pt-6 text-base text-white outline-none ring-0 focus:bg-[#454545]"
                            />
                            <label htmlFor="email" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8c8c8c] transition-all peer-focus:top-3.5 peer-focus:text-xs peer-[:not(:placeholder-shown)]:top-3.5 peer-[:not(:placeholder-shown)]:text-xs">Email or mobile number</label>
                        </div>

                        <div className="relative mb-6">
                            <input
                                id="password"
                                type="password"
                                required
                                placeholder=" "
                                className="peer w-full rounded bg-[#333] px-4 pb-2 pt-6 text-base text-white outline-none ring-0 focus:bg-[#454545]"
                            />
                            <label htmlFor="password" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8c8c8c] transition-all peer-focus:top-3.5 peer-focus:text-xs peer-[:not(:placeholder-shown)]:top-3.5 peer-[:not(:placeholder-shown)]:text-xs">Password</label>
                        </div>

                        <button
                            type="submit"
                            className="w-full rounded bg-[#e50914] py-3 font-semibold hover:bg-[#c11119]"
                        >
                            Sign In
                        </button>

                        <div className="my-3 text-center text-[#b3b3b3]">OR</div>
                        <button
                            type="button"
                            className="w-full rounded bg-white/20 py-3 font-semibold hover:bg-white/30"
                        >
                            Use a Sign-In Code
                        </button>

                        <a href="#" className="mt-4 block text-center text-sm hover:underline">Forgot password?</a>

                        <label className="mt-4 flex items-center gap-2 text-sm text-[#b3b3b3]">
                            <input type="checkbox" defaultChecked className="h-4 w-4 accent-[#b3b3b3]" /> Remember me
                        </label>

                        <p className="mt-8 text-[#b3b3b3]">
                            New to FlixWatch? <a href="#" className="text-white hover:underline">Sign up now.</a>
                        </p>
                        <p className="mt-3 text-xs text-[#8c8c8c]">
                            This page is a fictional demo and is not protected by any real verification.
                        </p>
                    </form>
                </main>

                <footer className="relative z-10 bg-black/75 px-6 py-8 text-sm text-[#737373] md:px-14">
                    <p className="mb-3">Questions? Call 1-800-000-0000 (fictional)</p>
                    <div className="grid max-w-xl grid-cols-2 gap-3 sm:grid-cols-4">
                        {["FAQ", "Help Centre", "Terms of Use", "Privacy"].map((t) => (
                            <a key={t} href="#" className="underline">{t}</a>
                        ))}
                    </div>
                </footer>
            </div>
        </div>
    );
}

//endregion

//region FMail

export function FMailLogin() {
    const router = useRouter();
    const [step, setStep] = useState<"email" | "password">("email");
    const [email, setEmail] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [state, formAction, isPending] = useActionState<ActionResponse | null, FormData>(
        signInFMail,
        null
    );

    // Advance to the dashboard only once the server action reports success —
    // not on every render, and not before the password has been submitted.
    useEffect(() => {
        if (state?.success) {
            router.push("/fmail/dashboard");
        }
    }, [state, router]);

    function handleEmailSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!email) return;
        setStep("password");
    }

    return (
        <div className="flex min-h-screen flex-col bg-[#f0f4f9] text-[#1f1f1f]">
            <main className="flex flex-1 items-center justify-center px-3 py-8">
                <div className="grid w-full max-w-[1040px] gap-8 rounded-[28px] bg-white p-8 sm:p-9 md:grid-cols-2 md:gap-16 md:p-12">
                    <div>
                        <div className="mb-6 flex items-center gap-1 text-3xl font-medium">
                            <span className="text-[#ea4335]">✉</span>
                            <span className="text-[#444746]">FMail</span>
                        </div>
                        <h1 className="text-[32px] font-normal leading-10 md:text-[36px]">
                            {step === "email" ? "Sign in" : "Welcome"}
                        </h1>
                        {step === "email" ? (
                            <p className="mt-2 text-base">to continue to FMail</p>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setStep("email")}
                                className="mt-3 inline-flex items-center gap-2 rounded-full border border-[#747775] px-3 py-1 text-sm hover:bg-[#f0f4f9]"
                            >
                <span className="grid h-5 w-5 place-items-center rounded-full bg-[#0b57d0] text-xs text-white">
                  {email.charAt(0).toUpperCase() || "?"}
                </span>
                                {email}
                                <span className="text-xs">▾</span>
                            </button>
                        )}
                    </div>

                    {step === "email" ? (
                        // Step 1 is pure client-side UI state — nothing to send to the
                        // server until we actually have a password to check.
                        <form onSubmit={handleEmailSubmit} className="flex flex-col justify-between md:pt-3">
                            <div>
                                <input
                                    type="email"
                                    required
                                    autoFocus
                                    placeholder="Email or phone"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full rounded border border-[#747775] px-3.5 py-3.5 text-base text-[#1f1f1f] outline-none focus:border-2 focus:border-[#0b57d0] focus:px-[13px] focus:py-[13px]"
                                />
                                <a href="#" className="mt-2 inline-block text-sm font-medium text-[#0b57d0] hover:bg-[#f0f4f9] hover:underline">
                                    Forgot email?
                                </a>

                                <p className="mt-10 text-sm leading-5 text-[#444746]">
                                    This is a fictional demo. Don&apos;t enter a real email or password.{" "}
                                    <a href="#" className="font-medium text-[#0b57d0]">Learn more</a>
                                </p>
                            </div>

                            <div className="mt-10 flex items-center justify-between">
                                <a href="/fmail/signup" className="rounded px-2 py-2 text-sm font-medium text-[#0b57d0] hover:bg-[#f0f4f9]">
                                    Create account
                                </a>
                                <button
                                    type="submit"
                                    className="rounded-full bg-[#0b57d0] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#0a4cb8] hover:shadow"
                                >
                                    Next
                                </button>
                            </div>
                        </form>
                    ) : (
                        // Step 2 is the real Server Action submission.
                        <form action={formAction} className="flex flex-col justify-between md:pt-3">
                            <div>
                                <input type="hidden" name="email" value={email} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    required
                                    autoFocus
                                    placeholder="Enter your password"
                                    className="w-full rounded border border-[#747775] px-3.5 py-3.5 text-base text-[#1f1f1f] outline-none focus:border-2 focus:border-[#0b57d0] focus:px-[13px] focus:py-[13px]"
                                />
                                <label className="mt-3 flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={showPassword}
                                        onChange={(e) => setShowPassword(e.target.checked)}
                                        className="h-4 w-4 accent-[#0b57d0]"
                                    />
                                    Show password
                                </label>

                                {state?.error && (
                                    <p className="mt-3 text-sm text-[#b3261e]">{state.error}</p>
                                )}

                                <p className="mt-10 text-sm leading-5 text-[#444746]">
                                    This is a fictional demo. Don&apos;t enter a real email or password.{" "}
                                    <a href="#" className="font-medium text-[#0b57d0]">Learn more</a>
                                </p>
                            </div>

                            <div className="mt-10 flex items-center justify-between">
                                <a href="/fmail/signup" className="rounded px-2 py-2 text-sm font-medium text-[#0b57d0] hover:bg-[#f0f4f9]">
                                    Create account
                                </a>
                                <button
                                    type="submit"
                                    disabled={isPending}
                                    className="rounded-full bg-[#0b57d0] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#0a4cb8] hover:shadow disabled:opacity-60"
                                >
                                    {isPending ? "Signing in…" : "Next"}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </main>

            <footer className="mx-auto flex w-full max-w-[1040px] items-center justify-between px-6 pb-6 text-xs text-[#444746]">
                <span>English (Canada) ▾</span>
                <div className="flex gap-6">
                    <a href="#" className="hover:underline">Help</a>
                    <a href="#" className="hover:underline">Privacy</a>
                    <a href="#" className="hover:underline">Terms</a>
                </div>
            </footer>
        </div>
    );
}

//endregion

//region ShopZone

export function ShopZoneLogin() {
    const router = useRouter();
    const [state, formAction, isPending] = useActionState<ActionResponse | null, FormData>(
        signInShopZone,
        null
    );

    useEffect(() => {
        if (state?.success) {
            router.push("/dashboard");
        }
    }, [state, router]);

    return (
        <div className="flex min-h-screen flex-col bg-white text-[#0f1111]">
            <main className="flex flex-1 flex-col items-center px-4 pt-8">
                <div className="mb-4 text-4xl font-bold tracking-tight">
                    shop<span className="text-[#ff9900]">zone</span>
                </div>

                <form
                    action={formAction}
                    className="w-full max-w-[350px] space-y-4 rounded-lg border border-[#ddd] p-5"
                >
                    <h1 className="text-[28px] font-normal leading-tight">Sign in</h1>

                    <label className="block text-[13px] font-bold">
                        Email
                        <input
                            id="username"
                            name="username"
                            type="text"
                            autoComplete="email"
                            placeholder="scanlan@critrole.com"
                            className="mt-1 w-full rounded-[3px] border border-[#a6a6a6] border-t-[#949494] px-2.5 py-1.5 text-sm outline-none focus:border-[#e77600] focus:shadow-[0_0_3px_2px_rgba(228,121,17,0.5)]"
                        />
                    </label>

                    <label className="block text-[13px] font-bold">
            <span className="flex items-baseline justify-between">
              Password
              <a href="#" className="text-xs font-normal text-[#007185] hover:text-[#c7511f] hover:underline">
                Forgot password?
              </a>
            </span>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            placeholder="••••••••"
                            className="mt-1 w-full rounded-[3px] border border-[#a6a6a6] border-t-[#949494] px-2.5 py-1.5 text-sm outline-none focus:border-[#e77600] focus:shadow-[0_0_3px_2px_rgba(228,121,17,0.5)]"
                        />
                    </label>

                    <button
                        type="submit"
                        className="w-full rounded-lg border border-[#fcd200] bg-[#ffd814] py-1.5 text-[13px] shadow-sm hover:bg-[#f7ca00]"
                    >
                        Sign in
                    </button>

                    <label className="flex items-center gap-2 text-[13px]">
                        <input type="checkbox" /> Keep me signed in
                    </label>
                </form>

                <div className="mt-5 w-full max-w-[350px]">
                    <div className="mb-3 flex items-center gap-2 text-xs text-[#767676]">
                        <span className="h-px flex-1 bg-[#e7e7e7]" />
                        New to ShopZone?
                        <span className="h-px flex-1 bg-[#e7e7e7]" />
                    </div>
                    <button className="w-full rounded-lg border border-[#d5d9d9] bg-gradient-to-b from-[#f7fafa] to-[#e7eaea] py-1.5 text-[13px] shadow-sm hover:from-[#e7eaea]">
                        Create your ShopZone account
                    </button>
                </div>
            </main>

            <footer className="mt-10 border-t border-[#ddd] bg-gradient-to-b from-[#f7f7f7] to-white py-6 text-center text-xs text-[#555]">
                <div className="mb-2 flex justify-center gap-6 text-[#007185]">
                    <a href="#" className="hover:underline">Conditions of Use</a>
                    <a href="#" className="hover:underline">Privacy Notice</a>
                    <a href="#" className="hover:underline">Help</a>
                </div>
                © 2026 ShopZone (fictional demo)
            </footer>
        </div>
    );
}


//endregion