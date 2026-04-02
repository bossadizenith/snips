"use client";

import { useAtomValue, useSetAtom } from "jotai";
import { useEffect } from "react";
import { slidesAtom } from "@/store";
import { addSlideAtom } from "@/store/slide";
import { toast } from "@/components/ui/toast";
import useModal from "@/store/modal";

export const GlobalHotkeys = () => {
  const addSlide = useSetAtom(addSlideAtom);
  const slides = useAtomValue(slidesAtom);
  const { onOpen } = useModal();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isN = event.code === "KeyN";
      const isS = event.code === "KeyS";
      const isM = event.code === "KeyM";
      const isK = event.code === "KeyK";

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
        (isCtrlOrMeta && isShift && isN) ||
        (!isInputFocused && isShift && isN) ||
        (isAlt && isS) ||
        (isCtrlOrMeta && isM);

      if ((event.key === "?" && !isInputFocused) || (isCtrlOrMeta && isK)) {
        event.preventDefault();
        onOpen("shortcuts");
        return;
      }

      if (shouldTrigger) {
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

    window.addEventListener("keydown", handleKeyDown, { capture: true });

    const previousHandler = window.onkeydown;
    window.onkeydown = (e) => {
      handleKeyDown(e as unknown as KeyboardEvent);
      if (previousHandler)
        (previousHandler as (ev: KeyboardEvent) => void)(
          e as unknown as KeyboardEvent,
        );
    };

    return () => {
      window.removeEventListener("keydown", handleKeyDown, { capture: true });
      window.onkeydown = previousHandler;
    };
  }, [slides.length, addSlide]);

  return null;
};
