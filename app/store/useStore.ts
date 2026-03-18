import { create } from "zustand";

export const SHIKI_THEMES = [
  "one-dark-pro",
  "github-dark",
  "dracula",
  "min-dark",
  "vitesse-dark",
] as const;

export type ShikiTheme = (typeof SHIKI_THEMES)[number];

export interface Slide {
  id: string;
  title: string;
  code: string;
  notes?: string;
}

interface SnipsStore {
  slides: Slide[];
  currentSlideIndex: number;
  theme: ShikiTheme;
  duration: number;
  fontSize: number;
  showLineNumbers: boolean;

  // Actions
  addSlide: (fromIndex?: number) => void;
  removeSlide: (id: string) => void;
  updateSlide: (id: string, updates: Partial<Slide>) => void;
  setCurrentSlideIndex: (index: number) => void;
  setTheme: (theme: ShikiTheme) => void;
  setDuration: (duration: number) => void;
  setFontSize: (size: number) => void;
  setShowLineNumbers: (show: boolean) => void;
}

export const useSnipsStore = create<SnipsStore>((set) => ({
  slides: [
    { id: "1", title: "Slide 1", code: "// Start typing your code here..." },
  ],
  currentSlideIndex: 0,
  theme: "one-dark-pro",
  duration: 1.5,
  fontSize: 14,
  showLineNumbers: true,

  addSlide: (fromIndex) =>
    set((state) => {
      const index =
        fromIndex !== undefined ? fromIndex : state.currentSlideIndex;
      const sourceSlide = state.slides[index];
      const newSlide: Slide = {
        id: Math.random().toString(36).substr(2, 9),
        title: `${sourceSlide?.title || "Slide"} (Copy)`,
        code: sourceSlide?.code || "",
        notes: sourceSlide?.notes || "",
      };

      const newSlides = [...state.slides];
      newSlides.splice(index + 1, 0, newSlide);

      return {
        slides: newSlides,
        currentSlideIndex: index + 1,
      };
    }),

  removeSlide: (id) =>
    set((state) => {
      if (state.slides.length <= 1) return state;
      const newSlides = state.slides.filter((s) => s.id !== id);
      const newIndex = Math.min(state.currentSlideIndex, newSlides.length - 1);
      return { slides: newSlides, currentSlideIndex: newIndex };
    }),

  updateSlide: (id, updates) =>
    set((state) => ({
      slides: state.slides.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    })),

  setCurrentSlideIndex: (index) => set({ currentSlideIndex: index }),
  setTheme: (theme) => set({ theme }),
  setDuration: (duration) => set({ duration }),
  setFontSize: (fontSize) => set({ fontSize }),
  setShowLineNumbers: (showLineNumbers) => set({ showLineNumbers }),
}));
