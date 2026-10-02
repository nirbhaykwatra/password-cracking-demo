'use client';

import React from 'react';

export default function PrismaticBackground() {
    return (
        <div className="fixed inset-0 -z-10 overflow-hidden bg-neutral-950" aria-hidden="true">
            {/* Pink Glowing Streak Layer */}
            <div className="absolute top-[-10%] left-[-10%] h-[80vw] w-[80vw] rounded-full bg-streak-pink animate-float-pink mix-blend-screen" />

            {/* Purple Glowing Streak Layer */}
            <div className="absolute bottom-[-10%] right-[-10%] h-[90vw] w-[90vw] rounded-full bg-streak-purple animate-float-purple mix-blend-screen" />

            {/* Cyan Glowing Streak Layer */}
            <div className="absolute top-[20%] right-[10%] h-[75vw] w-[75vw] rounded-full bg-streak-cyan animate-float-cyan mix-blend-screen" />
        </div>
    );
}
