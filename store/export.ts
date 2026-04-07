import { atom } from "jotai";
import { atomWithHash } from "jotai-location";
import type { ExportProgress } from "@/lib/videoExport/types";
import { DEFAULT_EXPORT_CONFIG } from "@/lib/videoExport/types";

const initialProgress: ExportProgress = {
  stage: "idle",
  currentSlide: 0,
  totalSlides: 0,
  framesEncoded: 0,
  totalFrames: 0,
  message: "",
};

export const isExportingAtom = atom<boolean>(false);

export const exportProgressAtom = atom<ExportProgress>(initialProgress);

export const exportBlobAtom = atom<Blob | null>(null);

export const exportModalOpenAtom = atom<boolean>(false);

export const exportFPSAtom = atomWithHash<number>("fps", DEFAULT_EXPORT_CONFIG.FPS);

export const exportHoldDurationAtom = atomWithHash<number>(
  "hold",
  DEFAULT_EXPORT_CONFIG.HOLD_DURATION_MS,
);

export const exportTransitionDurationAtom = atomWithHash<number>(
  "transition",
  DEFAULT_EXPORT_CONFIG.TRANSITION_DURATION_MS,
);

export type Resolution = {
  id: string;
  name: string;
  width: number;
  height: number;
};

export const RESOLUTIONS: Resolution[] = [
  { id: "1080p", name: "1080p (1920×1080)", width: 1920, height: 1080 },
  { id: "720p", name: "720p (1280×720)", width: 1280, height: 720 },
  { id: "square", name: "Square (1080×1080)", width: 1080, height: 1080 },
  { id: "vertical", name: "Vertical (1080×1920)", width: 1080, height: 1920 },
];

export const exportResolutionAtom = atomWithHash<Resolution>(
  "res",
  RESOLUTIONS[0],
  {
    serialize: (val) => val.id,
    deserialize: (id) => RESOLUTIONS.find((r) => r.id === id) || RESOLUTIONS[0],
  },
);
