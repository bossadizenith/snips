"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { downloadBlob } from "@/lib/videoExport/exportEngine";
import { DEFAULT_EXPORT_CONFIG } from "@/lib/videoExport/types";
import {
  exportBlobAtom,
  exportModalOpenAtom,
  exportProgressAtom,
  isExportingAtom,
} from "@/store/export";
import { useAtom, useAtomValue } from "jotai";
import { CheckCircle2, Download, Film, Loader2, X } from "lucide-react";

export const ExportModal = () => {
  const [isOpen, setIsOpen] = useAtom(exportModalOpenAtom);
  const isExporting = useAtomValue(isExportingAtom);
  const progress = useAtomValue(exportProgressAtom);
  const blob = useAtomValue(exportBlobAtom);

  const handleClose = () => {
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
      <DialogContent className="max-w-md w-full p-0 overflow-hidden">
        <div className="p-8 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-secondary rounded-lg">
                <Film className="size-5 text-foreground" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-foreground tracking-tight">
                  Export Video
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  WebM · 1920×1080 ·{" "}
                  {DEFAULT_EXPORT_CONFIG.TRANSITION_CAPTURE_FPS}fps
                </p>
              </div>
            </div>
          </div>

          {/* Progress section */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              {isDone ? (
                <CheckCircle2 className="size-4 text-chart-1 shrink-0" />
              ) : isError ? (
                <X className="size-4 text-destructive shrink-0" />
              ) : (
                <Loader2 className="size-4 text-chart-2 shrink-0 animate-spin" />
              )}
              <span className="text-sm text-foreground font-medium">
                {isError
                  ? (progress.error ?? "An error occurred")
                  : progress.message}
              </span>
            </div>

            {!isDone && !isError && (
              <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: isMuxing ? "100%" : `${progressPercent}%`,
                    background:
                      "linear-gradient(90deg, var(--chart-3), var(--chart-2))",
                    animation: isMuxing
                      ? "pulse 1s ease-in-out infinite"
                      : undefined,
                  }}
                />
              </div>
            )}

            {!isDone && !isError && progress.stage === "encoding" && (
              <div className="flex items-center justify-between text-xs text-muted-foreground">
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
              <div className="rounded-lg bg-muted border border-border px-4 py-3">
                <p className="text-sm text-foreground">
                  Your video is ready! Click below to download it.
                </p>
              </div>
              <button
                onClick={handleDownload}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                <Download className="size-4" />
                Download snips-export.webm
              </button>
            </div>
          )}

          {/* Error state */}
          {isError && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3">
              <p className="text-sm text-destructive">
                {progress.error ??
                  "Something went wrong during export. Please try again."}
              </p>
            </div>
          )}

          {progress.stage === "preparing" && (
            <p className="text-xs text-muted-foreground leading-relaxed">
              The first export may take a moment while fonts and styles are
              serialised. Subsequent exports in this session will be faster.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
