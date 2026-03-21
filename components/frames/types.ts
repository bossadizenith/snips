import { Theme } from "@/store/themes";
import { Language } from "@/utils/languages";
import React from "react";
export interface FrameProps {
  children?: React.ReactNode;
  padding?: number;
  showBackground?: boolean;
  fileName?: string;
  themeBackground?: string;
  theme?: Theme;
  darkMode?: boolean;
  code?: string;
  language?: Language | null;
}
