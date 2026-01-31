import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
import "./globals.css";
import MainWrapper from "@/components/MainWrapper";
import { AnalysisProvider } from "@/context/AnalysisContext";

const inter = Inter({
    variable: "--font-inter",
    subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
    variable: "--font-space-grotesk",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Sentira | AI-Powered Video Sentiment & Bias Intelligence",
    description: "Next-generation video analysis platform using Gemini to detect sentiment, bias, and manipulation patterns.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <ClerkProvider>
            <html lang="en">
                <body
                    className={`${inter.variable} ${spaceGrotesk.variable} antialiased selection:bg-brand-primary/30 min-h-screen bg-[#020617]`}
                >
                    <AnalysisProvider>
                        <MainWrapper>
                            {children}
                        </MainWrapper>
                    </AnalysisProvider>
                </body>
            </html>
        </ClerkProvider>
    );
}