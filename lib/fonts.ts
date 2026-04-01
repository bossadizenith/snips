import {
  Fira_Code,
  Geist_Mono,
  Google_Sans_Code,
  IBM_Plex_Mono,
  JetBrains_Mono,
  Roboto_Mono,
  Source_Code_Pro,
  Space_Mono,
  Figtree,
  Geist,
} from "next/font/google";
import localFont from "next/font/local";

export const figtree = Figtree({ subsets: ["latin"], variable: "--font-sans" });

export const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
export const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: "500",
  display: "swap",
  variable: "--font-jetbrainsmono",
});
export const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: "500",
  display: "swap",
  variable: "--font-ibmplexmono",
});
export const firaCode = Fira_Code({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-firacode",
});

export const soehneMono = localFont({
  src: "../public/assets/soehne-mono-buch.woff2",
  variable: "--font-soehne-mono",
});

export const commitMono = localFont({
  src: "../public/assets/commit-mono-regular.woff2",
  variable: "--font-commitmono",
});

export const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-roboto-mono",
});

export const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-space-mono",
});

export const sourceCodePro = Source_Code_Pro({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-source-code-pro",
});

export const googleSansCode = Google_Sans_Code({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-google-sans-code",
});
