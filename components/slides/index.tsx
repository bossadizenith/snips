import { Button } from "@/components/ui/button";
import { activeSlideIdAtom, slidesAtom } from "@/store";
import {
  addSlideAtom,
  initializeSlidesAtom,
  selectSlideAtom,
} from "@/store/slide";
import { useAtomValue, useSetAtom } from "jotai";
import Link from "next/link";
import React from "react";
import { Icons } from "@/components/icons";

export const Slides = () => {
  const slides = useAtomValue(slidesAtom);
  const activeSlideId = useAtomValue(activeSlideIdAtom);

  const initializeSlides = useSetAtom(initializeSlidesAtom);
  const selectSlide = useSetAtom(selectSlideAtom);
  const addSlide = useSetAtom(addSlideAtom);

  React.useEffect(() => {
    initializeSlides();
  }, [initializeSlides]);

  return (
    <aside className="h-screen w-(--sidebar-width) border-l border-gray-2 p-4 flex flex-col bg-sidebar shrink-0 overflow-y-auto">
      <div className="flex flex-col gap-2 flex-1">
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
      </div>
      <div className="flex justify-end">
        <Link href={"/"}>
          <Icons.github className="size-6 text-muted-foreground" />
        </Link>
      </div>
    </aside>
  );
};
