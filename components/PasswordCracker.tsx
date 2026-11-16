"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import type { Config } from "@/lib/store";

type WordlistMode = "dictionary" | "hybrid" | "keyspace";
const WORDLIST_SIZES = [100, 1000, 10000] as const;
type LogEntry = { guess: string; status: "fail" | "success" | "locked"; ms: number };

function* hybridMutations(words: string[]) {
    const suffixes = ["", "1", "!", "123", "2024"];
    for (const word of words) {
        for (const suffix of suffixes) {
            yield word + suffix;
            const capitalized = word.charAt(0).toUpperCase() + word.slice(1);
            if (capitalized !== word) yield capitalized + suffix;
        }
    }
}

function* keyspaceGuesses(charset: string, length: number) {
    const indices = new Array(length).fill(0);
    const total = Math.pow(charset.length, length);
    for (let i = 0; i < total; i++) {
        yield indices.map((idx) => charset[idx]).join("");
        for (let pos = length - 1; pos >= 0; pos--) {
            indices[pos]++;
            if (indices[pos] < charset.length) break;
            indices[pos] = 0;
        }
    }
}

function buildGenerator(mode: WordlistMode, words: string[], keyspaceLength: number): Generator<string> {
    if (mode === "dictionary") return (function* () { yield* words; })();
    if (mode === "hybrid") return hybridMutations(words);
    return keyspaceGuesses("abcdefghijklmnopqrstuvwxyz", keyspaceLength);
}

function estimateTotal(mode: WordlistMode, wordCount: number, keyspaceLength: number): number {
    if (mode === "dictionary") return wordCount;
    if (mode === "hybrid") return wordCount * 5 * 2;
    return Math.pow(26, keyspaceLength);
}

export default function PasswordCracker({ usernames, websites, initialConfig }: {
    usernames: { name: string; email: string }[],
    websites: { name: string; slug: string }[],
    initialConfig: Config
}) {
    const { sessionCode } = useParams<{ sessionCode: string }>();
    const [username, setUsername] = useState(usernames[0]?.email ?? "");
    const [website, setWebsite] = useState(websites[0]?.slug ?? "");
    const [mode, setMode] = useState<WordlistMode>("dictionary");
    const [wordlistSize, setWordlistSize] = useState<number>(1000);
    const [words, setWords] = useState<string[]>([]);
    const [keyspaceLength, setKeyspaceLength] = useState(3);
    const [concurrency, setConcurrency] = useState(1);

    const [rateLimit, setRateLimit] = useState(initialConfig.rateLimit);
    const [lockout, setLockout] = useState(initialConfig.lockout);

    const [running, setRunning] = useState(false);
    const [log, setLog] = useState<LogEntry[]>([]);
    const [attempts, setAttempts] = useState(0);
    const [currentGuess, setCurrentGuess] = useState("");
    const [result, setResult] = useState<"idle" | "success" | "stopped" | "exhausted">("idle");
    const [crackedPassword, setCrackedPassword] = useState<string | null>(null);
    const [elapsedMs, setElapsedMs] = useState(0);

    const stopRef = useRef(false);
    const startRef = useRef(0);
    useEffect(() => {
        let cancelled = false;
        fetch(`/wordlists/common-${wordlistSize}.txt`)
            .then((r) => (r.ok ? r.text() : ""))
            .then((text) => {
                if (!cancelled) setWords(text.split("\n").filter(Boolean));
            })
            .catch(() => {
                if (!cancelled) setWords([]);
            });
        return () => { cancelled = true; };
    }, [wordlistSize]);

    const total = useMemo(() => estimateTotal(mode, words.length, keyspaceLength), [mode, words.length, keyspaceLength]);
    const attemptsPerSec = elapsedMs > 0 ? Math.round((attempts / elapsedMs) * 1000) : 0;
    const progressPct = result === "success" ? 100 : Math.min(100, (attempts / total) * 100);

    async function pushConfig(next: Partial<{ rateLimit: boolean; lockout: boolean }>) {
        await fetch("/api/config", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionCode, ...next }),
        }).catch(() => {});
    }

    async function reset() {
        setLog([]);
        setAttempts(0);
        setCurrentGuess("");
        setResult("idle");
        setCrackedPassword(null);
        setElapsedMs(0);
        await fetch("/api/reset", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionCode }),
        }).catch(() => {});
    }

    async function attemptOne(password: string): Promise<LogEntry> {
        const start = performance.now();
        try {
            const res = await fetch(`/${sessionCode}/${website}/api/signin`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: username, password }),
            });
            const ms = Math.round(performance.now() - start);
            const data = await res.json().catch(() => ({}));
            if (res.status === 200 && data.success) return { guess: password, status: "success", ms };
            if (res.status === 429) return { guess: password, status: "locked", ms };
            return { guess: password, status: "fail", ms };
        } catch {
            return { guess: password, status: "fail", ms: Math.round(performance.now() - start) };
        }
    }

    async function run() {
        await reset();
        setRunning(true);
        stopRef.current = false;
        startRef.current = performance.now();

        const gen = buildGenerator(mode, words, keyspaceLength);
        let count = 0;
        let cracked: string | null = null;

        async function worker() {
            while (!stopRef.current && !cracked) {
                const next = gen.next();
                if (next.done) break;
                const guess = next.value;
                setCurrentGuess(guess);
                const entry = await attemptOne(guess);
                count += 1;
                setAttempts(count);
                setElapsedMs(performance.now() - startRef.current);
                setLog((prev) => (prev.length > 200 ? [...prev.slice(-199), entry] : [...prev, entry]));
                if (entry.status === "success") {
                    cracked = guess;
                }
            }
        }

        const workers = Array.from({ length: Math.max(1, concurrency) }, () => worker());
        await Promise.all(workers);

        setRunning(false);
        setCurrentGuess("");
        if (cracked) {
            setResult("success");
            setCrackedPassword(cracked);
        } else if (stopRef.current) {
            setResult("stopped");
        } else {
            setResult("exhausted");
        }
    }

    function stop() {
        stopRef.current = true;
    }

    return (
        <main className="relative min-h-screen overflow-hidden bg-background px-4 py-8 text-foreground md:px-8 md:py-12">
            {/* Decorative brand accent lights, sit behind all content */}
            <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute -top-24 -left-24 h-[32rem] w-[32rem] animate-float-pink bg-streak-pink bg-no-repeat" />
                <div className="absolute top-32 right-0 h-[28rem] w-[28rem] animate-float-purple bg-streak-purple bg-no-repeat" />
                <div className="absolute bottom-0 left-1/3 h-[28rem] w-[28rem] animate-float-cyan bg-streak-cyan bg-no-repeat" />
            </div>

            <header className="mb-8 md:mb-10">
                <h1 className="font-heading text-3xl font-extrabold text-heading md:text-4xl">
                    Password Cracking <span className="text-accent">Lab</span>
                </h1>
            </header>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="space-y-6">
                    <div className="space-y-4 rounded-xl border border-border bg-surface p-5 shadow-sm dark:shadow-none">
                        <p className="font-heading text-xs font-semibold tracking-wider text-muted uppercase">Target</p>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-muted">Endpoint</label>
                            <input
                                type="text"
                                value="/api/login (this server)"
                                disabled
                                className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground disabled:opacity-60"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-muted">Website</label>
                            <select
                                value={website}
                                onChange={(e) => setWebsite(e.target.value)}
                                disabled={running}
                                className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground disabled:opacity-60"
                            >
                                {websites.map((w) => (
                                    <option key={w.slug} value={w.slug}>
                                        {w.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-muted">Account</label>
                            <select
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                disabled={running}
                                className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground disabled:opacity-60"
                            >
                                {usernames.map((u) => (
                                    <option key={u.email} value={u.email}>
                                        {u.name} ({u.email})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-4 rounded-xl border border-border bg-surface p-5 shadow-sm dark:shadow-none">
                        <p className="font-heading text-xs font-semibold tracking-wider text-muted uppercase">Wordlist</p>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-muted">Mode</label>
                            <select
                                value={mode}
                                onChange={(e) => setMode(e.target.value as WordlistMode)}
                                disabled={running}
                                className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground disabled:opacity-60"
                            >
                                <option value="dictionary">Dictionary (common passwords)</option>
                                <option value="hybrid">Hybrid (dictionary + mutations)</option>
                                <option value="keyspace">Pure brute force (a-z keyspace)</option>
                            </select>
                        </div>
                        {mode !== "keyspace" && (
                            <div className="flex flex-col gap-1">
                                <label className="text-sm text-muted">Wordlist size ({words.length.toLocaleString()} loaded)</label>
                                <select
                                    value={wordlistSize}
                                    onChange={(e) => setWordlistSize(Number(e.target.value))}
                                    disabled={running}
                                    className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground disabled:opacity-60"
                                >
                                    {WORDLIST_SIZES.map((n) => (
                                        <option key={n} value={n}>Top {n.toLocaleString()}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                        {mode === "keyspace" && (
                            <div className="flex flex-col gap-1">
                                <label className="text-sm text-muted">
                                    Length ({Math.pow(26, keyspaceLength).toLocaleString()} combinations)
                                </label>
                                <input
                                    type="number"
                                    min={1}
                                    max={4}
                                    value={keyspaceLength}
                                    onChange={(e) => setKeyspaceLength(Number(e.target.value))}
                                    disabled={running}
                                    className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground disabled:opacity-60"
                                />
                            </div>
                        )}
                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-muted">Concurrency (parallel requests)</label>
                            <input
                                type="number"
                                min={1}
                                max={20}
                                value={concurrency}
                                onChange={(e) => setConcurrency(Number(e.target.value))}
                                disabled={running}
                                className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground disabled:opacity-60"
                            />
                        </div>
                    </div>

                    <div className="space-y-1 rounded-xl border border-border bg-surface p-5 shadow-sm dark:shadow-none">
                        <p className="mb-2 font-heading text-xs font-semibold tracking-wider text-muted uppercase">
                            Defenses (live)
                        </p>
                        <ToggleRow
                            label="Rate limiting"
                            on={rateLimit}
                            onChange={(next) => {
                                setRateLimit(next);
                                pushConfig({ rateLimit: next });
                            }}
                        />
                        <ToggleRow
                            label="Lockout after 5 fails"
                            on={lockout}
                            onChange={(next) => {
                                setLockout(next);
                                pushConfig({ lockout: next });
                            }}
                        />
                    </div>

                    <div className="flex gap-3">
                        {!running ? (
                            <button
                                onClick={run}
                                disabled={usernames.length === 0 || websites.length === 0 || (mode !== "keyspace" && words.length === 0)}
                                className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Run attack
                            </button>
                        ) : (
                            <button
                                onClick={stop}
                                className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
                            >
                                Stop
                            </button>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="space-y-5 rounded-xl border border-border bg-surface p-5 shadow-sm dark:shadow-none">
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                            <Stat label="Attempts" value={attempts.toLocaleString()} />
                            <Stat label="Per second" value={String(attemptsPerSec)} />
                            <Stat label="Elapsed" value={`${(elapsedMs / 1000).toFixed(1)}s`} />
                            <Stat label="Of keyspace" value={`${progressPct.toFixed(1)}%`} />
                        </div>

                        <div className="border-y border-border py-4 text-center">
                            <div className="font-mono text-xl break-all text-foreground">
                                {result === "success" ? crackedPassword : currentGuess || (result === "idle" ? "—" : "")}
                            </div>
                            <div className="mt-1 text-sm text-muted">
                                {result === "success" && `cracked ${username}'s password`}
                                {result === "stopped" && "stopped by user"}
                                {result === "exhausted" && "wordlist exhausted — not found"}
                                {result === "idle" && "current guess"}
                            </div>
                        </div>

                        <div className="h-2 w-full overflow-hidden rounded-full bg-border">
                            <div
                                className={`h-full transition-all duration-150 ${
                                    result === "success" ? "bg-primary" : result === "stopped" ? "bg-muted" : "bg-accent"
                                }`}
                                style={{ width: `${progressPct}%` }}
                            />
                        </div>

                        <div className="max-h-64 divide-y divide-border overflow-y-auto rounded-md border border-border font-mono text-xs">
                            {log.length === 0 && <div className="p-3 text-center text-muted">No attempts yet</div>}
                            {log
                                .slice()
                                .reverse()
                                .map((entry, i) => (
                                    <div
                                        key={i}
                                        className={`grid grid-cols-4 gap-2 px-3 py-1.5 ${
                                            entry.status === "success"
                                                ? "text-primary"
                                                : entry.status === "locked"
                                                    ? "text-accent"
                                                    : "text-muted"
                                        }`}
                                    >
                                        <span>{entry.status === "success" ? "200" : entry.status === "locked" ? "429" : "401"}</span>
                                        <span className="truncate">{entry.guess}</span>
                                        <span>{entry.ms}ms</span>
                                        <span>{entry.status}</span>
                                    </div>
                                ))}
                        </div>
                    </div>

                    <KeyspaceCalculator />
                </div>
            </div>
        </main>
    );
}

function ToggleRow({
                       label,
                       on,
                       onChange,
                   }: {
    label: string;
    on: boolean;
    onChange: (next: boolean) => void;
}) {
    return (
        <div className="flex items-center justify-between py-2">
            <span className="text-sm text-foreground">{label}</span>
            <button
                type="button"
                role="switch"
                aria-checked={on}
                onClick={() => onChange(!on)}
                className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${on ? "bg-primary" : "bg-border"}`}
            >
        <span
            className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-surface shadow transition-transform ${
                on ? "translate-x-5" : "translate-x-0"
            }`}
        />
            </button>
        </div>
    );
}

function Stat({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex flex-col items-center text-center">
            <div className="font-heading text-2xl font-bold text-heading">{value}</div>
            <div className="text-xs tracking-wide text-muted uppercase">{label}</div>
        </div>
    );
}

function KeyspaceCalculator() {
    const [length, setLength] = useState(8);
    const [charsetSize, setCharsetSize] = useState(26);
    const [guessesPerSec, setGuessesPerSec] = useState(1_000_000_000);

    const combinations = Math.pow(charsetSize, length);
    const seconds = combinations / guessesPerSec;

    function formatDuration(s: number): string {
        const units: [string, number][] = [
            ["years", 31536000], ["days", 86400], ["hours", 3600], ["minutes", 60], ["seconds", 1],
        ];
        for (const [label, size] of units) {
            if (s >= size) return `${(s / size).toLocaleString(undefined, { maximumFractionDigits: 1 })} ${label}`;
        }
        return "instant";
    }

    return (
        <div className="space-y-4 rounded-xl border border-border bg-surface p-5 shadow-sm dark:shadow-none">
            <p className="font-heading text-xs font-semibold tracking-wider text-muted uppercase">
                Keyspace calculator
            </p>
            <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                    <label className="text-sm text-muted">Password length</label>
                    <input
                        type="number"
                        min={1}
                        max={20}
                        value={length}
                        onChange={(e) => setLength(Number(e.target.value))}
                        className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-sm text-muted">Character set</label>
                    <select
                        value={charsetSize}
                        onChange={(e) => setCharsetSize(Number(e.target.value))}
                        className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                    >
                        <option value={10}>Digits only (10)</option>
                        <option value={26}>Lowercase letters (26)</option>
                        <option value={52}>Upper + lowercase (52)</option>
                        <option value={62}>Alphanumeric (62)</option>
                        <option value={94}>All printable ASCII (94)</option>
                    </select>
                </div>
            </div>
            <div className="flex flex-col gap-1">
                <label className="text-sm text-muted">Attacker speed (guesses/sec)</label>
                <select
                    value={guessesPerSec}
                    onChange={(e) => setGuessesPerSec(Number(e.target.value))}
                    className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                >
                    <option value={10}>10 &mdash; naive online login form</option>
                    <option value={1000}>1,000 &mdash; unthrottled online form</option>
                    <option value={1_000_000}>1,000,000 &mdash; offline, unsalted MD5</option>
                    <option value={1_000_000_000}>1,000,000,000 &mdash; offline, GPU cluster</option>
                </select>
            </div>
            <div className="space-y-1 border-t border-border pt-3 text-sm text-foreground">
                <div>
                    Total combinations: <b className="font-heading text-heading">{combinations.toExponential(2)}</b>
                </div>
                <div>
                    Estimated time to exhaust: <b className="font-heading text-heading">{formatDuration(seconds)}</b>
                </div>
            </div>
        </div>
    );
}