import { atom } from "jotai";
import { codeAtom } from "./code";
import {
  fileNameAtom,
  Slide,
  slidesAtom,
  activeSlideIdAtom,
  animateSlideTransitionAtom,
} from ".";
import { selectedLanguageAtom } from "./code";
import formatCode from "@/utils/formatCode";

type SlidePatch = {
  title?: string;
  code?: string;
};

function createSlideId() {
  return `slide-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeSlideTitle(title: string) {
  const trimmed = title.trim() || "";
  return trimmed.length > 0 ? trimmed : "Untitled Slide";
}

export const activeSlideAtom = atom((get) => {
  const activeSlideId = get(activeSlideIdAtom);
  if (!activeSlideId) return null;
  return get(slidesAtom).find((slide) => slide.id === activeSlideId) ?? null;
});

export const initializeSlidesAtom = atom(null, (get, set) => {
  if (get(slidesAtom).length > 0) return;

  const slide: Slide = {
    id: createSlideId(),
    title: normalizeSlideTitle(get(fileNameAtom)),
    code: get(codeAtom),
  };

  set(slidesAtom, [slide]);
  set(activeSlideIdAtom, slide.id);
});

export const addSlideAtom = atom(null, (get, set, patch?: SlidePatch) => {
  const slides = get(slidesAtom);
  if (slides.length >= 10) return;

  const slide: Slide = {
    id: createSlideId(),
    title: normalizeSlideTitle(patch?.title ?? get(fileNameAtom)),
    code: patch?.code ?? get(codeAtom),
  };

  set(slidesAtom, (prev) => [...prev, slide]);
  set(activeSlideIdAtom, slide.id);
  set(animateSlideTransitionAtom, true);
  set(fileNameAtom, slide.title);
  set(codeAtom, slide.code);
});

export const selectSlideAtom = atom(null, (get, set, slideId: string) => {
  const slide = get(slidesAtom).find((item) => item.id === slideId);
  if (!slide) return;

  set(activeSlideIdAtom, slide.id);
  set(animateSlideTransitionAtom, true);
  set(fileNameAtom, slide.title);
  set(codeAtom, slide.code);
});

export const updateActiveSlideAtom = atom(
  null,
  (get, set, patch: SlidePatch) => {
    const activeSlideId = get(activeSlideIdAtom);
    if (!activeSlideId) return;

    set(slidesAtom, (prev) =>
      prev.map((slide) => {
        if (slide.id !== activeSlideId) return slide;
        return {
          ...slide,
          title: normalizeSlideTitle(patch.title ?? slide.title),
          code: patch.code ?? slide.code,
        };
      }),
    );
  },
);

export const goToNextSlideAtom = atom(null, (get, set) => {
  const slides = get(slidesAtom);
  const activeSlideId = get(activeSlideIdAtom);
  const currentIndex = slides.findIndex((slide) => slide.id === activeSlideId);
  if (currentIndex !== -1 && currentIndex < slides.length - 1) {
    set(selectSlideAtom, slides[currentIndex + 1].id);
  }
});

export const goToPrevSlideAtom = atom(null, (get, set) => {
  const slides = get(slidesAtom);
  const activeSlideId = get(activeSlideIdAtom);
  const currentIndex = slides.findIndex((slide) => slide.id === activeSlideId);
  if (currentIndex > 0) {
    set(selectSlideAtom, slides[currentIndex - 1].id);
  }
});

export const deleteSlideAtom = atom(null, (get, set, slideId: string) => {
  const slides = get(slidesAtom);
  if (slides.length <= 1) return;

  const index = slides.findIndex((s) => s.id === slideId);
  if (index === -1) return;

  const wasActive = get(activeSlideIdAtom) === slideId;
  const nextSlides = slides.filter((s) => s.id !== slideId);
  set(slidesAtom, nextSlides);

  if (wasActive) {
    const nextIndex = Math.min(index, nextSlides.length - 1);
    set(selectSlideAtom, nextSlides[nextIndex].id);
  }
});

export const duplicateSlideAtom = atom(null, (get, set, slideId: string) => {
  const slides = get(slidesAtom);
  if (slides.length >= 10) return;

  const source = slides.find((s) => s.id === slideId);
  if (!source) return;

  const index = slides.indexOf(source);
  const clone: Slide = {
    id: createSlideId(),
    title: normalizeSlideTitle(`${source.title} (copy)`),
    code: source.code,
  };

  const nextSlides = [...slides];
  nextSlides.splice(index + 1, 0, clone);
  set(slidesAtom, nextSlides);
  set(selectSlideAtom, clone.id);
});

export const reorderSlidesAtom = atom(
  null,
  (_get, set, reordered: Slide[]) => {
    set(slidesAtom, reordered);
  },
);

export const renameSlideAtom = atom(
  null,
  (get, set, { slideId, title }: { slideId: string; title: string }) => {
    const normalized = normalizeSlideTitle(title);

    set(slidesAtom, (prev) =>
      prev.map((slide) =>
        slide.id === slideId ? { ...slide, title: normalized } : slide,
      ),
    );

    if (get(activeSlideIdAtom) === slideId) {
      set(fileNameAtom, normalized);
    }
  },
);

export const formatAllSlidesAtom = atom(null, async (get, set) => {
  const slides = get(slidesAtom);
  const selectedLanguage = get(selectedLanguageAtom);
  const activeSlideId = get(activeSlideIdAtom);

  if (!selectedLanguage || slides.length === 0) return;

  const formattedSlides = await Promise.all(
    slides.map(async (slide) => {
      const formattedCode = await formatCode(slide.code, selectedLanguage);
      return { ...slide, code: formattedCode };
    }),
  );

  set(slidesAtom, formattedSlides);

  // Sync current code atom if the active slide was updated
  const updatedActiveSlide = formattedSlides.find(
    (s) => s.id === activeSlideId,
  );
  if (updatedActiveSlide) {
    set(codeAtom, updatedActiveSlide.code);
    // Enforce the original language to prevent hljs auto-detection from changing it
    set(selectedLanguageAtom, selectedLanguage);
  }
});
