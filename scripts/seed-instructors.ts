import { createInstructor } from "@/lib/auth";

const  instructors = [
    { name: "JohnDoe", password: "cyber-lamb-teapot-2345" },
];

async function main() {
    for (const instructor of instructors) {
        const result = await createInstructor(instructor.name, instructor.password);
        console.log("Seeded instructor:", result);
    }
    process.exit(0);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
