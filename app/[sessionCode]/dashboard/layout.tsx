import React from "react";
import {GURedHeader} from "@/components/common/headers";

export default function SessionDashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <GURedHeader />
            {children}
        </>
    )
}