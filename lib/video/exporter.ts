/**
 * Main video exporter service
 * Orchestrates frame rendering and encoding for video export
 */

import {
  FrameRenderer,
  FrameRenderOptions,
  FrameRenderState,
  renderFrame,
} from "./frame-renderer";
import {
  WebCodecsEncoder,
  WebCodecsExportOptions,
  isWebCodecsSupported,
} from "./export-web";

export interface VideoExporterOptions
  extends FrameRenderOptions, WebCodecsExportOptions {
  totalFrames: number;
  onProgress?: (progress: FrameRenderProgress) => void;
  quality?: "preview" | "medium" | "high";
}

export interface FrameRenderProgress {
  renderedFrames: number;
  encodedFrames: number;
  totalFrames: number;
  percentComplete: number;
  stage: "rendering" | "encoding" | "complete";
}

/**
 * Main VideoExporter class
 * Handles frame rendering and video encoding
 */
export class VideoExporter {
  private options: VideoExporterOptions;
  private state: FrameRenderState;
  private progress: FrameRenderProgress;

  constructor(options: VideoExporterOptions, state: FrameRenderState) {
    this.options = {
      bitrate: this.getDefaultBitrate(options.quality || "high"),
      ...options,
    };
    this.state = state;
    this.progress = {
      renderedFrames: 0,
      encodedFrames: 0,
      totalFrames: options.totalFrames,
      percentComplete: 0,
      stage: "rendering",
    };
  }

  /**
   * Get default bitrate based on quality setting
   */
  private getDefaultBitrate(quality: "preview" | "medium" | "high"): number {
    switch (quality) {
      case "preview":
        return 500000; // 500 kbps
      case "medium":
        return 1500000; // 1.5 Mbps
      case "high":
      default:
        return 2500000; // 2.5 Mbps
    }
  }

  /**
   * Update progress and call callback
   */
  private updateProgress(overrides: Partial<FrameRenderProgress> = {}): void {
    this.progress = {
      ...this.progress,
      ...overrides,
    };

    const totalWork = this.progress.totalFrames * 2; // rendering + encoding is 2x work
    const completedWork =
      this.progress.renderedFrames + this.progress.encodedFrames;
    this.progress.percentComplete = Math.min(
      Math.round((completedWork / totalWork) * 100),
      99, // Never quite 100% until finalized
    );

    if (this.options.onProgress) {
      this.options.onProgress(this.progress);
    }
  }

  /**
   * Export as WebCodecs (client-side, fast, preview quality)
   * Works in modern browsers
   */
  async exportWebCodecs(): Promise<Blob> {
    if (!isWebCodecsSupported()) {
      throw new Error(
        "WebCodecs is not supported in this browser. Please use a modern browser (Chrome 94+, Edge 94+).",
      );
    }

    const encoder = new WebCodecsEncoder({
      fps: this.options.fps,
      duration: this.options.totalFrames / this.options.fps,
      width: this.options.width,
      height: this.options.height,
      bitrate: this.options.bitrate,
    });

    try {
      await encoder.initialize();

      // Render and encode frames
      const frames: ImageBitmap[] = [];

      for (let i = 0; i < this.options.totalFrames; i++) {
        // Render frame
        const frameBitmap = await renderFrame(i, this.options, this.state);
        frames.push(frameBitmap);

        this.updateProgress({
          renderedFrames: i + 1,
          stage: "rendering",
        });
      }

      // Update progress to encoding stage
      this.updateProgress({
        stage: "encoding",
        renderedFrames: this.options.totalFrames,
      });

      // Encode frames
      for (let i = 0; i < frames.length; i++) {
        const isKeyFrame = i % 60 === 0;
        await encoder.encodeFrame(frames[i], i, isKeyFrame);
        frames[i].close();

        this.updateProgress({
          encodedFrames: i + 1,
          stage: "encoding",
        });
      }

      const blob = await encoder.getBlob();

      this.updateProgress({
        stage: "complete",
        percentComplete: 100,
      });

      return blob;
    } finally {
      encoder.destroy();
    }
  }

  /**
   * Export via server-side FFmpeg (high quality)
   * Sends frame data to server for final MP4 encoding
   */
  async exportFFmpeg(): Promise<Blob> {
    // Render all frames locally
    const frames: ImageBitmap[] = [];

    for (let i = 0; i < this.options.totalFrames; i++) {
      const frameBitmap = await renderFrame(i, this.options, this.state);
      frames.push(frameBitmap);

      this.updateProgress({
        renderedFrames: i + 1,
        stage: "rendering",
      });
    }

    this.updateProgress({
      stage: "encoding",
      renderedFrames: this.options.totalFrames,
    });

    try {
      // Convert frames to PNG data
      const frameDataList: string[] = [];

      for (let i = 0; i < frames.length; i++) {
        const canvas = document.createElement("canvas");
        canvas.width = this.options.width;
        canvas.height = this.options.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Failed to get canvas context");

        ctx.drawImage(frames[i], 0, 0);
        frameDataList.push(canvas.toDataURL("image/png"));

        this.updateProgress({
          encodedFrames: i + 1,
          stage: "encoding",
        });
      }

      // Send to server for FFmpeg encoding
      const response = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          frames: frameDataList,
          fps: this.options.fps,
          width: this.options.width,
          height: this.options.height,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || `Server error: ${response.status}`);
      }

      const blob = await response.blob();

      this.updateProgress({
        stage: "complete",
        percentComplete: 100,
      });

      return blob;
    } finally {
      frames.forEach((frame) => frame.close());
    }
  }

  /**
   * Choose the best export method based on browser capabilities
   * Prefers WebCodecs for speed, falls back to FFmpeg
   */
  async exportAuto(): Promise<Blob> {
    if (isWebCodecsSupported()) {
      return this.exportWebCodecs();
    } else {
      return this.exportFFmpeg();
    }
  }

  /**
   * Get current progress
   */
  getProgress(): FrameRenderProgress {
    return { ...this.progress };
  }
}

/**
 * Helper function for quick video export
 */
export async function exportVideo(
  options: VideoExporterOptions,
  state: FrameRenderState,
  method: "webcodecs" | "ffmpeg" | "auto" = "auto",
): Promise<Blob> {
  const exporter = new VideoExporter(options, state);

  switch (method) {
    case "webcodecs":
      return exporter.exportWebCodecs();
    case "ffmpeg":
      return exporter.exportFFmpeg();
    case "auto":
    default:
      return exporter.exportAuto();
  }
}
