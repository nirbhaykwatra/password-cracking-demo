export default async function DemoDetailsPage({ params }: { params: Promise<{ siteSlug: string }> }) {
    const { siteSlug } = await params;

    switch (siteSlug) {
        case "flixwatch":
            return (
                <div>
                    <FlixWatchBilling />
                </div>
            );

        case "fmail":
            return (
                <div>
                    <FMailSecurity />
                </div>
            );

        case "shopzone":
            return (
                <div>
                    <ShopZoneAccount />
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

//region Demo Details Pages

//region ShopZone

const orders = [
    { id: "SZ-204-1183-9921", date: "Oct 21, 2026", total: "74.50", status: "Delivered" },
    { id: "SZ-204-5530-1148", date: "Oct 12, 2026", total: "22.95", status: "Delivered" },
    { id: "SZ-204-7712-0063", date: "Sep 30, 2026", total: "129.99", status: "Delivered" },
];

function ShopZoneAccount() {
    return (
        <div className="min-h-screen bg-[#eaeded] text-[#0f1111]">
            <header className="bg-[#131921] px-4 py-3 text-2xl font-bold text-white">
                shop<span className="text-[#ff9900]">zone</span>
            </header>

            <main className="mx-auto max-w-3xl space-y-4 p-4 md:p-6">
                <h1 className="text-2xl font-bold">Account &amp; Payment</h1>

                {/* Profile */}
                <section className="rounded-lg bg-white p-5 shadow-sm">
                    <h2 className="mb-3 text-lg font-bold">Login &amp; security</h2>
                    <dl className="grid grid-cols-[120px_1fr] gap-y-2 text-sm">
                        <dt className="text-[#565959]">Name</dt>
                        <dd>Jamie Fakeperson</dd>
                        <dt className="text-[#565959]">Email</dt>
                        <dd>jamie.fakeperson@example-mail.test</dd>
                        <dt className="text-[#565959]">Phone</dt>
                        <dd>(555) 010-0199</dd>
                        <dt className="text-[#565959]">Password</dt>
                        <dd>••••••••••</dd>
                    </dl>
                    <button className="mt-3 rounded-lg border border-[#d5d9d9] bg-gradient-to-b from-[#f7fafa] to-[#e7eaea] px-4 py-1.5 text-xs shadow-sm hover:from-[#e7eaea]">
                        Edit
                    </button>
                </section>

                {/* Payment */}
                <section className="rounded-lg bg-white p-5 shadow-sm">
                    <h2 className="mb-3 text-lg font-bold">Payment methods</h2>
                    <div className="flex items-center justify-between rounded-lg border border-[#ddd] p-4">
                        <div className="flex items-center gap-4">
              <span className="grid h-10 w-14 place-items-center rounded bg-[#1a1f71] text-xs font-bold text-white">
                VISA
              </span>
                            <div className="text-sm">
                                <p className="font-medium">Visa ending in 0000</p>
                                <p className="text-[#565959]">Expires 01/30 · Demo card — not a real number</p>
                            </div>
                        </div>
                        <span className="rounded bg-[#f0f2f2] px-2 py-1 text-xs font-medium text-[#565959]">Default</span>
                    </div>
                    <p className="mt-2 text-xs text-[#565959]">Card number on file: 0000 0000 0000 0000 (placeholder)</p>
                    <button className="mt-3 rounded-lg border border-[#d5d9d9] bg-gradient-to-b from-[#f7fafa] to-[#e7eaea] px-4 py-1.5 text-xs shadow-sm hover:from-[#e7eaea]">
                        Add a payment method
                    </button>
                </section>

                {/* Billing address */}
                <section className="rounded-lg bg-white p-5 shadow-sm">
                    <h2 className="mb-3 text-lg font-bold">Billing address</h2>
                    <address className="text-sm not-italic leading-6">
                        Jamie Fakeperson<br />
                        123 Placeholder Street<br />
                        Springfield, ON A1A 1A1<br />
                        Canada (fictional address)
                    </address>
                </section>

                {/* Order history */}
                <section className="rounded-lg bg-white p-5 shadow-sm">
                    <h2 className="mb-3 text-lg font-bold">Order history</h2>
                    <ul className="divide-y divide-[#e7e7e7] text-sm">
                        {orders.map((o) => (
                            <li key={o.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                                <div>
                                    <p className="font-medium">Order # {o.id}</p>
                                    <p className="text-xs text-[#565959]">{o.date}</p>
                                </div>
                                <span>${o.total}</span>
                                <span className="font-bold text-[#007600]">{o.status}</span>
                            </li>
                        ))}
                    </ul>
                </section>
            </main>
        </div>
    );
}

//endregion

//region FlixWatch

const invoices = [
    { date: "Oct 1, 2026", amount: "16.99", status: "Paid" },
    { date: "Sep 1, 2026", amount: "16.99", status: "Paid" },
    { date: "Aug 1, 2026", amount: "16.99", status: "Paid" },
];

function FlixWatchBilling() {
    return (
        <div className="min-h-screen bg-black text-white">
            <header className="px-6 py-5 md:px-14">
                <span className="text-2xl font-extrabold uppercase tracking-tight text-[#e50914]">FlixWatch</span>
            </header>

            <main className="mx-auto max-w-3xl space-y-6 px-4 pb-16 md:px-14">
                <h1 className="text-2xl font-bold">Subscription &amp; Billing</h1>

                {/* Account */}
                <section className="rounded border border-[#333] p-5">
                    <h2 className="mb-3 text-sm uppercase tracking-wide text-[#b3b3b3]">Account</h2>
                    <dl className="grid grid-cols-[140px_1fr] gap-y-2 text-sm">
                        <dt className="text-[#8c8c8c]">Name on account</dt>
                        <dd>Taylor Fakeview</dd>
                        <dt className="text-[#8c8c8c]">Email</dt>
                        <dd>taylor.fakeview@example-mail.test</dd>
                        <dt className="text-[#8c8c8c]">Member since</dt>
                        <dd>March 2024 (demo)</dd>
                    </dl>
                </section>

                {/* Plan */}
                <section className="rounded border border-[#333] p-5">
                    <h2 className="mb-3 text-sm uppercase tracking-wide text-[#b3b3b3]">Plan</h2>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-semibold">Premium — 4K Ultra HD</p>
                            <p className="text-sm text-[#b3b3b3]">$16.99/month · 4 screens at once</p>
                        </div>
                        <button className="rounded bg-white/20 px-4 py-2 text-sm font-semibold hover:bg-white/30">
                            Change plan
                        </button>
                    </div>
                </section>

                {/* Payment method */}
                <section className="rounded border border-[#333] p-5">
                    <h2 className="mb-3 text-sm uppercase tracking-wide text-[#b3b3b3]">Payment method</h2>
                    <div className="flex items-center justify-between rounded border border-[#333] p-4">
                        <div className="flex items-center gap-4">
              <span className="grid h-9 w-14 place-items-center rounded bg-[#ff5f00]/90 text-xs font-bold text-white">
                MC
              </span>
                            <div className="text-sm">
                                <p className="font-medium">Mastercard ending in 0000</p>
                                <p className="text-[#8c8c8c]">Expires 01/30 · Demo card — not a real number</p>
                            </div>
                        </div>
                    </div>
                    <p className="mt-2 text-xs text-[#8c8c8c]">Card number on file: 0000 0000 0000 0000 (placeholder)</p>
                    <button className="mt-3 rounded bg-white/20 px-4 py-2 text-sm font-semibold hover:bg-white/30">
                        Update payment method
                    </button>
                </section>

                {/* Billing history */}
                <section className="rounded border border-[#333] p-5">
                    <h2 className="mb-3 text-sm uppercase tracking-wide text-[#b3b3b3]">Billing history</h2>
                    <ul className="divide-y divide-[#333] text-sm">
                        {invoices.map((inv) => (
                            <li key={inv.date} className="flex items-center justify-between py-3">
                                <span>{inv.date}</span>
                                <span>${inv.amount}</span>
                                <span className="text-[#46d369]">{inv.status}</span>
                                <a href="#" className="text-[#b3b3b3] underline hover:text-white">Invoice</a>
                            </li>
                        ))}
                    </ul>
                </section>
            </main>
        </div>
    );
}

//endregion

//region FMail

const activity = [
    { device: "Chrome on Windows", location: "Vancouver, BC (demo)", time: "Today, 3:42 PM", current: true },
    { device: "FMail app on Pixel", location: "Vancouver, BC (demo)", time: "Yesterday, 8:10 AM" },
    { device: "Safari on iPad", location: "Burnaby, BC (demo)", time: "Oct 24, 6:55 PM" },
];

function FMailSecurity() {
    return (
        <div className="min-h-screen bg-[#f6f8fc] text-[#1f1f1f]">
            <header className="flex items-center gap-1 px-4 py-3 text-xl text-[#444746]">
                <span className="text-[#ea4335]">✉</span> FMail
            </header>

            <main className="mx-auto max-w-3xl space-y-4 p-4 md:p-6">
                <h1 className="text-2xl font-normal">Security &amp; Account</h1>

                {/* Account info */}
                <section className="rounded-2xl bg-white p-5 shadow-sm">
                    <h2 className="mb-3 text-lg font-medium">Account info</h2>
                    <dl className="grid grid-cols-[160px_1fr] gap-y-2 text-sm">
                        <dt className="text-[#5f6368]">Name</dt>
                        <dd>Robin Fakewood</dd>
                        <dt className="text-[#5f6368]">Primary email</dt>
                        <dd>robin.fakewood@fmail-demo.test</dd>
                        <dt className="text-[#5f6368]">Recovery email</dt>
                        <dd>r.fakewood.backup@example-mail.test</dd>
                        <dt className="text-[#5f6368]">Recovery phone</dt>
                        <dd>(555) 010-0142</dd>
                    </dl>
                </section>

                {/* Password & 2SV */}
                <section className="rounded-2xl bg-white p-5 shadow-sm">
                    <h2 className="mb-3 text-lg font-medium">Password &amp; sign-in</h2>
                    <div className="flex items-center justify-between py-2 text-sm">
                        <div>
                            <p className="font-medium">Password</p>
                            <p className="text-[#5f6368]">Last changed Sep 2, 2026 (demo)</p>
                        </div>
                        <button className="rounded-full border border-[#747775] px-4 py-1.5 text-sm hover:bg-[#f0f4f9]">
                            Change password
                        </button>
                    </div>
                    <div className="flex items-center justify-between border-t border-[#e8eaed] py-2 text-sm">
                        <div>
                            <p className="font-medium">2-Step Verification</p>
                            <p className="text-[#5f6368]">On · text message to (555) 010-0142</p>
                        </div>
                        <button className="rounded-full border border-[#747775] px-4 py-1.5 text-sm hover:bg-[#f0f4f9]">
                            Manage
                        </button>
                    </div>
                </section>

                {/* Recent activity */}
                <section className="rounded-2xl bg-white p-5 shadow-sm">
                    <h2 className="mb-3 text-lg font-medium">Recent security activity</h2>
                    <ul className="divide-y divide-[#e8eaed] text-sm">
                        {activity.map((a) => (
                            <li key={a.time} className="flex items-center justify-between py-3">
                                <div>
                                    <p className="font-medium">
                                        {a.device} {a.current && <span className="ml-1 text-xs font-normal text-[#188038]">(this device)</span>}
                                    </p>
                                    <p className="text-[#5f6368]">{a.location}</p>
                                </div>
                                <span className="text-[#5f6368]">{a.time}</span>
                            </li>
                        ))}
                    </ul>
                </section>

                {/* Connected apps */}
                <section className="rounded-2xl bg-white p-5 shadow-sm">
                    <h2 className="mb-3 text-lg font-medium">Connected apps</h2>
                    <ul className="divide-y divide-[#e8eaed] text-sm">
                        <li className="flex items-center justify-between py-3">
                            <span>ShopZone (demo)</span>
                            <button className="text-[#0b57d0] hover:underline">Remove access</button>
                        </li>
                        <li className="flex items-center justify-between py-3">
                            <span>FlixWatch (demo)</span>
                            <button className="text-[#0b57d0] hover:underline">Remove access</button>
                        </li>
                    </ul>
                </section>
            </main>
        </div>
    );
}

//endregion

//endregion