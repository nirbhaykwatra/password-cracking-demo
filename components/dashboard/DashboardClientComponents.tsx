'use client';

import { useActionState, useState, useTransition } from 'react';
import { createNewSession } from '@/app/actions/sessions';
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export function NewSessionButton(){
    const [state, formAction] = useActionState(
        createNewSession,
        null
    );

    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    return (
        <form action={formAction}>
            <button
                onClick={() => startTransition(() => router.refresh())}
                type="submit"
                className="rounded-2xl bg-brand px-4 py-2 text-sm font-semibold text-primary-foreground bg-primary transition hover:opacity-90"
            >
                New Session
            </button>
        </form>
    )
}

export function RefreshButton() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    return (
        <button
            onClick={() => startTransition(() => router.refresh())}
            disabled={isPending}
            className="rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
        >
            {isPending ? 'Refreshing…' : 'Refresh'}
        </button>
    );
}

export function InstructorLoginButton() {
    const router = useRouter();
    return (
        <button onClick={() => router.push(`/signin`)} className="absolute top-4 right-4 rounded-2xl bg-brand px-4 py-2 text-sm font-semibold text-primary-foreground bg-primary transition hover:opacity-90">Instructor Login</button>
    );
}
const NAV_ITEMS = [
    { label: "Database View",           href: (code: string) => `/${code}/admin/database`,       icon: "📖" },
    { label: "Password Cracking Tool",  href: (code: string) => `/${code}/admin/password-tool`,  icon: "🛠️" },
    { label: "Back to Dashboard",       href: (code: string) => `/dashboard`,                    icon: "🔙" },
];

export function Sidebar({ sessionCode }: { sessionCode: string }) {
    const [collapsed, setCollapsed] = useState(false);
    const pathname = usePathname();

    const navLinks = NAV_ITEMS.map(({ label, href, icon }) => {
        const to = href(sessionCode);
        const isActive = pathname === to;
        return { label, to, icon, isActive };
    });

    return (
        <>
            {/* ── Desktop sidebar (md+) ── */}
            <aside
                className={`
                    hidden md:flex flex-col gap-2 border-r border-foreground/10
                    bg-background/50 backdrop-blur-md transition-all duration-300 py-3
                    overflow-y-auto
                    ${collapsed ? "w-28" : "w-64"}
                `}
            >
                <nav className="flex flex-col gap-1 px-2">
                    {navLinks.map(({ label, to, icon, isActive }) => (
                        <Link
                            key={label}
                            href={to}
                            className={`
                                flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition-all
                                ${isActive ? "bg-foreground/10 text-primary" : "text-foreground/70 hover:bg-foreground/5"}
                                ${collapsed ? "justify-center py-4" : "gap-3 px-3 py-4"}
                            `}
                        >
                            <span className="shrink-0 text-3xl">{icon}</span>
                            {!collapsed && <span className="truncate">{label}</span>}
                        </Link>
                    ))}
                </nav>
                <button
                    onClick={() => setCollapsed(c => !c)}
                    className="self-center mt-auto m-3 rounded-full p-1.5 text-foreground/60 hover:bg-black/10 dark:hover:bg-white/10 transition"
                    aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    <svg width="auto" height="24" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="overflow-visible">
                        <line x1="2" y1="4" x2="16" y2="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="origin-center transition-all duration-300" style={{ transform: !collapsed ? "translate(0px, 5px) rotate(45deg)" : "translate(0, 0) rotate(0deg)", transformOrigin: "9px 4px" }} />
                        <line x1="2" y1="9" x2="16" y2="9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="transition-all duration-300" style={{ opacity: !collapsed ? 0 : 1 }} />
                        <line x1="2" y1="14" x2="16" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="origin-center transition-all duration-300" style={{ transform: !collapsed ? "translate(0px, -5px) rotate(-45deg)" : "translate(0, 0) rotate(0deg)", transformOrigin: "9px 14px" }} />
                    </svg>
                </button>
            </aside>

            {/* ── Mobile bottom nav (< md) ── */}
            <nav className="md:hidden flex items-center justify-around border-t border-black/10 bg-background/80 backdrop-blur-md overflow-x-auto">
                {navLinks.map(({ label, to, icon, isActive }) => (
                    <Link
                        key={label}
                        href={to}
                        className={`
                            flex flex-col items-center gap-0.5 px-3 py-2 text-xs font-semibold transition shrink-0
                            ${isActive ? "text-brand" : "text-foreground/60 hover:text-foreground"}
                        `}
                    >
                        <span className="text-2xl">{icon}</span>
                        <span className="text-[10px]">{label}</span>
                    </Link>
                ))}
            </nav>
        </>
    );
}