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
import Link from "next/link";
import { Icons } from "@/components/icons";

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
        <main className="md:block hidden">{children}</main>
        <main className="md:hidden h-screen flex flex-col gap-10  p-6">
          <div className="flex-1 flex flex-col gap-8 justify-center">
            <div className="flex flex-col gap-4">
              <h1>{siteConfig.name}</h1>
              <p className="text-muted-foreground">{siteConfig.description}</p>
            </div>

            <p className="text-muted-foreground">
              We're not yet ready for modile devices. Please port to your laptop
            </p>
          </div>
          <Link
            href={siteConfig.links.github}
            className="flex items-center gap-2"
          >
            <Icons.github className="size-10" />
            Give us a helping hand on
          </Link>
        </main>
      </body>
    </html>
  );
}
