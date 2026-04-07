"use client";

import classNames from "classnames";

import { toast } from "@/components/ui/toast";
import useHotkeys from "@/hooks/useHotkeys";
import { highlighterAtom, presentationModeAtom, slidesAtom } from "@/store";
import { selectedLanguageAtom } from "@/store/code";
import {
  formatAllSlidesAtom,
  goToNextSlideAtom,
  goToPrevSlideAtom,
  addSlideAtom,
} from "@/store/slide";
import { formatterSupportedLanguages } from "@/utils/formatCode";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useEffect } from "react";
import getWasm from "shiki/wasm";

import { shikiTheme } from "@/store/themes";

import Frame from "@/components/Frame";
import FrameContextStore from "@/store/FrameContextStore";

import NoSSR from "@/components/NoSSR";
import styles from "./code.module.css";

import { LANGUAGES } from "@/utils/languages";
import { Highlighter, getHighlighterCore } from "shiki";

import { Slides } from "@/components/slides";
import tailwindDark from "@/public/assets/tailwind/dark.json";
import tailwindLight from "@/public/assets/tailwind/light.json";

export function Code() {
  const [highlighter, setHighlighter] = useAtom(highlighterAtom);
  const [presentationMode, setPresentationMode] = useAtom(presentationModeAtom);
  const goToNextSlide = useSetAtom(goToNextSlideAtom);
  const goToPrevSlide = useSetAtom(goToPrevSlideAtom);
  const formatAllSlides = useSetAtom(formatAllSlidesAtom);
  const addSlide = useSetAtom(addSlideAtom);
  const slides = useAtomValue(slidesAtom);
  const selectedLanguage = useAtomValue(selectedLanguageAtom);

  useEffect(() => {
    if (presentationMode) {
      const isSupportedLanguage = formatterSupportedLanguages.includes(
        selectedLanguage?.name || "",
      );

      if (isSupportedLanguage) {
        toast.promise(formatAllSlides(), {
          loading: "Formatting slides...",
          success: "Formatted all slides",
          error: "Failed to format slides",
        });
      }
    }
  }, [presentationMode, formatAllSlides, selectedLanguage]);

  useHotkeys("f5", (event) => {
    event.preventDefault();
    setPresentationMode((prev) => !prev);
  });

  useHotkeys("esc", () => {
    setPresentationMode(false);
  });

  useHotkeys("right", () => {
    goToNextSlide();
  });

  useHotkeys("left", () => {
    goToPrevSlide();
  });

  useEffect(() => {
    getHighlighterCore({
      themes: [shikiTheme, tailwindLight, tailwindDark],
      langs: [
        LANGUAGES.javascript.src(),
        LANGUAGES.tsx.src(),
        LANGUAGES.swift.src(),
        LANGUAGES.python.src(),
      ],
      loadWasm: getWasm,
    }).then((highlighter) => {
      setHighlighter(highlighter as Highlighter);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex h-screen w-screen overflow-hidden translate-z-0">
      <FrameContextStore>
        <main
          className={classNames(
            "flex-1 flex flex-col min-w-0 relative",
            presentationMode && styles.presentationMode,
          )}
        >
          <div className="flex-1 overflow-auto relative flex justify-center items-center">
            <div className={styles.app}>
              <NoSSR>
                {highlighter && <Frame />}
              </NoSSR>
            </div>
          </div>
        </main>
        {!presentationMode && <Slides />}
      </FrameContextStore>
    </div>
  );
}
