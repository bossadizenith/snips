"use client";

import { useAtomValue, useSetAtom } from "jotai";
import { useEffect } from "react";
import { slidesAtom } from "@/store";
import { addSlideAtom } from "@/store/slide";
import { toast } from "@/components/ui/toast";

export const GlobalHotkeys = () => {
  const addSlide = useSetAtom(addSlideAtom);
  const slides = useAtomValue(slidesAtom);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // BRUTE-FORCE logic for New Slide
      // We check for:
      // - Ctrl+Shift+N / Cmd+Shift+N (Standard alternative, usually easier to override than Ctrl+N)
      // - Alt+S (Reliable fallback: "S" for Slide)
      // - Ctrl+M (Secondary redundant option)

      const isN = event.code === "KeyN";
      const isS = event.code === "KeyS";
      const isM = event.code === "KeyM";

      const isCtrlOrMeta = event.ctrlKey || event.metaKey;
      const isAlt = event.altKey;
      const isShift = event.shiftKey;

      const target = event.target as HTMLElement;
      const isInputFocused =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable;

      const shouldTrigger =
        (isCtrlOrMeta && isShift && isN) || // Ctrl+Shift+N
        (!isInputFocused && isShift && isN) || // Shift+N (when not typing)
        (isAlt && isS) || // Alt+S
        (isCtrlOrMeta && isM); // Ctrl+M

      if (shouldTrigger) {
        // Most aggressive interception possible
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        if (slides.length >= 10) {
          toast.error("Maximum 10 slides allowed");
          return;
        }

        const nextSlideNumber = slides.length + 1;
        addSlide({ title: `Slide ${nextSlideNumber}`, code: "" });
        toast.success(`Created Slide ${nextSlideNumber}`);
      }
    };

    // 1. Redundant Capture Phase Listener
    window.addEventListener("keydown", handleKeyDown, { capture: true });

    // 2. Secondary redundant fallback using the direct property assignment
    const previousHandler = window.onkeydown;
    window.onkeydown = (e) => {
      handleKeyDown(e as unknown as KeyboardEvent);
      if (previousHandler) (previousHandler as (ev: KeyboardEvent) => void)(e as unknown as KeyboardEvent);
    };

    return () => {
      window.removeEventListener("keydown", handleKeyDown, { capture: true });
      window.onkeydown = previousHandler;
    };
  }, [slides.length, addSlide]);

  return null;
};
