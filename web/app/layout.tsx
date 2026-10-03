import type { Metadata } from "next";
import { Bricolage_Grotesque, Manrope } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/providers";

const display = Bricolage_Grotesque({ variable: "--font-display", subsets: ["latin"] });
const sans = Manrope({ variable: "--font-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CRAVE — What's the campus craving?",
  description: "CRAVE is the campus food operating system — discover food, reserve pickup slots, track orders live, and run outlets.",
  openGraph: {
    title: "CRAVE — What's the campus craving?",
    description: "Find it. Grab it. Get back to life.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} h-full antialiased`}>
      <body className="min-h-dvh flex flex-col bg-base text-ink">
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-ink focus:text-white focus:px-4 focus:py-2 focus:rounded-m">
          Skip to content
        </a>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
