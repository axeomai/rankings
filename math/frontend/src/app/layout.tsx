import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MathRankings",
  description: "Metrics-based ranking of mathematics departments worldwide based on publications in selective journals.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
