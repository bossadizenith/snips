import { NextRequest, NextResponse } from "next/server";
import path from "path";
import os from "os";
import fs from "fs";

// Force Node.js runtime — @remotion/bundler and @remotion/renderer are Node.js-only packages
export const runtime = "nodejs";

// Types matching CodeCompositionProps (serialized for JSON transport)
interface Slide {
  id: string;
  title: string;
  code: string;
}

interface RenderRequestBody {
  slides: Slide[];
  theme: Record<string, unknown>;
  darkMode: boolean;
  language: { name: string; src?: unknown } | null;
  padding: number;
}

export async function POST(req: NextRequest) {
  let body: RenderRequestBody;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { slides, theme, darkMode, language, padding } = body;

  if (!slides || !Array.isArray(slides) || slides.length === 0) {
    return NextResponse.json({ error: "slides array is required" }, { status: 400 });
  }

  // Dynamically import Remotion renderer (Node.js only)
  const { bundle } = await import("@remotion/bundler");
  const { renderMedia, selectComposition } = await import("@remotion/renderer");

  // Path to the Remotion entry point
  const entryPoint = path.join(process.cwd(), "remotion", "index.tsx");
  const SLIDE_DURATION = 90;

  try {
    // 1. Bundle the composition
    const bundleLocation = await bundle({
      entryPoint,
      // Enable webpack caching for faster subsequent renders
      webpackOverride: (config) => config,
    });

    // 2. The input props to inject into the composition
    const inputProps = {
      slides,
      theme,
      darkMode,
      language,
      padding,
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
