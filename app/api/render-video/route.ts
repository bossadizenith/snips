import { NextRequest, NextResponse } from "next/server";
import path from "path";
import os from "os";
import fs from "fs";
import { getHighlighterCore } from "shiki";
import getWasm from "shiki/wasm";
import { createCssVariablesTheme } from "@/utils/theme-css-variables";
import { LANGUAGES } from "@/utils/languages";

// Force Node.js runtime — @remotion/bundler and @remotion/renderer are Node.js-only packages
export const runtime = "nodejs";

// Types matching CodeCompositionProps (serialized for JSON transport)
interface Slide {
  id: string;
  title: string;
  code: string;
  tokens?: any[];
}

interface RenderRequestBody {
  slides: Slide[];
  theme: Record<string, unknown>;
  darkMode: boolean;
  language: { name: string; src?: unknown } | null;
  padding: number;
  windowWidth: number | null;
}

export async function POST(req: NextRequest) {
  let body: RenderRequestBody;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { slides, theme, darkMode, language, padding, windowWidth } = body;

  if (!slides || !Array.isArray(slides) || slides.length === 0) {
    return NextResponse.json({ error: "slides array is required" }, { status: 400 });
  }

  // Dynamically import Remotion renderer (Node.js only)
  const { bundle } = await import("@remotion/bundler");
  const { renderMedia, selectComposition } = await import("@remotion/renderer");

  // Path to the Remotion entry point
  const entryPoint = path.join(process.cwd(), "remotion", "index.tsx");
  const SLIDE_DURATION = 90;

  // 0. Tokenize slides with Shiki
  const shikiTheme = createCssVariablesTheme({
    name: "css-variables",
    variablePrefix: "--ray-",
    variableDefaults: {},
    fontStyle: true,
  });

  const tokenizedSlides = await (async () => {
    // Determine the language name (Shiki identifier)
    let shikiLang = language?.name?.toLowerCase() || "javascript";
    if (shikiLang === "typescript") shikiLang = "tsx"; // Common alias for this app

    // Find the language entry in our local map to get the loader function
    const langEntry = Object.values(LANGUAGES).find(
      (l) => l.name.toLowerCase() === (language?.name?.toLowerCase() || "javascript")
    );

    const highlighter = await getHighlighterCore({
      themes: [shikiTheme],
      langs: [],
      loadWasm: getWasm,
    });

    // Load the requested language into the highlighter
    if (langEntry) {
      await highlighter.loadLanguage(await langEntry.src());
    } else {
      // Fallback: at least try to load javascript if entry not found
      try {
        await highlighter.loadLanguage(await LANGUAGES.javascript.src());
      } catch (e) {
        console.error("[render-video] Failed to load fallback javascript lang:", e);
      }
    }

    return slides.map((slide) => {
      try {
        const result = highlighter.codeToTokens(slide.code, {
          lang: shikiLang,
          theme: "css-variables",
        });
        const tokens = Array.isArray(result) ? result : (result as any).tokens;
        console.log(`[render-video] Slide ${slide.id} tokenized. Tokens type: ${typeof tokens}, isArray: ${Array.isArray(tokens)}`);
        return { ...slide, tokens };
      } catch (err) {
        console.warn(`[render-video] Failed to tokenize slide ${slide.id}:`, err);
        return slide;
      }
    });
  })();

  try {
    // 1. Bundle the composition
    const bundleLocation = await bundle({
      entryPoint,
      // Teach Remotion's webpack about the @/ path alias (Next.js tsconfig paths)
      webpackOverride: (config) => ({
        ...config,
        resolve: {
          ...config.resolve,
            alias: {
              ...((config.resolve?.alias as Record<string, string>) ?? {}),
              "@": path.resolve(process.cwd()),
              "/public": path.resolve(process.cwd(), "public"),
              "/assets": path.resolve(process.cwd(), "public", "assets"),
            },
        },
      }),
    });

    // 2. The input props to inject into the composition
    const inputProps = {
      slides: tokenizedSlides,
      theme,
      darkMode,
      language,
      padding,
      windowWidth,
    };

    // 3. Select the composition with dynamic duration based on slide count
    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: "CodeComposition",
      inputProps,
    });

    // Override durationInFrames based on actual slide count
    const durationInFrames = SLIDE_DURATION * Math.max(slides.length, 1);

    // 4. Render to a temp file
    const tmpDir = os.tmpdir();
    const outputPath = path.join(tmpDir, `snips-export-${Date.now()}.mp4`);

    await renderMedia({
      composition: {
        ...composition,
        durationInFrames,
      },
      serveUrl: bundleLocation,
      codec: "h264",
      outputLocation: outputPath,
      inputProps,
    });

    // 5. Stream the MP4 back to the client
    const fileBuffer = fs.readFileSync(outputPath);

    // Clean up temp file
    fs.unlinkSync(outputPath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": `attachment; filename="snips-animation.mp4"`,
        "Content-Length": String(fileBuffer.length),
      },
    });
  } catch (err) {
    console.error("[render-video] Rendering failed:", err);
    return NextResponse.json(
      { error: "Video rendering failed", details: String(err) },
      { status: 500 }
    );
  }
}
