import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Portal.Achei - Dashboard Interno",
  description: "Gerenciamento interno para agências de marketing",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#121214] text-gray-100">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
