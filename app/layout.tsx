import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Nexus-Green | City Dashboard",
  description: "Heat and Traffic intelligence dashboard for Nagpur officials.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-[var(--background)] text-[var(--foreground)] w-full h-full min-h-screen overflow-hidden`}>
        {children}
      </body>
    </html>
  );
}
