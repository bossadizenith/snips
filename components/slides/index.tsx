import React from "react";
import { useAtomValue, useSetAtom } from "jotai";
import {
  addSlideAtom,
  activeSlideIdAtom,
  initializeSlidesAtom,
  selectSlideAtom,
  slidesAtom,
  updateActiveSlideAtom,
} from "@/store/slide";
import { codeAtom } from "@/store/code";
import { fileNameAtom } from "@/store";
import { Button } from "@/components/ui/button";

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
    <aside className="h-screen w-(--sidebar-width) border-l border-gray-2 p-4 bg-sidebar shrink-0 overflow-y-auto">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold">Slides</h2>
        <Button
          type="button"
          onClick={() =>
            addSlide({ title: `Slide ${slides.length + 1}`, code: "" })
          }
          className="rounded border border-gray-2 px-2 py-1 text-xs"
        >
          New
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        {slides.map((slide, index) => {
          const isActive = slide.id === activeSlideId;

          return (
            <Button
              key={slide.id}
              type="button"
              onClick={() => selectSlide(slide.id)}
              variant={isActive ? "default" : "outline"}
            >
              <span className="block truncate">
                {slide.title || `Slide ${index + 1}`}
              </span>
            </Button>
          );
        })}
      </div>
    </aside>
  );
};
