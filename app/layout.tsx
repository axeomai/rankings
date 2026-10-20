import "./globals.css";
import { Inter } from "next/font/google";
import { themeInitScript } from "@/lib/themes";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

// Thry sets type in Proxima Nova (--font-proxima-nova) where a host provides
// it; Inter is the stand-in loaded here.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const umamiId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
  const umamiSrc = process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL;
  return (
    <html lang="en" data-theme="dark" data-mode="dark" suppressHydrationWarning className={inter.variable}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        {umamiId && umamiSrc && <script defer src={umamiSrc} data-website-id={umamiId} />}
      </head>
      <body className="antialiased">
        <div className="flex min-h-screen flex-col">
          <SiteHeader />
          {children}
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
