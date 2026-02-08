import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Spotify Dropship BD | Bangladesh-powered Spotify storefronts",
  description:
    "Build a Spotify-focused dropshipping store with premium accounts, merch, and marketing accelerators fulfilled from Bangladesh.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <SiteHeader />
        <main className="bg-emerald-950/5 pb-16 pt-6 dark:bg-gradient-to-b dark:from-emerald-950 dark:via-emerald-950/90 dark:to-emerald-900">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
