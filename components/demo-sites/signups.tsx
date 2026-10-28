"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function FlixWatchSignup() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        router.push("/flixwatch/dashboard");
    }

    const input =
        "peer w-full rounded bg-[#333] px-4 pb-2 pt-6 text-base text-white outline-none ring-0 focus:bg-[#454545]";
    const label =
        "pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8c8c8c] transition-all peer-focus:top-3.5 peer-focus:text-xs peer-[:not(:placeholder-shown)]:top-3.5 peer-[:not(:placeholder-shown)]:text-xs";

    const plans = [
        { name: "Standard", price: "11.99", quality: "Full HD", screens: "2 screens at once" },
        { name: "Premium", price: "16.99", quality: "4K Ultra HD", screens: "4 screens at once" },
    ];

    return (
        <div className="flex min-h-screen flex-col bg-black text-white">
            <div className="relative flex flex-1 flex-col bg-[radial-gradient(ellipse_at_top,#3a0a0e_0%,#000_70%)]">
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60" />

                <header className="relative z-10 px-6 py-5 md:px-14">
                    <span className="text-3xl font-extrabold uppercase tracking-tight text-[#e50914] md:text-4xl">FlixWatch</span>
                </header>

                <main className="relative z-10 flex flex-1 items-start justify-center px-4 pb-16 md:items-center">
                    <form
                        onSubmit={handleSubmit}
                        className="w-full max-w-[450px] rounded bg-black/75 px-8 py-10 md:px-16 md:py-14"
                    >
                        <h1 className="mb-2 text-[32px] font-bold">Create a password to start your membership</h1>
                        <p className="mb-6 text-sm text-[#b3b3b3]">Just a few more steps and you&apos;re done!</p>

                        <div className="relative mb-4">
                            <input
                                id="email"
                                type="email"
                                required
                                placeholder=" "
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={input}
                            />
                            <label htmlFor="email" className={label}>Email</label>
                        </div>

                        <div className="relative mb-6">
                            <input
                                id="password"
                                type="password"
                                required
                                placeholder=" "
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={input}
                            />
                            <label htmlFor="password" className={label}>Add a password</label>
                        </div>

                        <div className="mb-6 space-y-3">
                            {plans.map((p) => (
                                <label
                                    key={p.name}
                                    className="flex cursor-pointer items-center justify-between rounded border border-[#333] px-4 py-3 text-sm hover:border-[#8c8c8c]"
                                >
                  <span className="flex items-center gap-3">
                    <input type="radio" name="plan" defaultChecked={p.name === "Premium"} className="h-4 w-4 accent-[#e50914]" />
                    <span>
                      <span className="block font-semibold">{p.name} — ${p.price}/mo</span>
                      <span className="block text-xs text-[#8c8c8c]">{p.quality} · {p.screens}</span>
                    </span>
                  </span>
                                </label>
                            ))}
                        </div>

                        <button
                            type="submit"
                            className="w-full rounded bg-[#e50914] py-3 font-semibold hover:bg-[#c11119]"
                        >
                            Next
                        </button>

                        <p className="mt-6 text-xs text-[#8c8c8c]">
                            This page is a fictional demo and is not a real sign-up flow. Don&apos;t enter real information.
                        </p>

                        <p className="mt-8 text-[#b3b3b3]">
                            Already have an account? <a href="/flixwatch/login" className="text-white hover:underline">Sign in.</a>
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

export function FMailSignup() {
    const router = useRouter();
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        router.push("/fmail/dashboard");
    }

    const field =
        "w-full rounded border border-[#747775] px-3.5 py-3 text-base text-[#1f1f1f] outline-none focus:border-2 focus:border-[#0b57d0] focus:px-[13px] focus:py-[11px]";

    return (
        <div className="flex min-h-screen flex-col bg-[#f0f4f9] text-[#1f1f1f]">
            <main className="flex flex-1 items-center justify-center px-3 py-8">
                <div className="w-full max-w-[520px] rounded-[28px] bg-white p-8 sm:p-9 md:p-12">
                    <div className="mb-6 flex items-center gap-1 text-3xl font-medium">
                        <span className="text-[#ea4335]">✉</span>
                        <span className="text-[#444746]">FMail</span>
                    </div>
                    <h1 className="text-[28px] font-normal leading-9">Create your FMail Account</h1>
                    <p className="mt-1 text-sm text-[#444746]">Enter your name to get started</p>

                    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <input
                                type="text"
                                required
                                placeholder="First name"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                className={field}
                            />
                            <input
                                type="text"
                                placeholder="Last name"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                className={field}
                            />
                        </div>

                        <div className="flex overflow-hidden rounded border border-[#747775] focus-within:border-2 focus-within:border-[#0b57d0]">
                            <input
                                type="text"
                                required
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="min-w-0 flex-1 px-3.5 py-3 text-base outline-none"
                            />
                            <span className="flex items-center bg-[#f0f4f9] px-3 text-sm text-[#444746]">@fmail-demo.test</span>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <input
                                type="password"
                                required
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={field}
                            />
                            <input
                                type="password"
                                required
                                placeholder="Confirm"
                                value={confirm}
                                onChange={(e) => setConfirm(e.target.value)}
                                className={field}
                            />
                        </div>
                        <p className="text-xs text-[#444746]">Use 8 or more characters with a mix of letters, numbers &amp; symbols.</p>

                        <p className="pt-2 text-sm leading-5 text-[#444746]">
                            This is a fictional demo sign-up. Don&apos;t enter a real name, email, or password. <a href="#" className="font-medium text-[#0b57d0]">Learn more</a>
                        </p>

                        <div className="flex items-center justify-between pt-4">
                            <a href="/fmail/login" className="rounded px-2 py-2 text-sm font-medium text-[#0b57d0] hover:bg-[#f0f4f9]">
                                Sign in instead
                            </a>
                            <button
                                type="submit"
                                className="rounded-full bg-[#0b57d0] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#0a4cb8] hover:shadow"
                            >
                                Next
                            </button>
                        </div>
                    </form>
                </div>
            </main>

            <footer className="mx-auto flex w-full max-w-[520px] items-center justify-between px-6 pb-6 text-xs text-[#444746]">
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

export function ShopZoneSignup() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        router.push("/shopzone/dashboard");
    }

    const input =
        "mt-1 w-full rounded-[3px] border border-[#a6a6a6] border-t-[#949494] px-2.5 py-1.5 text-sm outline-none focus:border-[#e77600] focus:shadow-[0_0_3px_2px_rgba(228,121,17,0.5)]";

    return (
        <div className="flex min-h-screen flex-col bg-white text-[#0f1111]">
            <main className="flex flex-1 flex-col items-center px-4 pt-8 pb-10">
                <div className="mb-4 text-4xl font-bold tracking-tight">
                    shop<span className="text-[#ff9900]">zone</span>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="w-full max-w-[350px] space-y-4 rounded-lg border border-[#ddd] p-5"
                >
                    <h1 className="text-[28px] font-normal leading-tight">Create account</h1>

                    <label className="block text-[13px] font-bold">
                        Your name
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className={input}
                        />
                    </label>

                    <label className="block text-[13px] font-bold">
                        Email
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={input}
                        />
                    </label>

                    <label className="block text-[13px] font-bold">
                        Password
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={input}
                        />
                        <span className="mt-1 block text-xs font-normal text-[#565959]">At least 6 characters</span>
                    </label>

                    <label className="block text-[13px] font-bold">
                        Re-enter password
                        <input
                            type="password"
                            required
                            value={confirm}
                            onChange={(e) => setConfirm(e.target.value)}
                            className={input}
                        />
                    </label>

                    <button
                        type="submit"
                        className="w-full rounded-lg border border-[#fcd200] bg-[#ffd814] py-1.5 text-[13px] shadow-sm hover:bg-[#f7ca00]"
                    >
                        Create your ShopZone account
                    </button>

                    <p className="text-xs leading-5 text-[#565959]">
                        By creating an account, you agree to ShopZone&apos;s Conditions of Use and Privacy Notice. This is a
                        fictional demo — don&apos;t enter real information.
                    </p>
                </form>

                <div className="mt-5 w-full max-w-[350px]">
                    <div className="mb-3 flex items-center gap-2 text-xs text-[#767676]">
                        <span className="h-px flex-1 bg-[#e7e7e7]" />
                        Already have an account?
                        <span className="h-px flex-1 bg-[#e7e7e7]" />
                    </div>
                    <a
                        href="/shopzone/login"
                        className="block w-full rounded-lg border border-[#d5d9d9] bg-gradient-to-b from-[#f7fafa] to-[#e7eaea] py-1.5 text-center text-[13px] shadow-sm hover:from-[#e7eaea]"
                    >
                        Sign in instead
                    </a>
                </div>
            </main>

            <footer className="mt-auto border-t border-[#ddd] bg-gradient-to-b from-[#f7f7f7] to-white py-6 text-center text-xs text-[#555]">
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


