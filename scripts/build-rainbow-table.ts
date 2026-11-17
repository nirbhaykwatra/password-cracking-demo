import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const SIZES = [100, 1000, 10000] as const;
const outDir = join(process.cwd(), "public", "rainbow");
mkdirSync(outDir, { recursive: true });

for (const size of SIZES) {
    const words = readFileSync(join(process.cwd(), "public", "wordlists", `common-${size}.txt`), "utf8")
        .split("\n")
        .map((w) => w.trim())
        .filter(Boolean);

    // One "<32-char md5>:<password>" line per word
    const lines = words.map((w) => `${createHash("md5").update(w).digest("hex")}:${w}`);

    writeFileSync(join(outDir, `md5-${size}.txt`), lines.join("\n"));
    console.log(`md5-${size}.txt: ${lines.length} entries`);
}
