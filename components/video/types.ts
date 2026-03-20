import { Slide } from "@/store/slide";
import { Theme } from "@/store/themes";
import { Language } from "@/utils/languages";

export interface CodeCompositionProps {
  slides: Slide[];
  theme: Theme;
  darkMode: boolean;
  language: Language | null;
  padding: number;
}

export interface SlideTimeline {
  id: string;
  startFrame: number;
  endFrame: number;
  durationInFrames: number;
}
