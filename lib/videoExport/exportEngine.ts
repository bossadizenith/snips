import {
  captureElementAsImageBitmap,
  captureElementAsCanvas,
} from "./captureFrame";
import { VideoFrameEncoder } from "./encoder";
import { WebMVideoMuxer } from "./muxer";
import {
  DEFAULT_EXPORT_CONFIG,
  type ExportConfig,
  type ExportProgress,
} from "./types";

export type ProgressCallback = (progress: ExportProgress) => void;

export interface ExportRendererHandle {
  updateCode(code: string): Promise<void>;
  getElement(): HTMLElement | null;
}

const toUs = (ms: number) => Math.round(ms * 1000);

function sleepUntil(targetMs: number): Promise<void> {
  const remaining = targetMs - Date.now();
  if (remaining <= 0) return Promise.resolve();
  return new Promise((resolve) => setTimeout(resolve, remaining));
}

export async function runExport(
  config: ExportConfig,
  renderer: ExportRendererHandle,
  onProgress: ProgressCallback,
  signal?: AbortSignal,
): Promise<Blob> {
  const { slides, fps, width, height, holdDuration, transitionDuration } =
    config;

  const holdFrames = Math.round((holdDuration / 1000) * fps);
  const estimatedTransitionFrames = Math.round(
    (transitionDuration / 1000) * fps,
  );
  const totalEstimatedFrames =
    slides.length * holdFrames +
    Math.max(slides.length - 1, 0) * estimatedTransitionFrames;

  let framesEncoded = 0;
  let currentTimeMs = 0;

  const report = (
    stage: ExportProgress["stage"],
    currentSlide: number,
    message: string,
  ) => {
    onProgress({
      stage,
      currentSlide,
      totalSlides: slides.length,
      framesEncoded,
      totalFrames: totalEstimatedFrames,
      message,
    });
  };

  report("preparing", 0, "Initialising encoder…");

  const encoder = new VideoFrameEncoder(width, height, fps);
  await encoder.ready();

  const muxer = new WebMVideoMuxer(width, height, fps);

  const checkAbort = () => {
    if (signal?.aborted) throw new Error("Export cancelled");
  };

  report("preparing", 0, "Preparing first slide…");
  await renderer.updateCode(slides[0].code);
  for (let slideIndex = 0; slideIndex < slides.length; slideIndex++) {
    checkAbort();

    const slide = slides[slideIndex];
    const isLastSlide = slideIndex === slides.length - 1;

    report(
      "encoding",
      slideIndex + 1,
      `Encoding slide ${slideIndex + 1} of ${slides.length}…`,
    );

    const element = renderer.getElement();
    if (!element) throw new Error("ExportRenderer element not found");

    const canvas = await captureElementAsCanvas(element, width, height);

    for (let f = 0; f < holdFrames; f++) {
      checkAbort();
      const frameBitmap = await createImageBitmap(canvas);

      await encoder.encodeFrame(frameBitmap, toUs(currentTimeMs), f === 0);
      currentTimeMs += 1000 / fps;
      framesEncoded++;
    }

    if (!isLastSlide) {
      checkAbort();

      const nextSlide = slides[slideIndex + 1];

      const transitionDone = renderer.updateCode(nextSlide.code);

      await new Promise((r) =>
        requestAnimationFrame(() => requestAnimationFrame(r)),
      );

      const captureEl = renderer.getElement();
      if (!captureEl) break;

      const animations = captureEl.getAnimations({ subtree: true });

      animations.forEach((anim) => anim.pause());
      const transitionFrames = Math.round((transitionDuration / 1000) * fps);

      for (let f = 0; f < transitionFrames; f++) {
        checkAbort();

        const frameTimeMs = (f / transitionFrames) * transitionDuration;

        animations.forEach((anim) => {
          anim.currentTime = frameTimeMs;
        });
        const bitmap = await captureElementAsImageBitmap(
          captureEl,
          width,
          height,
        );

        await encoder.encodeFrame(bitmap, toUs(currentTimeMs));
        currentTimeMs += 1000 / fps;
        framesEncoded++;
      }

      animations.forEach((anim) => anim.finish());
      await transitionDone;

      const settledEl = renderer.getElement();
      if (settledEl) {
        const settledBitmap = await captureElementAsImageBitmap(
          settledEl,
          width,
          height,
        );
        await encoder.encodeFrame(settledBitmap, toUs(currentTimeMs));
        currentTimeMs += 1000 / fps;
        framesEncoded++;
      }
    }
  }

  report("muxing", slides.length, "Muxing video…");

  checkAbort();

  const chunks = await encoder.flush();
  encoder.close();

  for (const chunk of chunks) {
    muxer.addChunk(chunk);
  }

  const blob = muxer.finalize();

  report("done", slides.length, "Export complete!");

  return blob;
}

export function downloadBlob(blob: Blob, filename = "snips-export.webm") {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function buildExportConfig(
  overrides: Partial<ExportConfig> &
    Pick<
      ExportConfig,
      | "slides"
      | "theme"
      | "darkMode"
      | "language"
      | "padding"
      | "showBackground"
    >,
): ExportConfig {
  return {
    holdDuration: DEFAULT_EXPORT_CONFIG.HOLD_DURATION_MS,
    transitionDuration: DEFAULT_EXPORT_CONFIG.TRANSITION_DURATION_MS,
    fps: DEFAULT_EXPORT_CONFIG.FPS,
    width: DEFAULT_EXPORT_CONFIG.WIDTH,
    height: DEFAULT_EXPORT_CONFIG.HEIGHT,
    ...overrides,
  };
}
