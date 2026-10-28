import React, { Suspense } from "react";
import { GURedHeader } from "@/components/common/headers";
import { Sidebar } from "@/components/dashboard/DashboardClientComponents";
import { SidebarSkeleton } from "@/components/skeletons";

async function SidebarWithSlug({ params }: { params: Promise<{ sessionCode: string }> }) {
    const { sessionCode } = await params;
    return <Sidebar sessionCode={sessionCode} />;
}

export default function SessionAdminLayout({ children, params }: { children: React.ReactNode; params: Promise<{ sessionCode: string }> }) {
    return (
        <div className="relative isolate flex h-dvh flex-col overflow-hidden bg-background font-sans">
            <GURedHeader />
            <div className="relative z-10 flex flex-1 min-h-0">

                {/* Sidebar — hidden on mobile, sticky on md+ */}
                <div className="hidden md:flex">
                    <Suspense fallback={<SidebarSkeleton />}>
                        <SidebarWithSlug params={params} />
                    </Suspense>
                </div>

                {/* Scrollable content */}
                <div className="flex flex-1 flex-col min-h-0">
                    <main className="flex-1 overflow-y-auto px-6 py-12 sm:px-10">
                        <div className="flex flex-col gap-8 mx-auto w-full">
                            <Suspense fallback={<p />}>
                                {children}
                            </Suspense>
                        </div>
                    </main>
                </div>
            </div>

            {/* Mobile bottom nav — shown instead of sidebar on small screens */}
            <div className="md:hidden">
                <Suspense fallback={<div className="h-14 border-t border-foreground/10 bg-background/80" />}>
                    <SidebarWithSlug params={params} />
                </Suspense>
            </div>

        </div>
    )
}