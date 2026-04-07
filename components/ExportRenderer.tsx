"use client";

import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import "shiki-magic-move/dist/style.css";

import { MagicMove } from "@/components/move";
import type { ExportRendererHandle } from "@/lib/videoExport/exportEngine";
import { DEFAULT_EXPORT_CONFIG } from "@/lib/videoExport/types";
import type { Theme } from "@/store/themes";
import type { Language } from "@/utils/languages";

import BrowserbaseFrame from "@/components/frames/BrowserbaseFrame";
import ClerkFrame from "@/components/frames/ClerkFrame";
import CloudflareFrame from "@/components/frames/CloudflareFrame";
import DefaultFrame from "@/components/frames/DefaultFrame";
import ElevenLabsFrame from "@/components/frames/ElevenLabsFrame";
import FirecrawlFrame from "@/components/frames/FirecrawlFrame";
import GeminiFrame from "@/components/frames/GeminiFrame";
import MintlifyFrame from "@/components/frames/MintlifyFrame";
import NuxtFrame from "@/components/frames/NuxtFrame";
import OpenAIFrame from "@/components/frames/OpenAIFrame";
import PrismaFrame from "@/components/frames/PrismaFrame";
import ResendFrame from "@/components/frames/ResendFrame";
import StripeFrame from "@/components/frames/StripeFrame";
import SupabaseFrame from "@/components/frames/SupabaseFrame";
import TailwindFrame from "@/components/frames/TailwindFrame";
import TriggerdevFrame from "@/components/frames/TriggerdevFrame";
import VercelFrame from "@/components/frames/VercelFrame";
import { THEMES } from "@/store/themes";

import { highlighterAtom } from "@/store";
import { useAtomValue } from "jotai";

interface ExportRendererProps {
  theme: Theme;
  darkMode: boolean;
  language: Language | null;
  padding: number;
  showBackground: boolean;
  initialCode: string;
  width: number;
  height: number;
  font: string;
}

const TRANSITION_DURATION = DEFAULT_EXPORT_CONFIG.TRANSITION_DURATION_MS;

function resolveThemeName(themeId: string, darkMode: boolean): string {
  if (themeId === "tailwind") {
    return darkMode ? "tailwind-dark" : "tailwind-light";
  }
  return "css-variables";
}

function resolveThemeCSS(theme: Theme, darkMode: boolean): React.CSSProperties {
  const syntax = theme.syntax;
  return ((darkMode ? syntax.dark : syntax.light) ||
    syntax.light ||
    syntax.dark ||
    {}) as React.CSSProperties;
}

function resolveBackground(theme: Theme): string {
  return `linear-gradient(140deg, ${theme.background.from}, ${theme.background.to})`;
}

const fontFamilyMap: Record<string, string> = {
  "jetbrains-mono":
    'var(--font-jetbrainsmono), "Apple Color Emoji", "Segoe UI Emoji", monospace',
  "geist-mono":
    'var(--font-geist-mono), "Apple Color Emoji", "Segoe UI Emoji", monospace',
  "ibm-plex-mono":
    'var(--font-ibmplexmono), "Apple Color Emoji", "Segoe UI Emoji", monospace',
  "fira-code":
    'var(--font-firacode), "Apple Color Emoji", "Segoe UI Emoji", monospace',
  "soehne-mono":
    'var(--font-soehne-mono), "Apple Color Emoji", "Segoe UI Emoji", monospace',
  "roboto-mono":
    'var(--font-roboto-mono), "Apple Color Emoji", "Segoe UI Emoji", monospace',
  "commit-mono":
    'var(--font-commitmono), "Apple Color Emoji", "Segoe UI Emoji", monospace',
  "space-mono":
    'var(--font-space-mono), "Apple Color Emoji", "Segoe UI Emoji", monospace',
  "source-code-pro":
    'var(--font-source-code-pro), "Apple Color Emoji", "Segoe UI Emoji", monospace',
  "google-sans-code":
    'var(--font-google-sans-code), "Apple Color Emoji", "Segoe UI Emoji", monospace',
};

const ExportEditorContent = forwardRef<
  { updateCode: (code: string) => Promise<void> },
  {
    language: Language | null;
    theme: Theme;
    darkMode: boolean;
    initialCode: string;
    font: string;
  }
>(({ language, theme, darkMode, initialCode, font }, ref) => {
  const highlighter = useAtomValue(highlighterAtom);
  const containerRef = useRef<HTMLDivElement>(null);
  const magicMoveRef = useRef<MagicMove | null>(null);
  const [isReady, setIsReady] = useState(false);

  const themeName = resolveThemeName(theme.id, darkMode);

  let lang = language?.name.toLowerCase() || "plaintext";
  if (lang === "typescript") lang = "tsx";

  useEffect(() => {
    if (
      !highlighter ||
      !containerRef.current ||
      !language ||
      lang === "plaintext"
    )
      return;

    let cancelled = false;

    const init = async () => {
      const loaded = highlighter.getLoadedLanguages() || [];
      if (!loaded.includes(lang) && language.src) {
        await highlighter.loadLanguage(language.src);
      }

      if (cancelled) return;

      if (magicMoveRef.current) {
        magicMoveRef.current.destroy();
        magicMoveRef.current = null;
      }

      magicMoveRef.current = new MagicMove(
        containerRef.current!,
        highlighter,
        initialCode,
        {
          lang: lang as any,
          theme: themeName as any,
          duration: TRANSITION_DURATION,
          stagger: 3,
          delayContainer: 0.1,
          delayEnter: 0.1,
          delayLeave: 0.1,
          delayMove: 0.1,
          containerStyle: false,
          onEnd: () => setIsReady(true),
        },
      );
    };

    init();

    return () => {
      cancelled = true;
    };
  }, [highlighter, lang, themeName]);

  useEffect(() => {
    return () => {
      magicMoveRef.current?.destroy();
      magicMoveRef.current = null;
    };
  }, []);

  useImperativeHandle(ref, () => ({
    updateCode: async (code: string) => {
      if (!magicMoveRef.current) {
        return;
      }
      await magicMoveRef.current.update(code);
    },
  }));

  if (!language || lang === "plaintext") {
    return (
      <pre
        style={{
          margin: 0,
          padding: "16px",
          color: "var(--ray-foreground)",
          fontFamily: "inherit",
          fontSize: "var(--editor-font-size)",
          lineHeight: "var(--editor-line-height)",
          whiteSpace: "pre-wrap",
          overflow: "hidden",
        }}
      >
        {initialCode}
      </pre>
    );
  }

  return (
    <div
      style={{
        padding: "16px",
        fontSize: "var(--editor-font-size)",
        lineHeight: "var(--editor-line-height)",
        fontFamily: font ? fontFamilyMap[font] : "inherit",
        fontVariantLigatures: "none",
        overflow: "hidden",
      }}
    >
      <div ref={containerRef} />
    </div>
  );
});

ExportEditorContent.displayName = "ExportEditorContent";

export const ExportRenderer = forwardRef<
  ExportRendererHandle,
  ExportRendererProps
>(
  (
    {
      theme,
      darkMode,
      language,
      padding,
      showBackground,
      initialCode,
      width,
      height,
      font: propFont,
    },
    ref,
  ) => {
    const rootRef = useRef<HTMLDivElement>(null);
    const editorRef = useRef<{
      updateCode: (code: string) => Promise<void>;
    } | null>(null);

    const themeCSS = resolveThemeCSS(theme, darkMode);
    const themeBackground = resolveBackground(theme);
    const font = propFont || theme.font || "jetbrains-mono";
    const fontFamily = fontFamilyMap[font] || fontFamilyMap["jetbrains-mono"];

    useImperativeHandle(ref, () => ({
      updateCode: async (code: string) => {
        await editorRef.current?.updateCode(code);
      },
      getElement: () => rootRef.current,
    }));

    const editorContent = (
      <ExportEditorContent
        ref={editorRef}
        language={language}
        theme={theme}
        darkMode={darkMode}
        initialCode={initialCode}
        font={font}
      />
    );

    function renderFrame() {
      const frameProps = {
        padding,
        showBackground,
        theme,
        darkMode,
        themeBackground: showBackground ? themeBackground : "",
        language,
        code: initialCode,
      };

      switch (theme.id) {
        case THEMES.vercel.id:
        case THEMES.rabbit.id:
          return <VercelFrame {...frameProps}>{editorContent}</VercelFrame>;
        case THEMES.supabase.id:
          return <SupabaseFrame {...frameProps}>{editorContent}</SupabaseFrame>;
        case THEMES.tailwind.id:
          return <TailwindFrame {...frameProps}>{editorContent}</TailwindFrame>;
        case THEMES.clerk.id:
          return <ClerkFrame {...frameProps}>{editorContent}</ClerkFrame>;
        case THEMES.mintlify.id:
          return <MintlifyFrame {...frameProps}>{editorContent}</MintlifyFrame>;
        case THEMES.openai.id:
          return <OpenAIFrame {...frameProps}>{editorContent}</OpenAIFrame>;
        case THEMES.triggerdev.id:
          return (
            <TriggerdevFrame {...frameProps}>{editorContent}</TriggerdevFrame>
          );
        case THEMES.prisma.id:
          return <PrismaFrame {...frameProps}>{editorContent}</PrismaFrame>;
        case THEMES.elevenlabs.id:
          return (
            <ElevenLabsFrame {...frameProps}>{editorContent}</ElevenLabsFrame>
          );
        case THEMES.resend.id:
          return <ResendFrame {...frameProps}>{editorContent}</ResendFrame>;
        case THEMES.browserbase.id:
          return (
            <BrowserbaseFrame {...frameProps}>{editorContent}</BrowserbaseFrame>
          );
        case THEMES.nuxt.id:
          return <NuxtFrame {...frameProps}>{editorContent}</NuxtFrame>;
        case THEMES.gemini.id:
          return <GeminiFrame {...frameProps}>{editorContent}</GeminiFrame>;
        case THEMES.cloudflare.id:
          return (
            <CloudflareFrame {...frameProps}>{editorContent}</CloudflareFrame>
          );
        case THEMES.stripe.id:
          return <StripeFrame {...frameProps}>{editorContent}</StripeFrame>;
        case THEMES.firecrawl.id:
          return (
            <FirecrawlFrame {...frameProps}>{editorContent}</FirecrawlFrame>
          );
        default:
          return <DefaultFrame {...frameProps}>{editorContent}</DefaultFrame>;
      }
    }

    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width,
          height,
          pointerEvents: "none",
          zIndex: -1,
          opacity: 0.001,
        }}
      >
        <div
          ref={rootRef}
          style={{
            width,
            height,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            ...themeCSS,
            fontFamily,
            backgroundColor: "#000000",
            overflow: "hidden",
          }}
          data-theme={darkMode ? "dark" : "light"}
        >
          {renderFrame()}
        </div>
      </div>
    );
  },
);

ExportRenderer.displayName = "ExportRenderer";
