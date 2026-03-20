import { PADDING_OPTIONS } from "@/store/padding";
import { THEMES } from "@/store/themes";
import { LANGUAGES } from "@/utils/languages";
import { NextResponse } from "next/server";

export async function GET() {
  const languages = Object.entries(LANGUAGES).map(
    ([key, { src, ...rest }]) => ({ id: key, ...rest }),
  );
  const themes = Object.entries(THEMES).map(
    ([key, { syntax, icon, ...rest }]) => ({ ...rest }),
  );
  const padding = PADDING_OPTIONS;
  return NextResponse.json({ languages, themes, padding });
}
