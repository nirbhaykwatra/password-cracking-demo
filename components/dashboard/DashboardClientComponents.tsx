'use client';

import {ReactNode, useActionState, useState, useTransition} from 'react';
import { createNewSession } from '@/app/actions/sessions';
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {PasswordPreview, StorageMode} from "@/lib/auth";
import {previewStorage, rollDemoAccounts} from "@/app/actions/demoAccounts";

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

export function RollDemoAccountsButton({ sessionCode }: { sessionCode: string }) {
    const [isPending, startTransition] = useTransition();
    const [message, setMessage] = useState<string | null>(null);

    return (
        <div className="flex items-center gap-3">
            {message && <span className="text-sm text-foreground/70">{message}</span>}
            <button
                onClick={() =>
                    startTransition(async () => {
                        const result = await rollDemoAccounts(sessionCode);
                        setMessage(result.message);
                    })
                }
                disabled={isPending}
                className="rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
            >
                {isPending ? 'Rolling…' : 'Roll Demo Accounts'}
            </button>
        </div>
    );
}

const MODE_LABELS: Record<StorageMode, string> = {
    "plain-text": "Plain Text",
    hashed: "Hashed",
    salted: "Hashed with Salt",
};

type HistoryEntry = PasswordPreview & { password: string };

export function SaltingHashingDemo() {
    const [password, setPassword] = useState("");
    const [mode, setMode] = useState<StorageMode>("plain-text");
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    function run() {
        startTransition(async () => {
            const response = await previewStorage(mode, password);
            if (!response.success) {
                setError(response.message);
                return;
            }
            setError(null);
            setHistory((prev) => [{ ...response.result, password }, ...prev].slice(0, 5));
        });
    }

    const latest = history[0];
    const fieldClass = "rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground";

    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-3xl font-bold text-primary">Salting and Hashing</h1>

            <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6 shadow-sm">
                <div className="flex flex-col gap-1">
                    <label htmlFor="password" className="text-sm text-muted">Password</label>
                    <input
                        id="password"
                        type="text"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && run()}
                        placeholder="Type a password…"
                        className={fieldClass}
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label htmlFor="mode" className="text-sm text-muted">How is it stored?</label>
                    <select id="mode" value={mode} onChange={(e) => setMode(e.target.value as StorageMode)} className={fieldClass}>
                        {Object.entries(MODE_LABELS).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                        ))}
                    </select>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={run}
                        disabled={isPending || password.length === 0}
                        className="rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
                    >
                        {isPending ? "Working…" : "Show Stored Password"}
                    </button>
                    {error && <span className="text-sm text-accent">{error}</span>}
                </div>
            </div>

            {latest && latest.mode === "salted" && latest.salt && latest.saltedPassword ? (
                <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-6 shadow-sm">
                    <p className="text-xs font-semibold tracking-wider text-muted uppercase">Salting, step by step</p>
                    <ResultRow step="1" label="Generate a short random salt" value={latest.salt} />
                    <ResultRow
                        step="2"
                        label="Put the salt in front of the password"
                        value={
                            <>
                                <span className="font-bold text-accent">{latest.saltedPassword.slice(0, latest.salt.length)}</span>
                                <span>{latest.saltedPassword.slice(latest.salt.length)}</span>
                            </>
                        }
                    />
                    <ResultRow step="3" label={`Hash the result (${latest.algorithm})`} value={latest.digest} />
                    <ResultRow label="Stored in the database (salt:hash)" value={latest.stored} />
                    <p className="text-xs text-muted">
                        The salt is stored next to the hash, so it isn&apos;t a secret. It only makes every hash unique.
                        MD5 is used here so the salt is the only difference from the &quot;Hashed&quot; option. Real systems
                        should use a slow algorithm such as bcrypt or Argon2.
                    </p>
                </div>
            ) : latest && (
                <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-6 shadow-sm">
                    <p className="text-xs font-semibold tracking-wider text-muted uppercase">What the database stores</p>
                    <ResultRow label="Algorithm" value={latest.algorithm} />
                    <ResultRow label={latest.mode === "plain-text" ? "Stored value" : "Hash"} value={latest.digest} />
                </div>
            )}

            {history.length > 1 && (
                <div className="flex flex-col gap-2 rounded-2xl border border-border bg-surface p-6 shadow-sm">
                    <p className="text-xs font-semibold tracking-wider text-muted uppercase">Recent results</p>
                    {history.map((entry, i) => (
                        <div key={i} className="grid grid-cols-[10rem_8rem_1fr] gap-3 font-mono text-xs">
                            <span className="text-muted">{MODE_LABELS[entry.mode]}</span>
                            <span className="truncate">{entry.password}</span>
                            <span className="break-all">{entry.stored}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function ResultRow({ label, value, step }: { label: string; value: ReactNode; step?: string }) {
    return (
        <div className="flex flex-col gap-1">
            <span className="text-sm text-muted">
                {step && <b className="mr-2 text-primary">Step {step}</b>}
                {label}
            </span>
            <code className="rounded-md bg-background px-3 py-2 font-mono text-sm break-all">{value}</code>
        </div>
    );
}

type Credential = { name: string; email: string; hash: string };
type Target = { slug: string; label: string; credentials: Credential[] };
type Row = Credential & { password: string | null };

const TABLE_SIZES = [100, 1000, 10000] as const;

export function RainbowTableLookup({ targets }: { targets: Target[] }) {
    const [size, setSize] = useState<number>(10000);
    const [slug, setSlug] = useState(targets[0]?.slug ?? "");
    const [table, setTable] = useState<Map<string, string> | null>(null);
    const [loadMs, setLoadMs] = useState(0);
    const [loading, setLoading] = useState(false);
    const [rows, setRows] = useState<Row[] | null>(null);
    const [lookupMs, setLookupMs] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const target = targets.find((t) => t.slug === slug);
    const cracked = rows?.filter((r) => r.password !== null).length ?? 0;
    const fieldClass = "rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground disabled:opacity-60";
    const buttonClass = "rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-50";

    async function loadTable() {
        setLoading(true);
        setError(null);
        setRows(null);
        const start = performance.now();
        try {
            const res = await fetch(`/rainbow/md5-${size}.txt`);
            if (!res.ok) throw new Error("Table file not found. Run scripts/build-rainbow-table.ts first.");
            const text = await res.text();

            // Each line is "<32-char md5>:<password>". Split by position so passwords containing ":" still work.
            const map = new Map<string, string>();
            for (const line of text.split("\n")) {
                if (line.length > 33) map.set(line.slice(0, 32), line.slice(33));
            }
            setTable(map);
            setLoadMs(performance.now() - start);
        } catch (e) {
            setTable(null);
            setError(e instanceof Error ? e.message : "Could not load the table.");
        } finally {
            setLoading(false);
        }
    }

    function runLookup() {
        if (!table || !target) return;
        const start = performance.now();
        const results = target.credentials.map((c) => ({ ...c, password: table.get(c.hash) ?? null }));
        setLookupMs(performance.now() - start);
        setRows(results);
    }

    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-3xl font-bold text-primary">Rainbow Table Lookup</h1>

            <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6 shadow-sm">
                <p className="text-sm text-muted">
                    The wordlist was hashed once, ahead of time. Cracking a leaked hash is now a table lookup, with no
                    hashing per guess.
                </p>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-muted">Leaked database</label>
                        <select
                            value={slug}
                            onChange={(e) => { setSlug(e.target.value); setRows(null); }}
                            className={fieldClass}
                        >
                            {targets.map((t) => <option key={t.slug} value={t.slug}>{t.label}</option>)}
                        </select>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-muted">Precomputed table size</label>
                        <select
                            value={size}
                            onChange={(e) => { setSize(Number(e.target.value)); setTable(null); setRows(null); }}
                            disabled={loading}
                            className={fieldClass}
                        >
                            {TABLE_SIZES.map((n) => <option key={n} value={n}>Top {n.toLocaleString()} passwords</option>)}
                        </select>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <button onClick={loadTable} disabled={loading} className={buttonClass}>
                        {loading ? "Loading…" : table ? "Reload table" : "Load table"}
                    </button>
                    <button onClick={runLookup} disabled={!table || !target || target.credentials.length === 0} className={buttonClass}>
                        Run lookup
                    </button>
                    {table && (
                        <span className="text-sm text-muted">
                            {table.size.toLocaleString()} hashes loaded in {loadMs.toFixed(0)}ms
                        </span>
                    )}
                    {error && <span className="text-sm text-accent">{error}</span>}
                </div>
            </div>

            {rows && (
                <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6 shadow-sm">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <p className="text-xs font-semibold tracking-wider text-muted uppercase">Results</p>
                        <p className="text-sm">
                            <b className="text-heading">{cracked}</b> of {rows.length} cracked in{" "}
                            <b className="text-heading">{lookupMs.toFixed(2)}ms</b>
                        </p>
                    </div>

                    <table className="w-full text-left text-sm">
                        <thead>
                        <tr className="text-muted">
                            <th className="pb-2">Name</th>
                            <th className="pb-2">Email</th>
                            <th className="pb-2">Stored hash</th>
                            <th className="pb-2">Password</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                        {rows.map((r) => (
                            <tr key={r.email}>
                                <td className="py-2 pr-3">{r.name}</td>
                                <td className="py-2 pr-3">{r.email}</td>
                                <td className="max-w-xs truncate py-2 pr-3 font-mono text-xs">{r.hash}</td>
                                <td className={`py-2 font-mono ${r.password ? "font-bold text-primary" : "text-muted"}`}>
                                    {r.password ?? "not found"}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>

                    {slug === "shopzone" && (
                        <p className="rounded-md bg-background p-3 text-sm text-muted">
                            Nothing matched, even for weak passwords like &quot;password&quot;. Each ShopZone hash was built
                            with its own random salt, so the table would need a separate entry per salt per word. A table
                            built for the plain wordlist is useless.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}

const NAV_ITEMS = [
    { label: "Database View",           href: (code: string) => `/${code}/admin/database`,       icon: "📖" },
    { label: "Password Cracking Tool",  href: (code: string) => `/${code}/admin/password-tool`,  icon: "🛠️" },
    { label: "Salting and Hashing",     href: (code: string) => `/${code}/admin/salting-hashing`, icon: "🧂" },
    { label: "Rainbow Table",           href: (code: string) => `/${code}/admin/rainbow-table`,  icon: "🌈" },
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