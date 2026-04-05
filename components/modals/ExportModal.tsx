"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  exportBlobAtom,
  exportModalOpenAtom,
  exportProgressAtom,
  isExportingAtom,
} from "@/store/export";
import { downloadBlob } from "@/lib/videoExport/exportEngine";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { CheckCircle2, Download, Film, Loader2, X } from "lucide-react";
import React from "react";

export const ExportModal = () => {
  const [isOpen, setIsOpen] = useAtom(exportModalOpenAtom);
  const isExporting = useAtomValue(isExportingAtom);
  const progress = useAtomValue(exportProgressAtom);
  const blob = useAtomValue(exportBlobAtom);
  const setIsOpen2 = useSetAtom(exportModalOpenAtom);

  const handleClose = () => {
    // Don't allow closing mid-export
    if (isExporting) return;
    setIsOpen(false);
  };

  const handleDownload = () => {
    if (!blob) return;
    downloadBlob(blob, "snips-export.webm");
  };

  const progressPercent =
    progress.totalFrames > 0
      ? Math.round((progress.framesEncoded / progress.totalFrames) * 100)
      : 0;

  const isDone = progress.stage === "done";
  const isError = progress.stage === "error";
  const isMuxing = progress.stage === "muxing";

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md w-full p-0 overflow-hidden border-neutral-800 bg-neutral-950 shadow-2xl">
        <div className="p-8 flex flex-col gap-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-neutral-800 rounded-lg">
                <Film className="size-5 text-white" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-white tracking-tight">
                  Export Video
                </h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  WebM · 1920×1080 · 30fps
                </p>
              </div>
            </div>
            {!isExporting && (
              <button
                onClick={handleClose}
                className="p-1.5 rounded-md text-neutral-500 hover:text-white hover:bg-neutral-800 transition-colors"
                aria-label="Close"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          {/* Progress section */}
          <div className="flex flex-col gap-3">
            {/* Status line */}
            <div className="flex items-center gap-2">
              {isDone ? (
                <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
              ) : isError ? (
                <X className="size-4 text-red-400 shrink-0" />
              ) : (
                <Loader2 className="size-4 text-blue-400 shrink-0 animate-spin" />
              )}
              <span className="text-sm text-neutral-300 font-medium">
                {isError ? (progress.error ?? "An error occurred") : progress.message}
              </span>
            </div>

            {/* Progress bar */}
            {!isDone && !isError && (
              <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: isMuxing ? "100%" : `${progressPercent}%`,
                    background:
                      "linear-gradient(90deg, #3b82f6, #8b5cf6)",
                    animation: isMuxing ? "pulse 1s ease-in-out infinite" : undefined,
                  }}
                />
              </div>
            )}

            {/* Stats */}
            {!isDone && !isError && progress.stage === "encoding" && (
              <div className="flex items-center justify-between text-xs text-neutral-500">
                <span>
                  Slide {progress.currentSlide} of {progress.totalSlides}
                </span>
                <span>
                  {progress.framesEncoded} / {progress.totalFrames} frames
                </span>
              </div>
            )}
          </div>

          {/* Done state */}
          {isDone && blob && (
            <div className="flex flex-col gap-3">
              <div className="rounded-lg bg-emerald-950/40 border border-emerald-800/30 px-4 py-3">
                <p className="text-sm text-emerald-300">
                  Your video is ready! Click below to download it.
                </p>
              </div>
              <button
                onClick={handleDownload}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-white text-black text-sm font-semibold hover:bg-neutral-100 transition-colors"
              >
                <Download className="size-4" />
                Download snips-export.webm
              </button>
            </div>
          )}

          {/* Error state */}
          {isError && (
            <div className="rounded-lg bg-red-950/40 border border-red-800/30 px-4 py-3">
              <p className="text-sm text-red-300">
                {progress.error ?? "Something went wrong during export. Please try again."}
              </p>
            </div>
          )}

          {/* Info note */}
          {progress.stage === "preparing" && (
            <p className="text-xs text-neutral-600 leading-relaxed">
              The first export may take a moment while fonts and styles are
              serialised. Subsequent exports in this session will be faster.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
