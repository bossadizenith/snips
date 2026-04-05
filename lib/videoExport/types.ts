import type { Theme } from "@/store/themes";
import type { Language } from "@/utils/languages";

export type { Theme, Language };

export interface ExportSlide {
  id: string;
  title: string;
  code: string;
}

export interface ExportConfig {
  slides: ExportSlide[];
  theme: Theme;
  darkMode: boolean;
  language: Language | null;
  padding: number;
  showBackground: boolean;
  holdDuration: number;
  transitionDuration: number;
  fps: number;
  width: number;
  height: number;
}

export type ExportStage =
  | "idle"
  | "preparing"
  | "encoding"
  | "muxing"
  | "done"
  | "error";

export interface ExportProgress {
  stage: ExportStage;
  currentSlide: number;
  totalSlides: number;
  framesEncoded: number;
  totalFrames: number;
  message: string;
  error?: string;
}

export const DEFAULT_EXPORT_CONFIG = {
  HOLD_DURATION_MS: 2000,
  TRANSITION_DURATION_MS: 1000,
  FPS: 30,
  WIDTH: 1920,
  HEIGHT: 1080,
} as const;
