"use client";

import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { isWebCodecsSupported } from "@/lib/videoExport/encoder";
import {
  buildExportConfig,
  runExport,
  type ExportRendererHandle,
} from "@/lib/videoExport/exportEngine";
import { showBackgroundAtom, slidesAtom } from "@/store";
import { codeAtom, selectedLanguageAtom } from "@/store/code";
import {
  exportBlobAtom,
  exportModalOpenAtom,
  exportProgressAtom,
  isExportingAtom,
} from "@/store/export";
import { paddingAtom } from "@/store/padding";
import { themeAtom, themeDarkModeAtom } from "@/store/themes";
import { useAtomValue, useSetAtom } from "jotai";
import { Film } from "lucide-react";
import React, { useCallback, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { toast } from "sonner";
import { ExportRenderer } from "./ExportRenderer";

const ExportButton: React.FC = () => {
  const slides = useAtomValue(slidesAtom);
  const theme = useAtomValue(themeAtom);
  const darkMode = useAtomValue(themeDarkModeAtom);
  const language = useAtomValue(selectedLanguageAtom);
  const padding = useAtomValue(paddingAtom);
  const showBackground = useAtomValue(showBackgroundAtom);
  const code = useAtomValue(codeAtom);

  const setIsExporting = useSetAtom(isExportingAtom);
  const setProgress = useSetAtom(exportProgressAtom);
  const setBlob = useSetAtom(exportBlobAtom);
  const setModalOpen = useSetAtom(exportModalOpenAtom);

  const rendererRef = useRef<ExportRendererHandle | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const [rendererMounted, setRendererMounted] = useState(false);

  const handleExport = useCallback(async () => {
    if (!isWebCodecsSupported()) {
      toast.error(
        "Video export requires WebCodecs API, which is not supported in this browser. Please use Chrome 94+ or Edge 94+.",
        { duration: 6000 },
      );
      return;
    }

    if (slides.length === 0) {
      toast.error("No slides to export.");
      return;
    }

    abortControllerRef.current = new AbortController();
    setBlob(null);
    setIsExporting(true);
    setModalOpen(true);
    setProgress({
      stage: "preparing",
      currentSlide: 0,
      totalSlides: slides.length,
      framesEncoded: 0,
      totalFrames: 0,
      message: "Preparing renderer…",
    });

    setRendererMounted(true);

    await new Promise((resolve) => setTimeout(resolve, 100));

    const config = buildExportConfig({
      slides,
      theme,
      darkMode,
      language,
      padding,
      showBackground,
    });

    try {
      if (!rendererRef.current) {
        throw new Error("Renderer not ready. Please try again.");
      }

      const blob = await runExport(
        config,
        rendererRef.current,
        (progress) => setProgress(progress),
        abortControllerRef.current.signal,
      );

      setBlob(blob);
      setProgress((prev) => ({
        ...prev,
        stage: "done",
        message: "Export complete!",
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      if (message === "Export cancelled") {
        setProgress((prev) => ({
          ...prev,
          stage: "idle",
          message: "Export cancelled",
        }));
        setModalOpen(false);
      } else {
        setProgress((prev) => ({
          ...prev,
          stage: "error",
          message: "Export failed",
          error: message,
        }));
      }
    } finally {
      setIsExporting(false);
      setRendererMounted(false);
      abortControllerRef.current = null;
    }
  }, [
    slides,
    theme,
    darkMode,
    language,
    padding,
    showBackground,
    setBlob,
    setIsExporting,
    setModalOpen,
    setProgress,
  ]);

  const isExporting = useAtomValue(isExportingAtom);

  return (
    <>
      <ButtonGroup>
        <Button
          onClick={handleExport}
          disabled={isExporting || slides.length === 0}
          aria-label="Export as video"
          id="export-video-button"
        >
          <Film className="w-4 h-4" />
          {isExporting ? "Exporting…" : "Export Video"}
        </Button>
      </ButtonGroup>

      {rendererMounted &&
        typeof document !== "undefined" &&
        ReactDOM.createPortal(
          <ExportRenderer
            ref={rendererRef}
            theme={theme}
            darkMode={darkMode}
            language={language}
            padding={padding}
            showBackground={showBackground}
            initialCode={slides[0]?.code ?? code}
            width={1920}
            height={1080}
          />,
          document.body,
        )}
    </>
  );
};

export default ExportButton;
