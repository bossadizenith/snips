import { NextRequest, NextResponse } from "next/server";
import path from "path";
import os from "os";
import fs from "fs";
import { execSync } from "child_process";

export const runtime = "nodejs";

interface ExportRequestBody {
  frames: string[]; // Array of data URLs (PNG)
  fps: number;
  width: number;
  height: number;
}

/**
 * Server-side video export using FFmpeg
 * Accepts PNG frame data and produces high-quality MP4
 */
export async function POST(req: NextRequest) {
  let body: ExportRequestBody;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { frames, fps, width, height } = body;

  if (!frames || !Array.isArray(frames) || frames.length === 0) {
    return NextResponse.json(
      { error: "frames array is required" },
      { status: 400 },
    );
  }

  if (!fps || !width || !height) {
    return NextResponse.json(
      { error: "fps, width, height are required" },
      { status: 400 },
    );
  }

  const tmpDir = path.join(os.tmpdir(), `snips-export-${Date.now()}`);
  const framesDir = path.join(tmpDir, "frames");
  const outputPath = path.join(tmpDir, "output.mp4");

  try {
    // Create temp directories
    fs.mkdirSync(framesDir, { recursive: true });

    // Write frames to PNG files
    console.log(`[export] Writing ${frames.length} frames to disk...`);
    for (let i = 0; i < frames.length; i++) {
      const dataUrl = frames[i];
      const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");

      const framePath = path.join(
        framesDir,
        `frame_${String(i).padStart(4, "0")}.png`,
      );
      fs.writeFileSync(framePath, buffer);

      if ((i + 1) % 50 === 0 || i === frames.length - 1) {
        console.log(`[export] Wrote ${i + 1}/${frames.length} frames`);
      }
    }

    // Run FFmpeg to create MP4
    console.log("[export] Running FFmpeg encoder...");
    const framePattern = path.join(framesDir, "frame_%04d.png");

    // FFmpeg command with H.264 encoding
    const ffmpegCmd = [
      "ffmpeg",
      "-y", // Overwrite output file
      "-framerate",
      String(fps),
      "-i",
      framePattern,
      "-c:v",
      "libx264",
      "-preset",
      "slow", // slow, medium, fast (slow = better quality)
      "-crf",
      "18", // Quality (0-51, lower is better, 18 is high quality)
      "-pix_fmt",
      "yuv420p", // Required for compatibility
      "-movflags",
      "+faststart", // Allow streaming/preview before download complete
      outputPath,
    ];

    try {
      execSync(ffmpegCmd.join(" "), { stdio: "pipe" });
    } catch (error: any) {
      console.error("[export] FFmpeg error:", error.message);
      throw new Error(`FFmpeg encoding failed: ${error.message}`);
    }

    // Read MP4
    console.log("[export] Reading output MP4...");
    const fileBuffer = fs.readFileSync(outputPath);

    // Cleanup temp directory
    console.log("[export] Cleaning up temp files...");
    fs.rmSync(tmpDir, { recursive: true, force: true });

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": `attachment; filename="snips-export.mp4"`,
        "Content-Length": String(fileBuffer.length),
      },
    });
  } catch (err) {
    console.error("[export] Export failed:", err);

    // Cleanup on error
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }

    return NextResponse.json(
      {
        error: "Video export failed",
        details: String(err),
      },
      { status: 500 },
    );
  }
}
