import { atom } from "jotai";
import type { ExportProgress } from "@/lib/videoExport/types";

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
