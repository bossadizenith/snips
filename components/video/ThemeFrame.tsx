import React from "react";
import { THEMES } from "@/store/themes";
import DefaultFrame from "../frames/DefaultFrame";
import VercelFrame from "../frames/VercelFrame";
import SupabaseFrame from "../frames/SupabaseFrame";
import TailwindFrame from "../frames/TailwindFrame";
import ClerkFrame from "../frames/ClerkFrame";
import OpenAIFrame from "../frames/OpenAIFrame";
import StripeFrame from "../frames/StripeFrame";
import BrowserbaseFrame from "../frames/BrowserbaseFrame";
import PrismaFrame from "../frames/PrismaFrame";
import NuxtFrame from "../frames/NuxtFrame";
import GeminiFrame from "../frames/GeminiFrame";
import CloudflareFrame from "../frames/CloudflareFrame";
import ElevenLabsFrame from "../frames/ElevenLabsFrame";
import FirecrawlFrame from "../frames/FirecrawlFrame";
import MintlifyFrame from "../frames/MintlifyFrame";
import ResendFrame from "../frames/ResendFrame";
import TriggerdevFrame from "../frames/TriggerdevFrame";
import { FrameProps } from "../frames/types";

const ThemeFrame: React.FC<FrameProps> = (props) => {
  const themeId = props.theme?.id;

  switch (themeId) {
    case THEMES.vercel.id:
    case THEMES.rabbit.id:
      return <VercelFrame {...props} />;
    case THEMES.supabase.id:
      return <SupabaseFrame {...props} />;
    case THEMES.tailwind.id:
      return <TailwindFrame {...props} />;
    case THEMES.clerk.id:
      return <ClerkFrame {...props} />;
    case THEMES.openai.id:
      return <OpenAIFrame {...props} />;
    case THEMES.stripe.id:
      return <StripeFrame {...props} />;
    case THEMES.browserbase.id:
      return <BrowserbaseFrame {...props} />;
    case THEMES.prisma.id:
      return <PrismaFrame {...props} />;
    case THEMES.nuxt.id:
      return <NuxtFrame {...props} />;
    case THEMES.gemini.id:
      return <GeminiFrame {...props} />;
    case THEMES.cloudflare.id:
      return <CloudflareFrame {...props} />;
    case THEMES.elevenlabs.id:
      return <ElevenLabsFrame {...props} />;
    case THEMES.firecrawl.id:
      return <FirecrawlFrame {...props} />;
    case THEMES.mintlify.id:
      return <MintlifyFrame {...props} />;
    case THEMES.resend.id:
      return <ResendFrame {...props} />;
    case THEMES.triggerdev.id:
      return <TriggerdevFrame {...props} />;
    default:
      return <DefaultFrame {...props} />;
  }
};

export default ThemeFrame;
