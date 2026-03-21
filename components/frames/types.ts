import { Theme } from "@/store/themes";
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
}
