"use client";

import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useEffect, useCallback } from "react";
import { presentationModeAtom, showBackgroundAtom, slidesAtom } from "@/store";
import {
  addSlideAtom,
  goToNextSlideAtom,
  goToPrevSlideAtom,
} from "@/store/slide";
import {
  darkModeAtom,
  themeAtom,
  THEMES,
  unlockedThemesAtom,
} from "@/store/themes";
import { selectedLanguageAtom } from "@/store/code";
import { LANGUAGES } from "@/utils/languages";
import { toast } from "@/components/ui/toast";
import useModal from "@/store/modal";

export const GlobalHotkeys = () => {
  const slides = useAtomValue(slidesAtom);
  const addSlide = useSetAtom(addSlideAtom);
  const [currentTheme, setTheme] = useAtom(themeAtom);
  const [darkMode, setDarkMode] = useAtom(darkModeAtom);
  const [showBackground, setShowBackground] = useAtom(showBackgroundAtom);
  const [selectedLanguage, setSelectedLanguage] = useAtom(selectedLanguageAtom);
  const [presentationMode, setPresentationMode] = useAtom(presentationModeAtom);
  const [unlockedThemes] = useAtom(unlockedThemesAtom);

  const goToNextSlide = useSetAtom(goToNextSlideAtom);
  const goToPrevSlide = useSetAtom(goToPrevSlideAtom);
  const { onOpen } = useModal();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isN = event.code === "KeyN";
      const isK = event.code === "KeyK";
      const isC = event.code === "KeyC";
      const isB = event.code === "KeyB";
      const isD = event.code === "KeyD";
      const isL = event.code === "KeyL";
      const isF5 = event.code === "F5";
      const isEsc = event.code === "Escape";
      const isRight = event.code === "ArrowRight";
      const isLeft = event.code === "ArrowLeft";

      const isCtrlOrMeta = event.ctrlKey || event.metaKey;
      const isAlt = event.altKey;
      const isShift = event.shiftKey;

      const target = event.target as HTMLElement;
      const isInputFocused =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable ||
        target.closest(".cm-editor") !== null;

      if (isCtrlOrMeta && isShift && isN) {
        event.preventDefault();
        if (slides.length >= 10) {
          toast.error("Maximum 10 slides allowed");
          return;
        }
        const nextSlideNumber = slides.length + 1;
        addSlide({ title: `Slide ${nextSlideNumber}`, code: "" });
        toast.success(`Created Slide ${nextSlideNumber}`);
        return;
      }

      if (isCtrlOrMeta && isK) {
        event.preventDefault();
        onOpen("shortcuts");
        return;
      }

      if (isInputFocused) return;

      if (event.key === "?") {
        event.preventDefault();
        onOpen("shortcuts");
        return;
      }

      if (isShift && isN) {
        event.preventDefault();
        if (slides.length >= 10) {
          toast.error("Maximum 10 slides allowed");
          return;
        }
        const nextSlideNumber = slides.length + 1;
        addSlide({ title: `Slide ${nextSlideNumber}`, code: "" });
        toast.success(`Created Slide ${nextSlideNumber}`);
        return;
      }

      if (isB) {
        event.preventDefault();
        setShowBackground((prev) => !prev);
        return;
      }

      if (isD) {
        event.preventDefault();
        const hasLightMode = !!currentTheme.syntax.light;
        const hasDarkMode = !!currentTheme.syntax.dark;
        if (hasLightMode && hasDarkMode) {
          setDarkMode((prev) => !prev);
        } else {
          toast.error("Theme does not support dark mode toggle");
        }
        return;
      }

      if (isC) {
        event.preventDefault();
        const availableThemes = Object.values(THEMES).filter(
          (t) => unlockedThemes.includes(t.id) || !t.hidden,
        );
        const currentIndex = availableThemes.findIndex(
          (t) => t.id === currentTheme.id,
        );
        const nextTheme =
          availableThemes[(currentIndex + 1) % availableThemes.length];
        setTheme(nextTheme);
        return;
      }

      if (isL) {
        event.preventDefault();
        const availableLanguages = Object.values(LANGUAGES);
        const currentIndex = availableLanguages.findIndex(
          (l) => l.name === selectedLanguage?.name,
        );
        const nextLang =
          availableLanguages[(currentIndex + 1) % availableLanguages.length];
        setSelectedLanguage(nextLang);
        return;
      }

      if (isF5) {
        event.preventDefault();
        setPresentationMode((prev) => !prev);
        return;
      }

      if (isEsc && presentationMode) {
        event.preventDefault();
        setPresentationMode(false);
        return;
      }

      if (isRight && presentationMode) {
        event.preventDefault();
        goToNextSlide();
        return;
      }

      if (isLeft && presentationMode) {
        event.preventDefault();
        goToPrevSlide();
        return;
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
  }, [
    slides.length,
    addSlide,
    currentTheme,
    setTheme,
    setDarkMode,
    setShowBackground,
    selectedLanguage,
    setSelectedLanguage,
    presentationMode,
    setPresentationMode,
    unlockedThemes,
    goToNextSlide,
    goToPrevSlide,
    onOpen,
  ]);

  return null;
};
