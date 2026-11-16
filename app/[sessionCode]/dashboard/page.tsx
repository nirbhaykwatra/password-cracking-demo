import Link from "next/link";
import { notFound } from "next/navigation";
import { getSessionByCode } from "@/lib/dal";

type DemoSite = {
    slug: "flixwatch" | "fmail" | "shopzone";
    name: string;
    description: string;
    emoji: string;
    cardClass: string;
    buttonClass: string;
};

const demoSites: DemoSite[] = [
    {
        slug: "flixwatch",
        name: "FlixWatch",
        description: "A fictional streaming service. Try signing in to a movie and TV account.",
        emoji: "🎬",
        cardClass: "bg-gradient-to-br from-[#3a0a0e] to-black text-white",
        buttonClass: "bg-[#e50914] text-white hover:bg-[#c11119]",
    },
    {
        slug: "fmail",
        name: "FMail",
        description: "A fictional email service. Explore a two-step email and password sign-in.",
        emoji: "✉️",
        cardClass: "bg-gradient-to-br from-[#d3e3fd] to-[#f0f4f9] text-[#1f1f1f]",
        buttonClass: "bg-[#0b57d0] text-white hover:bg-[#0a4cb8]",
    },
    {
        slug: "shopzone",
        name: "ShopZone",
        description: "A fictional online store. Check out how a shopping account is protected.",
        emoji: "🛒",
        cardClass: "bg-gradient-to-br from-[#232f3e] to-[#37475a] text-white",
        buttonClass: "bg-[#ffd814] text-[#0f1111] hover:bg-[#f7ca00]",
    },
];

export default async function SessionDashboardPage({ params }: { params: Promise<{ sessionCode: string }>; }) {
    const { sessionCode } = await params;

    // Only show the portals for real sessions
    const session = await getSessionByCode(sessionCode);
    if (!session) {
        notFound();
    }

    return (
        <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
            <div className="mb-10 text-center">
                <h1 className="text-3xl sm:text-4xl">Password Cracking Demo</h1>
                <p className="mt-3 text-muted">
                    Session code:{" "}
                    <span className="rounded bg-surface px-2 py-1 font-mono font-semibold text-foreground">
                        {session.code}
                    </span>
                </p>
                <p className="mx-auto mt-4 max-w-2xl text-foreground">
                    Choose one of the demo websites below. Each site is fictional, so please
                    don&apos;t enter any real emails or passwords.
                </p>
            </div>

            <section className="grid gap-6 md:grid-cols-3">
                {demoSites.map((site) => (
                    <article
                        key={site.slug}
                        className={`flex flex-col rounded-2xl p-6 shadow-md transition-transform hover:-translate-y-1 hover:shadow-xl ${site.cardClass}`}
                    >
                        <div className="text-6xl" aria-hidden="true">{site.emoji}</div>
                        <h2 className="mt-4 text-2xl text-inherit!">{site.name}</h2>
                        <p className="mt-2 flex-1 text-sm opacity-90">{site.description}</p>
                        <Link
                            href={`/${session.code}/${site.slug}/signin`}
                            className={`mt-6 rounded-lg px-4 py-2.5 text-center text-sm font-semibold ${site.buttonClass}`}
                        >
                            Open {site.name}
                        </Link>
                    </article>
                ))}
            </section>
        </main>
    );
}