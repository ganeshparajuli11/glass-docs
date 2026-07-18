import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/shell/ThemeProvider";
import { Aurora } from "@/components/shell/Aurora";
import { Header } from "@/components/shell/Header";
import { Footer } from "@/components/shell/Footer";
import { site } from "@/config/site";
import { adConfig } from "@/config/ads";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  other: { "google-adsense-account": "ca-pub-2661645060530542" },
  title: {
    default: `${site.name} — Free private PDF tools in your browser`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  openGraph: {
    siteName: site.name,
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        {adConfig.clientId ? (
          // Site-wide AdSense loader: required by Google for site verification
          // and review. React hoists this async script into <head> in the
          // prerendered HTML so Google's crawler sees the literal tag.
          // Ad UNITS still render only when enabled (see AdSlot).
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adConfig.clientId}`}
            crossOrigin="anonymous"
          />
        ) : null}
        <ThemeProvider>
          <Aurora />
          <Header />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
