import type { Metadata } from "next";
import { Urbanist, Yesteryear } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const urbanist = Urbanist({
  variable: "--font-urbanist",
  subsets: ["latin"],
});

const yesteryear = Yesteryear({
  variable: "--font-yesteryear",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TableFlow | Premium Restaurant Reservations",
  description: "Enterprise-grade restaurant reservation and table management platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className={`${urbanist.className} ${yesteryear.variable} min-h-full flex flex-col bg-white text-neutral-900`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
