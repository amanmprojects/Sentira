"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";

export default function MainWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isFullWidthPage = pathname === "/" || pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up") || pathname.startsWith("/docs");

    return (
        <>
            <Sidebar />
            <main className={`transition-all duration-300 ${!isFullWidthPage ? 'pl-64' : ''}`}>
                {children}
            </main>
        </>
    );
}
