import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import "./globals.css";
import {
  figtree,
  geistSans,
  geistMono,
  jetBrainsMono,
  ibmPlexMono,
  firaCode,
  soehneMono,
  commitMono,
  robotoMono,
  spaceMono,
  sourceCodePro,
  googleSansCode,
} from "@/lib/fonts";
import { GlobalHotkeys } from "@/components/GlobalHotkeys";
import { Modals } from "@/components/modals";

export const metadata: Metadata = {
  title: {
    template: `%s | ${siteConfig.name}`,
    default: `${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: "/favicon.ico",
  },
  authors: [
    {
      name: siteConfig.links.author.name,
      url: siteConfig.links.author.authorSite,
    },
  ],
  keywords: siteConfig.keywords,
  creator: siteConfig.links.author.name,
  publisher: siteConfig.links.author.name,
  applicationName: siteConfig.name,
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
  },
  metadataBase: new URL(siteConfig.url),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "font-sans",
        figtree.variable,
        jetBrainsMono.variable,
        ibmPlexMono.variable,
        firaCode.variable,
        soehneMono.variable,
        commitMono.variable,
        robotoMono.variable,
        spaceMono.variable,
        sourceCodePro.variable,
        googleSansCode.variable,
        geistMono.variable,
      )}
    >
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <GlobalHotkeys />
        <Modals />
        {children}
      </body>
    </html>
  );
}
