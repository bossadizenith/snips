import React from "react";
import { useAtomValue, useSetAtom } from "jotai";
import {
  addSlideAtom,
  activeSlideIdAtom,
  initializeSlidesAtom,
  selectSlideAtom,
  slidesAtom,
  updateActiveSlideAtom,
} from "../../store/slide";
import { codeAtom } from "../../store/code";
import { fileNameAtom } from "../../store";

export const Slides = () => {
  const slides = useAtomValue(slidesAtom);
  const activeSlideId = useAtomValue(activeSlideIdAtom);
  const code = useAtomValue(codeAtom);
  const title = useAtomValue(fileNameAtom);

  const initializeSlides = useSetAtom(initializeSlidesAtom);
  const selectSlide = useSetAtom(selectSlideAtom);
  const addSlide = useSetAtom(addSlideAtom);
  const updateActiveSlide = useSetAtom(updateActiveSlideAtom);

  React.useEffect(() => {
    initializeSlides();
  }, [initializeSlides]);

  React.useEffect(() => {
    if (!activeSlideId) return;
    updateActiveSlide({ title, code });
  }, [activeSlideId, title, code, updateActiveSlide]);

  return (
    <aside className="fixed top-0 h-screen z-50 w-60 border-r bg-background border-gray-2 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold">Slides</h2>
        <button
          type="button"
          onClick={() => addSlide({ title: `Slide ${slides.length + 1}`, code: "" })}
          className="rounded border border-gray-2 px-2 py-1 text-xs"
        >
          New
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {slides.map((slide, index) => {
          const isActive = slide.id === activeSlideId;

          return (
            <button
              key={slide.id}
              type="button"
              onClick={() => {
                console.log("slide", slide);
                selectSlide(slide.id);
              }}
              className={`rounded border cursor-pointer px-3 py-2 text-left text-sm ${isActive ? "border-foreground" : "border-gray-2"}`}
            >
              <span className="block truncate">{slide.title || `Slide ${index + 1}`}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
};
