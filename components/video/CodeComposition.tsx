import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { CodeCompositionProps } from "./types";
import { VideoSlideRender } from "./VideoSlideRender";
import { ProgressBar } from "./ProgressBar";

const SLIDE_DURATION = 90; // 3 seconds at 30fps

export const CodeComposition: React.FC<CodeCompositionProps> = (props) => {
  const { slides } = props;
  const frame = useCurrentFrame();
  const currentSlideIndex = Math.floor(frame / SLIDE_DURATION);

  return (
    <AbsoluteFill className="bg-black">
      <ProgressBar
        slidesCount={slides.length}
        slideIndex={currentSlideIndex}
        durationPerSlide={SLIDE_DURATION}
      />
      <VideoSlideRender {...props} />
    </AbsoluteFill>
  );
};
