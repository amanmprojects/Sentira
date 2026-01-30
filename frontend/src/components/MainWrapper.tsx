"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";

export default function MainWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isLanding = pathname === "/";

    return (
        <>
            <Sidebar />
            <main className={`transition-all duration-300 ${!isLanding ? 'pl-64' : ''}`}>
                {children}
            </main>
        </>
    );
}
