/**
 * Canvas-based frame renderer for deterministic video export.
 * Renders individual frames based on frame number (not time).
 */

import { Theme } from "@/store/themes";
import { Language } from "@/utils/languages";

export interface FrameRenderOptions {
  width: number;
  height: number;
  fps: number;
  devicePixelRatio?: number;
}

export interface FrameRenderState {
  slides: Array<{
    id: string;
    code: string;
    title?: string;
  }>;
  theme: Theme;
  darkMode: boolean;
  language: Language | null;
  padding: number;
  windowWidth?: number | null;
}

const SLIDE_DURATION = 90; // frames per slide at 60fps
const VIDEO_FONT_STYLE_MAP: Record<string, Record<string, string>> = {
  "jetbrains-mono": {
    fontFamily:
      '"JetBrains Mono", "SFMono-Regular", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    fontWeight: "500",
  },
  "geist-mono": {
    fontFamily:
      '"Geist Mono", "SFMono-Regular", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    fontWeight: "400",
  },
  "ibm-plex-mono": {
    fontFamily:
      '"IBM Plex Mono", "SFMono-Regular", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    fontWeight: "500",
  },
  "fira-code": {
    fontFamily:
      '"Fira Code", "SFMono-Regular", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    fontWeight: "400",
  },
  "soehne-mono": {
    fontFamily:
      '"Geist Mono", "SF Mono", "SFMono-Regular", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    fontWeight: "400",
  },
  "roboto-mono": {
    fontFamily:
      '"Roboto Mono", "SFMono-Regular", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    fontWeight: "400",
  },
  "commit-mono": {
    fontFamily:
      '"JetBrains Mono", "SFMono-Regular", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    fontWeight: "400",
  },
  "space-mono": {
    fontFamily:
      '"Space Mono", "SFMono-Regular", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    fontWeight: "400",
  },
  "source-code-pro": {
    fontFamily:
      '"Source Code Pro", "SFMono-Regular", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    fontWeight: "400",
  },
  "google-sans-code": {
    fontFamily:
      '"Roboto Mono", "SFMono-Regular", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    fontWeight: "400",
  },
};

/** Returns true if the theme has a dark variant. */
function getIsDark(theme: Theme, darkMode: boolean): boolean {
  const hasDark = !!theme.syntax?.dark;
  const hasLight = !!theme.syntax?.light;
  if (hasDark && !hasLight) return true;
  if (hasLight && !hasDark) return false;
  return darkMode;
}

/**
 * Frame renderer for canvas-based video export.
 * Renders slides with animations using frame-based timing.
 */
export class FrameRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private options: FrameRenderOptions;
  private state: FrameRenderState;

  constructor(options: FrameRenderOptions, state: FrameRenderState) {
    this.options = {
      devicePixelRatio: 1,
      ...options,
    };
    this.state = state;

    if (typeof window === "undefined") {
      throw new Error(
        "FrameRenderer requires a browser environment with canvas support",
      );
    }

    this.canvas = document.createElement("canvas");
    this.canvas.width =
      this.options.width * (this.options.devicePixelRatio || 1);
    this.canvas.height =
      this.options.height * (this.options.devicePixelRatio || 1);

    const ctx = this.canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Failed to get canvas 2D context");
    }

    this.ctx = ctx;
    if (this.options.devicePixelRatio) {
      this.ctx.scale(
        this.options.devicePixelRatio,
        this.options.devicePixelRatio,
      );
    }
  }

  /** Render a single frame to canvas. */
  async renderFrame(frameNumber: number): Promise<void> {
    const { width, height } = this.options;
    const { slides, theme, darkMode } = this.state;

    this.ctx.fillStyle = "#000000";
    this.ctx.fillRect(0, 0, width, height);

    const slideIndex = Math.min(
      Math.floor(frameNumber / SLIDE_DURATION),
      Math.max(slides.length - 1, 0),
    );
    const slide = slides[slideIndex];

    if (!slide || !theme) {
      return;
    }

    const isDark = getIsDark(theme, darkMode);
    const bgFrom = theme.background?.from || "#333";
    const bgTo = theme.background?.to || "#111";

    const gradient = this.ctx.createLinearGradient(0, 0, width * 0.7, height);
    gradient.addColorStop(0, bgFrom);
    gradient.addColorStop(1, bgTo);
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, width, height);

    this.renderSlide(slide, isDark, theme);
    this.renderProgressBar(slideIndex, slides.length);

    const slideOpacity = Math.min(frameNumber / 10, 1);
    if (slideOpacity < 1) {
      this.ctx.fillStyle = `rgba(0, 0, 0, ${1 - slideOpacity})`;
      this.ctx.fillRect(0, 0, width, height);
    }
  }

  private renderSlide(
    slide: FrameRenderState["slides"][number],
    isDark: boolean,
    theme: Theme,
  ): void {
    const { width, height } = this.options;
    const padding = this.state.padding || 30;

    const themeSyntax = isDark ? theme.syntax?.dark : theme.syntax?.light;
    const themeFont = theme.font || "jetbrains-mono";
    const fontStyles =
      VIDEO_FONT_STYLE_MAP[themeFont] || VIDEO_FONT_STYLE_MAP["jetbrains-mono"];

    this.ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
    this.ctx.fillRect(
      padding,
      padding,
      width - padding * 2,
      height - padding * 2,
    );

    this.ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(
      padding,
      padding,
      width - padding * 2,
      height - padding * 2,
    );

    this.ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
    this.ctx.fillRect(padding, padding, width - padding * 2, 40);

    this.ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    this.ctx.font = "12px system-ui";
    this.ctx.fillText(slide.title || "code", padding + 12, padding + 26);

    this.ctx.fillStyle = (themeSyntax as any)?.["--ray-foreground"] || "#ffffff";
    this.ctx.font = `${fontStyles.fontWeight} 16px ${fontStyles.fontFamily}`;
    this.ctx.textBaseline = "top";

    const codeX = padding + 12;
    const codeY = padding + 50;
    const lineHeight = 24;
    const lines = slide.code.split("\n");

    lines
      .slice(0, Math.floor((height - padding * 2 - 50) / lineHeight))
      .forEach((line, index) => {
        this.ctx.fillText(line || " ", codeX, codeY + index * lineHeight);
      });
  }

  private renderProgressBar(slideIndex: number, totalSlides: number): void {
    const { width } = this.options;
    const barHeight = 2;
    const barWidth =
      width *
      (Math.min(slideIndex + 1, totalSlides) / Math.max(totalSlides, 1));

    this.ctx.fillStyle = "rgba(100, 200, 255, 0.8)";
    this.ctx.fillRect(0, 0, barWidth, barHeight);
  }

  /** Get the rendered frame as an ImageBitmap. */
  async getFrame(): Promise<ImageBitmap> {
    return createImageBitmap(this.canvas);
  }

  /** Get the underlying canvas. */
  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  /** Cleanup resources. */
  destroy(): void {
    // Canvas will be garbage collected.
  }
}

/**
 * Create a frame renderer and render a single frame.
 */
export async function renderFrame(
  frameNumber: number,
  options: FrameRenderOptions,
  state: FrameRenderState,
): Promise<ImageBitmap> {
  const renderer = new FrameRenderer(options, state);
  await renderer.renderFrame(frameNumber);
  const bitmap = await renderer.getFrame();
  renderer.destroy();
  return bitmap;
}
