import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";

interface ProgressBarProps {
  slidesCount: number;
  slideIndex: number;
  durationPerSlide: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  slidesCount,
  slideIndex,
  durationPerSlide,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div className="absolute top-4 left-4 right-4 flex gap-1 z-10">
      {Array.from({ length: slidesCount }).map((_, i) => {
        let progress = 0;
        if (i < slideIndex) {
          progress = 100;
        } else if (i === slideIndex) {
          progress = ((frame % durationPerSlide) / durationPerSlide) * 100;
        }

        return (
          <div
            key={i}
            className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden"
          >
            <div
              className="h-full bg-red-500 transition-all duration-75"
              style={{ width: `${progress}%` }}
            />
          </div>
        );
      })}
    </div>
  );
};
