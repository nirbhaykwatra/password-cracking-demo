import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { RegExpMatcher, englishDataset, englishRecommendedTransformers } from "obscenity";

const DEFAULT_SOURCE =
    "https://raw.githubusercontent.com/danielmiessler/SecLists/master/Passwords/Common-Credentials/10k-most-common.txt";
const BLOCKLIST_FILE = path.join("scripts", "blocklist.txt");
const OUT_DIR = path.join("public", "wordlists");
const REVIEW_DIR = path.join("scripts", ".wordlist-build");
const SLICES = [100, 1000, 10000];
const MAX_LENGTH = 24;

const LEET: Record<string, string> = {
    "0": "o", "3": "e", "4": "a", "5": "s", "7": "t", "8": "b",
    "@": "a", "$": "s", "!": "i", "+": "t",
};

// "1" is ambiguous (i or l), so check both readings.
function leetVariants(word: string): string[] {
    const base = word.toLowerCase().replace(/[^a-z0-9@$!+]/g, "");
    return ["i", "l"].map((one) =>
        base.replace(/[0134578@$!+]/g, (c) => (c === "1" ? one : LEET[c]))
    );
}

// Letters only, with leading and trailing digits/symbols removed: "ass123" -> "ass".
const core = (word: string) => word.toLowerCase().replace(/^[^a-z]+|[^a-z]+$/g, "");

async function loadBlocklist(): Promise<string[]> {
    if (!existsSync(BLOCKLIST_FILE)) {
        console.warn(`! ${BLOCKLIST_FILE} not found; filtering with the obscenity package only`);
        return [];
    }
    const text = await readFile(BLOCKLIST_FILE, "utf8");
    const terms = text
        .split(/\r?\n/)
        .map((t) => t.trim().toLowerCase().replace(/[^a-z]/g, ""))
        .filter((t) => t.length >= 2);
    return [...new Set(terms)];
}

async function main() {
    const source = process.argv[2] ?? DEFAULT_SOURCE;
    console.log(`Downloading ${source}`);
    const res = await fetch(source);
    if (!res.ok) throw new Error(`Download failed: ${res.status} ${res.statusText}`);
    const raw = (await res.text()).split(/\r?\n/);

    const terms = await loadBlocklist();
    const longTerms = terms.filter((t) => t.length >= 4);
    const shortTerms = terms.filter((t) => t.length < 4);
    const matcher = new RegExpMatcher({ ...englishDataset.build(), ...englishRecommendedTransformers });

    function blockReason(word: string): string | null {
        if (matcher.hasMatch(word)) return "obscenity";

        const variants = leetVariants(word);
        const hit = longTerms.find((t) => variants.some((v) => v.includes(t)));
        if (hit) return `contains "${hit}"`;

        const c = core(word);
        const shortHit = shortTerms.find((t) => c === t || c.startsWith(t) || c.endsWith(t));
        if (shortHit) return `short term "${shortHit}"`;

        return null;
    }

    const kept: string[] = [];
    const removed: string[] = [];
    const seen = new Set<string>();

    for (const line of raw) {
        const word = line.trim();
        if (!word || seen.has(word)) continue;
        seen.add(word);

        // Printable ASCII only, no spaces, no emails or phone-like strings.
        if (!/^[\x21-\x7e]+$/.test(word) || word.length > MAX_LENGTH) continue;
        if (word.includes("@")) continue;
        if (/^\+?\d{10,}$/.test(word)) continue;

        const reason = blockReason(word);
        if (reason) removed.push(`${word}\t${reason}`);
        else kept.push(word); // frequency order preserved
    }

    await mkdir(OUT_DIR, { recursive: true });
    await mkdir(REVIEW_DIR, { recursive: true });

    for (const size of SLICES) {
        const file = path.join(OUT_DIR, `common-${size}.txt`);
        await writeFile(file, kept.slice(0, size).join("\n") + "\n");
        console.log(`Wrote ${Math.min(size, kept.length)} entries -> ${file}`);
    }
    await writeFile(path.join(REVIEW_DIR, "removed.txt"), removed.join("\n") + "\n");

    console.log(`\nKept ${kept.length}, removed ${removed.length}.`);
    console.log(`Review what was dropped:  ${path.join(REVIEW_DIR, "removed.txt")}`);
    console.log(`Then skim the kept lists:  ${OUT_DIR}`);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
