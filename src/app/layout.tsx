import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nourish — Eat better with what you have",
  description:
    "Nourish helps households find the best achievable nutrition based on their family, available food, local prices and actual budget. Built for Ethiopia first.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
