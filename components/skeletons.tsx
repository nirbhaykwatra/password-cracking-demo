export function SidebarSkeleton() {
    return (
        <aside className="relative flex w-56 flex-col gap-2 border-r border-foreground/10 bg-background/50">
            {/* Collapse button placeholder */}
            <div className="self-end m-3 h-7 w-7 animate-pulse rounded-full bg-foreground/5 " />

            {/* Nav item placeholders */}
            <div className="flex flex-col gap-1 px-2">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div
                        key={i}
                        className="flex items-center gap-3 rounded-xl px-3 py-2"
                    >
                        {/* Icon dot */}
                        <div className="h-3 w-3 shrink-0 animate-pulse rounded-full bg-foreground/5" />
                        {/* Label */}
                        <div
                            className="h-3 animate-pulse rounded-full bg-foreground/5"
                            style={{ width: `${60 + i * 8}%` }}
                        />
                    </div>
                ))}
            </div>
        </aside>
    );
}