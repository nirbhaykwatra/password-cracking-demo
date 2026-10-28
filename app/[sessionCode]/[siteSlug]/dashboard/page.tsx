import { CategorySelect } from "@/components/demo-sites/ShopZone";

export default async function DemoDashboardPage({ params }: { params: Promise<{ siteSlug: string }> }) {
    const { siteSlug } = await params;

    switch (siteSlug) {
        case "flixwatch":
            return (
                <div>
                    <FlixWatchDashboard />
                </div>
            );

        case "fmail":
            return (
                <div>
                    <FMailDashboard />
                </div>
            );

        case "shopzone":
            return (
                <div>
                    <ShopZoneDashboard />
                </div>
            );

        default:
            return (
                <div>
                    <h1>Site not found</h1>
                </div>
            );
    }
}

//region Demo Pages

//region FlixWatch

const nav = ["Home", "Series", "Films", "New & Popular", "My List", "Browse by Language"];

const gradients = [
    "from-rose-900 to-zinc-900",
    "from-indigo-900 to-zinc-900",
    "from-emerald-900 to-zinc-900",
    "from-amber-800 to-zinc-900",
    "from-sky-900 to-zinc-900",
    "from-fuchsia-900 to-zinc-900",
    "from-slate-700 to-zinc-900",
    "from-teal-900 to-zinc-900",
];

const rows: { title: string; items: { t: string; e: string }[] }[] = [
    {
        title: "Continue Watching for Demo",
        items: [
            { t: "Midnight Harbour", e: "🌃" },
            { t: "The Last Signal", e: "📡" },
            { t: "Paper Kingdoms", e: "👑" },
            { t: "Cold Orbit", e: "🪐" },
            { t: "Salt & Ember", e: "🔥" },
            { t: "Echo Valley", e: "🏔️" },
        ],
    },
    {
        title: "Trending Now",
        items: [
            { t: "Neon Drifters", e: "🏎️" },
            { t: "Hollow Crown", e: "🗡️" },
            { t: "Quiet Tides", e: "🌊" },
            { t: "Dr. Alder's Casebook", e: "🩺" },
            { t: "Starfall High", e: "🌠" },
            { t: "Iron Garden", e: "🌿" },
        ],
    },
    {
        title: "Because You Watched Cold Orbit",
        items: [
            { t: "Deep Field", e: "🔭" },
            { t: "Moonbase Seven", e: "🌕" },
            { t: "The Long Dark Between", e: "🌌" },
            { t: "Orbit Kitchen", e: "🍜" },
            { t: "Zero-G Heist", e: "🚀" },
            { t: "Signal Lost", e: "🛰️" },
        ],
    },
];

function FlixWatchDashboard() {
    return (
        <div className="min-h-screen bg-[#141414] text-white">
            {/* Nav */}
            <header className="fixed inset-x-0 top-0 z-20 flex items-center gap-6 bg-gradient-to-b from-black/90 to-transparent px-4 py-4 md:px-12">
                <span className="text-2xl font-extrabold uppercase tracking-tight text-[#e50914]">FlixWatch</span>
                <nav className="hidden gap-5 text-sm md:flex">
                    {nav.map((n, i) => (
                        <a key={n} href="#" className={i === 0 ? "font-bold" : "text-[#e5e5e5] hover:text-[#b3b3b3]"}>
                            {n}
                        </a>
                    ))}
                </nav>
                <div className="ml-auto flex items-center gap-5 text-lg">
                    <button aria-label="Search">🔍</button>
                    <button aria-label="Notifications">🔔</button>
                    <span className="grid h-8 w-8 place-items-center rounded bg-sky-600 text-sm font-bold">D</span>
                </div>
            </header>

            {/* Hero */}
            <section className="relative flex h-[75vh] min-h-[420px] items-end bg-[radial-gradient(ellipse_at_70%_30%,#7a1219_0%,#1b0a0c_55%,#141414_100%)] px-4 pb-24 md:px-12">
                <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#141414] to-transparent" />
                <div className="relative max-w-xl">
                    <p className="mb-2 text-xs font-bold uppercase tracking-[0.3em] text-[#e50914]">
                        <span className="mr-2 inline-block h-3 w-1 bg-[#e50914] align-middle" />
                        Series
                    </p>
                    <h1 className="text-5xl font-extrabold leading-none md:text-7xl">THE LAST SIGNAL</h1>
                    <p className="mt-2 text-sm font-semibold text-[#46d369]">98% Match <span className="ml-2 text-[#bcbcbc]">2026 · 16+ · 2 Seasons</span></p>
                    <p className="mt-3 text-base text-[#e5e5e5] drop-shadow md:text-lg">
                        When a dead satellite starts broadcasting again, a small-town radio technician uncovers a message
                        that was never meant to be heard.
                    </p>
                    <div className="mt-5 flex gap-3">
                        <button className="flex items-center gap-2 rounded bg-white px-6 py-2 font-bold text-black hover:bg-white/75">
                            ▶ Play
                        </button>
                        <button className="flex items-center gap-2 rounded bg-[#6d6d6eb3] px-6 py-2 font-bold hover:bg-[#6d6d6e66]">
                            ⓘ More Info
                        </button>
                    </div>
                </div>
            </section>

            {/* Rows */}
            <main className="relative z-10 -mt-20 space-y-8 pb-16">
                {rows.map((row, ri) => (
                    <section key={row.title} className="px-4 md:px-12">
                        <h2 className="mb-2 text-lg font-semibold text-[#e5e5e5] md:text-xl">{row.title}</h2>
                        <div className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none]">
                            {row.items.map((it, i) => (
                                <a
                                    key={it.t}
                                    href="#"
                                    className={`group relative aspect-video w-52 shrink-0 overflow-hidden rounded bg-gradient-to-br ${
                                        gradients[(ri * 3 + i) % gradients.length]
                                    } transition-transform duration-200 hover:z-10 hover:scale-110 md:w-64`}
                                >
                                    <span className="absolute inset-0 grid place-items-center text-5xl opacity-70">{it.e}</span>
                                    <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-2 text-sm font-semibold">
                    {it.t}
                  </span>
                                    {ri === 0 && (
                                        <span className="absolute inset-x-0 bottom-0 h-1 bg-white/30">
                      <span className="block h-full bg-[#e50914]" style={{ width: `${25 + i * 12}%` }} />
                    </span>
                                    )}
                                </a>
                            ))}
                        </div>
                    </section>
                ))}
            </main>

            <footer className="px-4 pb-10 text-center text-xs text-[#737373]">
                © 2026 FlixWatch — fictional demo site
            </footer>
        </div>
    );
}

//endregion

//region ShopZone

const categories = ["All", "Today's Deals", "Electronics", "Home & Kitchen", "Books", "Fashion", "Toys & Games", "Sports", "Customer Service"];

const quickCards = [
    { title: "Your Orders", emoji: "📦", note: "2 arriving this week" },
    { title: "Buy Again", emoji: "🔁", note: "6 items to reorder" },
    { title: "Wish List", emoji: "🎁", note: "14 items saved" },
    { title: "Account", emoji: "👤", note: "Addresses & payments" },
];

const deals = [
    { name: "Wireless Noise-Cancelling Headphones", price: "129.99", was: "199.99", off: 35, emoji: "🎧", rating: 4 },
    { name: "Stainless Steel Air Fryer, 5.8 L", price: "89.00", was: "119.00", off: 25, emoji: "🍳", rating: 5 },
    { name: "Mechanical Keyboard, Hot-Swappable", price: "74.50", was: "99.00", off: 25, emoji: "⌨️", rating: 4 },
    { name: "Trail Running Shoes", price: "64.99", was: "110.00", off: 41, emoji: "👟", rating: 4 },
    { name: "Smart LED Desk Lamp", price: "34.99", was: "49.99", off: 30, emoji: "💡", rating: 4 },
    { name: "Insulated Water Bottle, 1 L", price: "22.95", was: "29.95", off: 23, emoji: "🥤", rating: 5 },
    { name: "Board Game: Space Traders", price: "39.99", was: "54.99", off: 27, emoji: "🎲", rating: 5 },
    { name: "Portable Bluetooth Speaker", price: "47.00", was: "69.00", off: 32, emoji: "🔊", rating: 4 },
];

const orders = [
    { id: "SZ-204-1183-9921", item: "USB-C Hub, 7-in-1", status: "Arriving Thursday", tone: "text-[#007600]" },
    { id: "SZ-204-5530-1148", item: "Yoga Mat, 6 mm", status: "Shipped", tone: "text-[#007600]" },
    { id: "SZ-204-7712-0063", item: "Paperback: The Long Orbit", status: "Delivered Oct 21", tone: "text-[#565959]" },
];

function Stars({ n }: { n: number }) {
    return (
        <span className="text-[#ffa41c]" aria-label={`${n} out of 5 stars`}>
      {"★".repeat(n)}
            <span className="text-[#ddd]">{"★".repeat(5 - n)}</span>
    </span>
    );
}

function ShopZoneDashboard() {
    return (
        <div className="min-h-screen bg-[#eaeded] text-[#0f1111]">
            {/* Top bar */}
            <header className="bg-[#131921] text-white">
                <div className="flex items-center gap-3 px-3 py-2">
          <span className="px-2 text-2xl font-bold tracking-tight">
            shop<span className="text-[#ff9900]">zone</span>
          </span>
                    <div className="hidden text-xs leading-tight text-[#ccc] md:block">
                        Deliver to<br />
                        <span className="text-sm font-bold text-white">Vancouver V6B</span>
                    </div>
                    <div className="flex h-10 flex-1 overflow-hidden rounded-md focus-within:ring-2 focus-within:ring-[#ff9900]">
                        <CategorySelect />
                        <input className="min-w-0 flex-1 px-3 text-sm text-black bg-white outline-none" placeholder="Search ShopZone" />
                        <button className="bg-[#febd69] px-4 hover:bg-[#f3a847]" aria-label="Search">🔍</button>
                    </div>
                    <div className="hidden text-xs leading-tight sm:block">
                        Hello, Demo User<br />
                        <span className="text-sm font-bold">Account &amp; Lists</span>
                    </div>
                    <div className="hidden text-xs leading-tight sm:block">
                        Returns<br />
                        <span className="text-sm font-bold">&amp; Orders</span>
                    </div>
                    <div className="flex items-end gap-1 px-2 font-bold">
                        <span className="text-2xl">🛒</span>
                        <span className="text-[#ff9900]">3</span>
                    </div>
                </div>
                <nav className="flex gap-4 overflow-x-auto bg-[#232f3e] px-4 py-1.5 text-sm">
                    {categories.map((c) => (
                        <a key={c} href="#" className="whitespace-nowrap rounded px-1.5 py-0.5 hover:outline hover:outline-1 hover:outline-white">
                            {c}
                        </a>
                    ))}
                </nav>
            </header>

            {/* Hero */}
            <div className="h-70 bg-gradient-to-b from-[#37475a] via-[#6c7b8c] to-[#eaeded] px-4 pt-8 text-center text-white">
                <p className="text-sm uppercase tracking-widest text-[#febd69]">Fall Savings Event</p>
                <h1 className="mt-1 text-3xl font-bold md:text-5xl">Up to 40% off home &amp; tech</h1>
                <button className="mt-4 rounded-lg bg-[#ffd814] px-5 py-2 text-sm font-medium text-[#0f1111] hover:bg-[#f7ca00]">
                    Shop all deals
                </button>
            </div>

            <main className="-mt-20 space-y-4 px-3 pb-10 md:px-6">
                {/* Quick cards */}
                <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {quickCards.map((c) => (
                        <div key={c.title} className="bg-white p-5 shadow-sm">
                            <h2 className="mb-2 text-xl font-bold">{c.title}</h2>
                            <div className="grid h-28 place-items-center bg-[#f7f8f8] text-5xl">{c.emoji}</div>
                            <p className="mt-2 text-xs text-[#565959]">{c.note}</p>
                            <a href="#" className="mt-1 block text-xs text-[#007185] hover:text-[#c7511f] hover:underline">See more</a>
                        </div>
                    ))}
                </section>

                {/* Deals */}
                <section className="bg-white p-5 shadow-sm">
                    <div className="mb-3 flex items-baseline gap-3">
                        <h2 className="text-xl font-bold">Today&apos;s Deals</h2>
                        <a href="#" className="text-sm text-[#007185] hover:text-[#c7511f] hover:underline">See all deals</a>
                    </div>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        {deals.map((d) => (
                            <article key={d.name} className="flex flex-col">
                                <div className="grid h-40 place-items-center bg-[#f7f8f8] text-6xl">{d.emoji}</div>
                                <div className="mt-2 flex items-center gap-2">
                                    <span className="rounded-sm bg-[#cc0c39] px-1.5 py-0.5 text-xs font-bold text-white">{d.off}% off</span>
                                    <span className="text-xs font-bold text-[#cc0c39]">Limited time deal</span>
                                </div>
                                <p className="mt-1 text-sm">
                                    <span className="text-[#565959]">$</span>
                                    <span className="text-lg font-medium">{d.price}</span>{" "}
                                    <span className="text-xs text-[#565959] line-through">${d.was}</span>
                                </p>
                                <p className="line-clamp-2 text-sm text-[#007185] hover:text-[#c7511f] hover:underline">{d.name}</p>
                                <Stars n={d.rating} />
                                <button className="mt-2 w-fit rounded-full bg-[#ffd814] px-4 py-1 text-xs hover:bg-[#f7ca00]">Add to cart</button>
                            </article>
                        ))}
                    </div>
                </section>

                {/* Orders */}
                <section className="bg-white p-5 shadow-sm">
                    <h2 className="mb-3 text-xl font-bold">Recent orders</h2>
                    <ul className="divide-y divide-[#e7e7e7]">
                        {orders.map((o) => (
                            <li key={o.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                                <div>
                                    <p className="font-medium">{o.item}</p>
                                    <p className="text-xs text-[#565959]">Order # {o.id}</p>
                                </div>
                                <span className={`font-bold ${o.tone}`}>{o.status}</span>
                                <button className="rounded-lg border border-[#d5d9d9] px-3 py-1 text-xs shadow-sm hover:bg-[#f7fafa]">Track package</button>
                            </li>
                        ))}
                    </ul>
                </section>
            </main>

            <footer className="bg-[#232f3e] py-6 text-center text-xs text-[#ddd]">
                © 2026 ShopZone — fictional demo site
            </footer>
        </div>
    );
}

//endregion

//region Fmail

const folders = [
    { name: "Inbox", icon: "📥", count: 4, active: true },
    { name: "Starred", icon: "⭐" },
    { name: "Snoozed", icon: "🕒" },
    { name: "Sent", icon: "📤" },
    { name: "Drafts", icon: "📝", count: 2 },
    { name: "Spam", icon: "🚫" },
    { name: "Trash", icon: "🗑️" },
];

const labels = [
    { name: "Work", color: "bg-[#188038]" },
    { name: "Receipts", color: "bg-[#e37400]" },
    { name: "Travel", color: "bg-[#1a73e8]" },
];

const mails: { from: string; subject: string; preview: string; time: string; unread?: boolean; starred?: boolean; label?: string }[] = [
    { from: "Maya Chen", subject: "Sprint review notes", preview: "Attaching the notes from today — a few action items for Thursday…", time: "3:42 PM", unread: true, label: "Work" },
    { from: "ShopZone", subject: "Your order has shipped", preview: "Good news! Your USB-C Hub is on the way and should arrive by Thursday.", time: "1:15 PM", unread: true, label: "Receipts" },
    { from: "FlixWatch", subject: "New this week: The Last Signal S2", preview: "Season 2 is here. Pick up right where you left off…", time: "11:08 AM", unread: true },
    { from: "Jordan Patel", subject: "Re: Weekend hike?", preview: "Sounds great — I'll bring the trail mix. Meet at the trailhead at 8?", time: "9:30 AM", starred: true },
    { from: "Northwind Air", subject: "Check-in opens soon", preview: "Your flight to Calgary departs Nov 3. Check in online from 24 hours before.", time: "Oct 26", label: "Travel" },
    { from: "Priya Nair", subject: "Invoice #1042", preview: "Hi, please find the invoice for October attached. Let me know if…", time: "Oct 26", label: "Work" },
    { from: "Library Services", subject: "Items due in 3 days", preview: "The following items are due on Oct 30: The Long Orbit (paperback).", time: "Oct 25" },
    { from: "Sam Okafor", subject: "Photos from Saturday", preview: "Finally got around to uploading everything — here's the shared album.", time: "Oct 24", starred: true },
    { from: "FMail Team", subject: "Tips for getting started", preview: "Get the most out of FMail with labels, filters, and keyboard shortcuts.", time: "Oct 22" },
];

function FMailDashboard() {
    return (
        <div className="flex h-screen flex-col bg-[#f6f8fc] text-[#1f1f1f]">
            {/* Header */}
            <header className="flex items-center gap-2 px-3 py-2 md:gap-4">
                <button aria-label="Menu" className="rounded-full p-2 text-xl hover:bg-[#e8eaed]">☰</button>
                <div className="flex w-40 items-center gap-1 text-[22px] text-[#444746]">
                    <span className="text-[#ea4335]">✉</span> FMail
                </div>
                <div className="flex h-12 max-w-3xl flex-1 items-center gap-3 rounded-full bg-[#eaf1fb] px-4 focus-within:bg-white focus-within:shadow-md">
                    <span className="text-[#444746]">🔍</span>
                    <input className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-[#444746]" placeholder="Search mail" />
                </div>
                <div className="ml-auto flex items-center gap-2">
                    <button aria-label="Settings" className="hidden rounded-full p-2 hover:bg-[#e8eaed] sm:block">⚙️</button>
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-[#1a73e8] text-sm font-medium text-white">D</span>
                </div>
            </header>

            <div className="flex min-h-0 flex-1">
                {/* Sidebar */}
                <aside className="hidden w-64 shrink-0 pr-3 md:block">
                    <button className="mb-3 ml-2 flex items-center gap-3 rounded-2xl bg-[#c2e7ff] px-5 py-4 text-sm font-medium text-[#001d35] shadow-sm hover:shadow-md">
                        ✏️ Compose
                    </button>
                    <nav className="text-sm">
                        {folders.map((f) => (
                            <a
                                key={f.name}
                                href="#"
                                className={`flex items-center gap-4 rounded-r-full py-1.5 pl-6 pr-4 ${
                                    f.active ? "bg-[#d3e3fd] font-bold" : "hover:bg-[#e8eaed]"
                                }`}
                            >
                                <span>{f.icon}</span>
                                <span className="flex-1">{f.name}</span>
                                {f.count && <span className="text-xs font-medium">{f.count}</span>}
                            </a>
                        ))}
                    </nav>
                    <div className="mt-4 pl-6 pr-4 text-sm font-medium">Labels</div>
                    {labels.map((l) => (
                        <a key={l.name} href="#" className="flex items-center gap-4 rounded-r-full py-1.5 pl-6 pr-4 text-sm hover:bg-[#e8eaed]">
                            <span className={`h-3 w-3 rounded-sm ${l.color}`} />
                            {l.name}
                        </a>
                    ))}
                </aside>

                {/* Main panel */}
                <main className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-t-2xl bg-white md:mr-3">
                    <div className="flex items-center gap-4 border-b border-[#e8eaed] px-4 py-1.5 text-sm text-[#444746]">
                        <input type="checkbox" aria-label="Select all" />
                        <button aria-label="Refresh">🔄</button>
                        <span className="ml-auto text-xs">1–9 of 9</span>
                    </div>

                    <div className="flex border-b border-[#e8eaed] text-sm">
                        {[
                            { n: "Primary", i: "📥", a: true },
                            { n: "Promotions", i: "🏷️", badge: "2 new" },
                            { n: "Social", i: "👥" },
                        ].map((t) => (
                            <button
                                key={t.n}
                                className={`flex items-center gap-3 border-b-[3px] px-6 py-3 ${
                                    t.a ? "border-[#0b57d0] font-medium text-[#0b57d0]" : "border-transparent text-[#444746] hover:bg-[#f1f3f4]"
                                }`}
                            >
                                {t.i} <span className="hidden sm:inline">{t.n}</span>
                                {t.badge && <span className="hidden rounded bg-[#1a73e8] px-1.5 text-xs text-white lg:inline">{t.badge}</span>}
                            </button>
                        ))}
                    </div>

                    <ul className="flex-1 overflow-y-auto">
                        {mails.map((m) => (
                            <li
                                key={m.subject}
                                className={`group flex cursor-pointer items-center gap-3 border-b border-[#f1f3f4] px-4 py-2 text-sm hover:z-10 hover:shadow-[0_1px_3px_rgba(60,64,67,.3)] ${
                                    m.unread ? "bg-white font-bold" : "bg-[#f2f6fc]"
                                }`}
                            >
                                <input type="checkbox" aria-label="Select" />
                                <span className={m.starred ? "text-[#f4b400]" : "text-[#c4c7c5]"}>{m.starred ? "★" : "☆"}</span>
                                <span className="w-32 shrink-0 truncate md:w-48">{m.from}</span>
                                <div className="flex min-w-0 flex-1 items-center gap-2">
                                    {m.label && (
                                        <span className="hidden rounded bg-[#e8eaed] px-1.5 py-0.5 text-xs font-normal text-[#444746] sm:inline">
                      {m.label}
                    </span>
                                    )}
                                    <span className="truncate">
                    {m.subject}
                                        <span className="font-normal text-[#5f6368]"> – {m.preview}</span>
                  </span>
                                </div>
                                <span className={`shrink-0 text-xs ${m.unread ? "text-[#1f1f1f]" : "font-normal text-[#5f6368]"}`}>{m.time}</span>
                            </li>
                        ))}
                    </ul>
                </main>
            </div>
        </div>
    );
}

//endregion

//endregion


