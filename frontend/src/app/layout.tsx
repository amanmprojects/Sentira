import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import MainWrapper from "@/components/MainWrapper";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SentiWave AI | AI-Powered Video Sentiment & Bias Intelligence",
  description: "Next-generation video analysis platform using Gemini to detect sentiment, bias, and manipulation patterns.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} antialiased selection:bg-brand-primary/30 min-h-screen bg-[#020617]`}
      >
        <MainWrapper>
          {children}
        </MainWrapper>
      </body>
    </html>
  );
}
