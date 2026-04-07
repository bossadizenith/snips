"use client";

import { Button } from "@/components/ui/button";
import { activeSlideIdAtom, type Slide, slidesAtom } from "@/store";
import { addSlideAtom, reorderSlidesAtom } from "@/store/slide";
import { useAtomValue, useSetAtom } from "jotai";
import { Plus } from "lucide-react";
import { Reorder, useDragControls } from "motion/react";
import React, { useCallback, useState } from "react";
import { SlideItem } from "./SlideItem";
import styles from "./slides.module.css";

function DraggableSlide({
  slide,
  index,
  isActive,
  totalSlides,
}: {
  slide: Slide;
  index: number;
  isActive: boolean;
  totalSlides: number;
}) {
  const controls = useDragControls();
  const [isDragging, setIsDragging] = useState(false);

  return (
    <Reorder.Item
      value={slide}
      dragListener={false}
      dragControls={controls}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={() => setIsDragging(false)}
      style={{ listStyle: "none" }}
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.15 }}
    >
      <SlideItem
        slide={slide}
        index={index}
        isActive={isActive}
        isDragging={isDragging}
        totalSlides={totalSlides}
        dragControls={{
          onPointerDown: (e) => controls.start(e),
        }}
      />
    </Reorder.Item>
  );
}

export const SlidesPanel: React.FC = () => {
  const slides = useAtomValue(slidesAtom);
  const activeSlideId = useAtomValue(activeSlideIdAtom);
  const addSlide = useSetAtom(addSlideAtom);
  const reorderSlides = useSetAtom(reorderSlidesAtom);

  const handleReorder = useCallback(
    (reordered: Slide[]) => {
      reorderSlides(reordered);
    },
    [reorderSlides],
  );

  const handleAddSlide = useCallback(() => {
    addSlide({ title: `Slide ${slides.length + 1}`, code: "" });
  }, [addSlide, slides.length]);

  return (
    <div className="flex flex-col gap-2 flex-1 min-h-0">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Slides</h2>
        <div className="flex items-center gap-2">
          <span className={styles.slideCount}>
            {slides.length} / 10
          </span>
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            disabled={slides.length >= 10}
            onClick={handleAddSlide}
            aria-label="Add new slide"
          >
            <Plus className="size-3.5" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        <Reorder.Group
          axis="y"
          values={slides}
          onReorder={handleReorder}
          style={{ display: "flex", flexDirection: "column", gap: 4 }}
        >
          {slides.map((slide, index) => (
            <DraggableSlide
              key={slide.id}
              slide={slide}
              index={index}
              isActive={slide.id === activeSlideId}
              totalSlides={slides.length}
            />
          ))}
        </Reorder.Group>
      </div>
    </div>
  );
};
