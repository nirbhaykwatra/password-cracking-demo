import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { RegExpMatcher, englishDataset, englishRecommendedTransformers } from "obscenity";

// Google's 10k most frequent English words (frequency-ordered, from Project Gutenberg + Wikipedia + news/TV/movie subtitles)
const DEFAULT_SOURCE =
    "https://raw.githubusercontent.com/first20hours/google-10000-english/master/google-10000-english-usa.txt";
const BLOCKLIST_FILE = path.join("scripts", "blocklist.txt");
const OUT_DIR = path.join("public", "wordlists");
const REVIEW_DIR = path.join("scripts", ".wordlist-build");
const SLICES = [100, 1000, 10000];
const MIN_LENGTH = 3;  // drop "a", "an", "to" — too short to make a readable xkcd-style word
const MAX_LENGTH = 10; // keep words easy to say aloud in a classroom demo

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
    const matcher = new RegExpMatcher({ ...englishDataset.build(), ...englishRecommendedTransformers });

    const kept: string[] = [];
    const removed: string[] = [];
    const seen = new Set<string>();

    for (const line of raw) {
        const word = line.trim().toLowerCase();
        if (!word || seen.has(word)) continue;
        seen.add(word);

        // Plain lowercase letters only — no digits/symbols, unlike the password wordlist
        if (!/^[a-z]+$/.test(word)) continue;
        if (word.length < MIN_LENGTH || word.length > MAX_LENGTH) continue;

        if (matcher.hasMatch(word) || terms.includes(word)) {
            removed.push(word);
        } else {
            kept.push(word); // frequency order preserved
        }
    }

    await mkdir(OUT_DIR, { recursive: true });
    await mkdir(REVIEW_DIR, { recursive: true });

    for (const size of SLICES) {
        const file = path.join(OUT_DIR, `english-${size}.txt`);
        await writeFile(file, kept.slice(0, size).join("\n") + "\n");
        console.log(`Wrote ${Math.min(size, kept.length)} entries -> ${file}`);
    }
    await writeFile(path.join(REVIEW_DIR, "removed-english.txt"), removed.join("\n") + "\n");

    console.log(`\nKept ${kept.length}, removed ${removed.length}.`);
    console.log(`Review what was dropped:  ${path.join(REVIEW_DIR, "removed-english.txt")}`);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
