import { mkdirSync, writeFileSync } from "node:fs";
import { randomInt } from "node:crypto";
import { join } from "node:path";
import postgres from "postgres";
import { createInstructor } from "@/lib/auth";

const WORDS = [
    "amber", "anchor", "apple", "arrow", "aspen", "badge", "baker", "beach", "berry", "bison",
    "blaze", "bloom", "boat", "brick", "bridge", "brook", "cabin", "camel", "candy", "canoe",
    "cedar", "chalk", "cherry", "cloud", "clover", "coast", "comet", "coral", "crane", "creek",
    "daisy", "delta", "eagle", "ember", "falcon", "fern", "field", "flame", "forest", "frost",
    "garden", "giant", "glacier", "grove", "harbor", "hazel", "heron", "honey", "island", "ivory",
    "jungle", "kettle", "lemon", "lilac", "lotus", "maple", "meadow", "mint", "moose", "nectar",
    "oasis", "olive", "orchid", "otter", "panda", "pearl", "pebble", "pine", "planet", "poppy",
    "quartz", "rabbit", "raven", "river", "robin", "saddle", "sage", "shore", "signal", "silver",
    "spark", "spruce", "stone", "sunny", "tiger", "timber", "tulip", "valley", "violet", "walnut",
    "willow", "winter", "yellow", "zebra",
];

// Same unambiguous alphabet as session codes: no 0/1/5 or O/I/L/S
const SUFFIX_ALPHABET = "2346789ABCDEFGHJKMNPQRTUVWXY";

const PREFIX = "instructor";
const WORD_COUNT = 4;
const DIGIT_COUNT = 4;
const MAX_USERNAME_RETRIES = 5;

function randomString(alphabet: string, length: number): string {
    let out = "";
    for (let i = 0; i < length; i++) out += alphabet[randomInt(alphabet.length)];
    return out;
}

function generateUsername(): string {
    return `${PREFIX}-${randomString(SUFFIX_ALPHABET, 4)}`;
}

function generatePassphrase(): string {
    const words = Array.from({ length: WORD_COUNT }, () => WORDS[randomInt(WORDS.length)]);
    return `${words.join("-")}-${randomString("0123456789", DIGIT_COUNT)}`;
}

// Unique-constraint violation (23505), whether raw or wrapped by Drizzle
function isUniqueViolation(error: unknown): boolean {
    const cause = error instanceof Error ? error.cause : undefined;
    return [error, cause].some((e) => e instanceof postgres.PostgresError && e.code === "23505");
}

async function main() {
    const count = Number(process.argv[2] ?? 1);
    if (!Number.isInteger(count) || count < 1 || count > 100) {
        throw new Error("Usage: npm run generate:instructors -- <count between 1 and 100>");
    }

    const created: { username: string; password: string }[] = [];

    for (let i = 0; i < count; i++) {
        const password = generatePassphrase();

        for (let attempt = 0; attempt < MAX_USERNAME_RETRIES; attempt++) {
            const username = generateUsername();
            try {
                await createInstructor(username, password);
                created.push({ username, password });
                break;
            } catch (error) {
                if (!isUniqueViolation(error)) throw error;
                // Username already taken: loop and try a new one
            }
        }
    }

    if (created.length < count) {
        console.warn(`Only created ${created.length} of ${count} instructors (username collisions).`);
    }

    const dir = join(process.cwd(), "credentials");
    mkdirSync(dir, { recursive: true });
    const file = join(dir, `instructors-${new Date().toISOString().replace(/[:.]/g, "-")}.csv`);
    const csv = ["username,password", ...created.map((c) => `${c.username},${c.password}`)].join("\n") + "\n";
    writeFileSync(file, csv, { mode: 0o600 });

    console.table(created);
    console.log(`\nSaved to ${file}`);
    console.log("These passwords are shown once. Only the bcrypt hash is stored in the database.");
}

main()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });