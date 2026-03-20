import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { CodeCompositionProps } from "./types";

interface SlideRenderProps extends CodeCompositionProps {
  slideIndex: number;
  startFrame: number;
}

/**
 * @deprecated Use VideoSlideRender instead — this component depends on jotai
 * atoms that aren't available in the Remotion rendering context.
 */
export const SlideRender: React.FC<SlideRenderProps> = ({
  slides,
  slideIndex,
  startFrame,
}) => {
  const frame = useCurrentFrame();
  const slide = slides[slideIndex];

  // Simple fade transition
  const opacity = interpolate(
    frame,
    [startFrame, startFrame + 15],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ opacity }}>
      <div className="flex items-center justify-center w-full h-full bg-slate-900">
        <pre style={{ color: "#fff", fontFamily: "monospace", fontSize: 14, padding: 24 }}>
          {slide?.code ?? ""}
        </pre>
      </div>
    </AbsoluteFill>
  );
};
