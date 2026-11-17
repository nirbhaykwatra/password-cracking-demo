"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import type { Config } from "@/lib/store";

type WordlistMode = "dictionary" | "hybrid" | "keyspace" | "rules";
const WORDLIST_SIZES = [100, 1000, 10000] as const;
type LogEntry = { guess: string; status: "fail" | "success" | "locked"; ms: number };
type RulePattern = "xkcd4" | "xkcd4-sep" | "word-digits" | "word-year" | "leet-word";

const RULE_LABELS: Record<RulePattern, string> = {
    xkcd4: "correcthorsebatterystaple (4 words, no separators)",
    "xkcd4-sep": "correct-horse-battery-staple (4 words, hyphen-separated)",
    "word-digits": "word + 2-4 digits (e.g. tiger482)",
    "word-year": "Word + birth/grad year (e.g. Tiger2008)",
    "leet-word": "l33tspeak word (e.g. p@ssw0rd)",
};

function* capitalizeVariants(word: string) {
    yield word;
    const capitalized = word.charAt(0).toUpperCase() + word.slice(1);
    if (capitalized !== word) yield capitalized;
}

// correcthorsebatterystaple-style: every 4-word combination from a small vocabulary.
// Capped to a manageable vocabulary slice so the keyspace stays demo-sized.
function* xkcdGuesses(words: string[], separator: string, vocabSize: number) {
    const vocab = words.slice(0, vocabSize);
    for (const a of vocab) for (const b of vocab) for (const c of vocab) for (const d of vocab) {
        yield [a, b, c, d].join(separator);
    }
}

function* wordDigitsGuesses(words: string[], digitLength: number) {
    const max = Math.pow(10, digitLength);
    for (const word of words) {
        for (let n = 0; n < max; n++) {
            yield word + String(n).padStart(digitLength, "0");
        }
    }
}

function* wordYearGuesses(words: string[], startYear: number, endYear: number) {
    for (const word of words) {
        for (const variant of capitalizeVariants(word)) {
            for (let year = startYear; year <= endYear; year++) {
                yield variant + year;
            }
        }
    }
}

const LEET_MAP: Record<string, string[]> = {
    a: ["a", "4", "@"], e: ["e", "3"], i: ["i", "1", "!"],
    o: ["o", "0"], s: ["s", "5", "$"], t: ["t", "7"],
};

// Every combination of leet substitutions for one word, e.g. "password" -> "p@ssw0rd"
function* leetVariants(word: string): Generator<string> {
    const options = word.toLowerCase().split("").map((ch) => LEET_MAP[ch] ?? [ch]);
    const indices = new Array(options.length).fill(0);
    while (true) {
        yield indices.map((idx, pos) => options[pos][idx]).join("");
        let pos = options.length - 1;
        while (pos >= 0) {
            indices[pos]++;
            if (indices[pos] < options[pos].length) break;
            indices[pos] = 0;
            pos--;
        }
        if (pos < 0) break;
    }
}

function* leetWordGuesses(words: string[]) {
    for (const word of words) yield* leetVariants(word);
}

function buildRuleGenerator(pattern: RulePattern, words: string[], xkcdVocab: number): Generator<string> {
    switch (pattern) {
        case "xkcd4": return xkcdGuesses(words, "", xkcdVocab);
        case "xkcd4-sep": return xkcdGuesses(words, "-", xkcdVocab);
        case "word-digits": return wordDigitsGuesses(words, 3);
        case "word-year": return wordYearGuesses(words, 1960, 2026);
        case "leet-word": return leetWordGuesses(words);
    }
}

function estimateRuleTotal(pattern: RulePattern, wordCount: number, xkcdVocab: number): number {
    switch (pattern) {
        case "xkcd4": case "xkcd4-sep": return Math.pow(Math.min(wordCount, xkcdVocab), 4);
        case "word-digits": return wordCount * 1000;
        case "word-year": return wordCount * 2 * (2026 - 1960 + 1);
        case "leet-word": return wordCount * 8; // rough: most words have a few substitutable letters
    }
}

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

function buildGenerator(mode: WordlistMode, words: string[], keyspaceLength: number, rulePattern: RulePattern, xkcdVocab: number): Generator<string> {
    if (mode === "dictionary") return (function* () { yield* words; })();
    if (mode === "hybrid") return hybridMutations(words);
    if (mode === "rules") return buildRuleGenerator(rulePattern, words, xkcdVocab);
    return keyspaceGuesses("abcdefghijklmnopqrstuvwxyz", keyspaceLength);
}

function estimateTotal(mode: WordlistMode, wordCount: number, keyspaceLength: number, rulePattern: RulePattern, xkcdVocab: number): number {
    if (mode === "dictionary") return wordCount;
    if (mode === "hybrid") return wordCount * 5 * 2;
    if (mode === "rules") return estimateRuleTotal(rulePattern, wordCount, xkcdVocab);
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
    const [englishWords, setEnglishWords] = useState<string[]>([]);
    const [keyspaceLength, setKeyspaceLength] = useState(3);
    const [rulePattern, setRulePattern] = useState<RulePattern>("word-year");
    const [xkcdVocab, setXkcdVocab] = useState(6);
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

    // xkcd-style patterns draw from plain English words, not common-password frequency — that's the point of the demo
    useEffect(() => {
        if (mode !== "rules" || (rulePattern !== "xkcd4" && rulePattern !== "xkcd4-sep")) return;
        let cancelled = false;
        fetch(`/wordlists/english-${wordlistSize}.txt`)
            .then((r) => (r.ok ? r.text() : ""))
            .then((text) => {
                if (!cancelled) setEnglishWords(text.split("\n").filter(Boolean));
            })
            .catch(() => {
                if (!cancelled) setEnglishWords([]);
            });
        return () => { cancelled = true; };
    }, [mode, rulePattern, wordlistSize]);

    const sourceWords = mode === "rules" && (rulePattern === "xkcd4" || rulePattern === "xkcd4-sep") ? englishWords : words;

    const total = useMemo(
        () => estimateTotal(mode, sourceWords.length, keyspaceLength, rulePattern, xkcdVocab),
        [mode, sourceWords.length, keyspaceLength, rulePattern, xkcdVocab]
    );
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

        const gen = buildGenerator(mode, sourceWords, keyspaceLength, rulePattern, xkcdVocab);
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
                                <option value="rules">Rules (patterns like xkcd 936)</option>
                                <option value="keyspace">Pure brute force (a-z keyspace)</option>
                            </select>
                        </div>
                        {(mode === "dictionary" || mode === "hybrid" || mode === "rules") && (
                            <div className="flex flex-col gap-1">
                                <label className="text-sm text-muted">
                                    {mode === "rules" && (rulePattern === "xkcd4" || rulePattern === "xkcd4-sep")
                                        ? `English word list size (${englishWords.length.toLocaleString()} loaded)`
                                        : `Wordlist size (${words.length.toLocaleString()} loaded)`}
                                </label>
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
                        {mode === "rules" && (
                            <div className="flex flex-col gap-1">
                                <label className="text-sm text-muted">Pattern</label>
                                <select
                                    value={rulePattern}
                                    onChange={(e) => setRulePattern(e.target.value as RulePattern)}
                                    disabled={running}
                                    className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground disabled:opacity-60"
                                >
                                    {Object.entries(RULE_LABELS).map(([value, label]) => (
                                        <option key={value} value={value}>{label}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                        {mode === "rules" && (rulePattern === "xkcd4" || rulePattern === "xkcd4-sep") && (
                            <div className="flex flex-col gap-1">
                                <label className="text-sm text-muted">
                                    Vocabulary size ({Math.pow(Math.min(words.length, xkcdVocab), 4).toLocaleString()} combinations)
                                </label>
                                <input
                                    type="number"
                                    min={2}
                                    max={10}
                                    value={xkcdVocab}
                                    onChange={(e) => setXkcdVocab(Number(e.target.value))}
                                    disabled={running}
                                    className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground disabled:opacity-60"
                                />
                                <p className="text-xs text-muted">
                                    A real xkcd-style attack uses a full dictionary (thousands of words). This slider
                                    keeps the demo&apos;s runtime reasonable — lower it to crack faster on stage.
                                </p>
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
                                disabled={usernames.length === 0 || websites.length === 0 || (mode !== "keyspace" && sourceWords.length === 0)}
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