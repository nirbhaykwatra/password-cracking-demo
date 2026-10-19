import React from "react";
import {GURedHeader} from "@/components/common/headers";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <GURedHeader />
            {children}
        </>
    )
}