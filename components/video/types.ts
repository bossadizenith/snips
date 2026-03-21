import { Slide as BaseSlide } from "@/store";
import { Theme } from "@/store/themes";
import { Language } from "@/utils/languages";

export interface Token {
  content: string;
  color?: string;
  fontStyle?: string | number;
}

export interface Slide extends BaseSlide {
  tokens?: Token[][];
}

export interface CodeCompositionProps {
  slides: Slide[];
  theme: Theme;
  darkMode: boolean;
  language: Language | null;
  padding: number;
  windowWidth: number | null;
}

export interface SlideTimeline {
  id: string;
  startFrame: number;
  endFrame: number;
  durationInFrames: number;
}
