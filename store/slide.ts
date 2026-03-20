import { atom } from "jotai";
import { codeAtom } from "./code";
import { fileNameAtom } from ".";

export type Slide = {
  id: string;
  title: string;
  code: string;
};

type SlidePatch = {
  title?: string;
  code?: string;
};

function createSlideId() {
  return `slide-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeSlideTitle(title: string) {
  const trimmed = title.trim();
  return trimmed.length > 0 ? trimmed : "Untitled Slide";
}

export const slidesAtom = atom<Slide[]>([]);

export const activeSlideIdAtom = atom<string | null>(null);

export const animateSlideTransitionAtom = atom(false);

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

export const updateActiveSlideAtom = atom(null, (get, set, patch: SlidePatch) => {
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
});
