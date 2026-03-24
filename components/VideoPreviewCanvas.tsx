/**
 * Canvas-based video preview component
 * Replaces Remotion Player for browser preview
 */

"use client";

import React, { useEffect, useRef, useState } from "react";
import { useAtomValue } from "jotai";
import { slidesAtom } from "@/store";
import { themeAtom, darkModeAtom } from "@/store/themes";
import { selectedLanguageAtom } from "@/store/code";
import { paddingAtom } from "@/store/padding";
import type { CodeCompositionProps } from "@/components/video/types";

const SLIDE_DURATION = 90; // frames per slide at 60fps
const FPS = 60;
const COMPOSITION_WIDTH = 1920;
const COMPOSITION_HEIGHT = 1080;
const DISPLAY_WIDTH = 960; // Max width for preview

interface VideoPreviewProps {
  autoPlay?: boolean;
  loop?: boolean;
  controls?: boolean;
}

export function VideoPreviewCanvas(props: VideoPreviewProps) {
  const { autoPlay = true, loop = true, controls = true } = props;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  const slides = useAtomValue(slidesAtom);
  const theme = useAtomValue(themeAtom);
  const darkMode = useAtomValue(darkModeAtom);
  const language = useAtomValue(selectedLanguageAtom);
  const padding = useAtomValue(paddingAtom);

  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const totalFrames = useRef(SLIDE_DURATION * Math.max(slides.length, 1));
  const lastTimeRef = useRef(Date.now());

  // Animation loop
  useEffect(() => {
    if (!isPlaying) {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    const animate = () => {
      const now = Date.now();
      const deltaTime = (now - lastTimeRef.current) / 1000; // seconds
      lastTimeRef.current = now;

      setCurrentFrame((prev) => {
        let next = prev + deltaTime * FPS;

        if (loop) {
          next = next % totalFrames.current;
        } else {
          next = Math.min(next, totalFrames.current - 1);
          if (next >= totalFrames.current - 1) {
            setIsPlaying(false);
          }
        }

        return next;
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [isPlaying, loop]);

  // Canvas drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const slideIndex = Math.min(
      Math.floor(currentFrame / SLIDE_DURATION),
      Math.max(slides.length - 1, 0),
    );

    const slide = slides[slideIndex];

    if (!slide || !theme) {
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      return;
    }

    // Background
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw simple slide preview
    const bgFrom = theme.background?.from || "#333";
    const bgTo = theme.background?.to || "#111";
    const gradient = ctx.createLinearGradient(
      0,
      0,
      canvas.width * 0.7,
      canvas.height,
    );
    gradient.addColorStop(0, bgFrom);
    gradient.addColorStop(1, bgTo);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Frame area
    const margin = 30;
    ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
    ctx.fillRect(
      margin,
      margin,
      canvas.width - margin * 2,
      canvas.height - margin * 2,
    );
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 1;
    ctx.strokeRect(
      margin,
      margin,
      canvas.width - margin * 2,
      canvas.height - margin * 2,
    );

    // Title bar
    ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
    ctx.fillRect(margin, margin, canvas.width - margin * 2, 40);

    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.font = "12px system-ui";
    ctx.fillText(slide.title || "code", margin + 12, margin + 26);

    // Code text
    const isDark = darkMode || !theme.syntax?.light;
    const themeSyntax =
      (isDark ? theme.syntax?.dark : theme.syntax?.light) ||
      theme.syntax?.light ||
      theme.syntax?.dark ||
      {};

    ctx.fillStyle = (themeSyntax as any)?.["--ray-foreground"] || "#ffffff";
    ctx.font = "500 16px 'JetBrains Mono', monospace";
    ctx.textBaseline = "top";

    const codeX = margin + 12;
    const codeY = margin + 50;
    const lineHeight = 24;
    const lines = slide.code.split("\n");

    lines
      .slice(0, Math.floor((canvas.height - margin * 2 - 50) / lineHeight))
      .forEach((line: string, index: number) => {
        ctx.fillText(line || " ", codeX, codeY + index * lineHeight);
      });

    // Progress bar
    const barHeight = 2;
    const barWidth =
      canvas.width *
      (Math.min(slideIndex + 1, slides.length) / Math.max(slides.length, 1));
    ctx.fillStyle = "rgba(100, 200, 255, 0.8)";
    ctx.fillRect(0, 0, barWidth, barHeight);

    // Fade-in effect
    const opacity = Math.min(currentFrame / 10, 1);
    if (opacity < 1) {
      ctx.fillStyle = `rgba(0, 0, 0, ${1 - opacity})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, [currentFrame, slides, theme, darkMode, padding]);

  const handleCanvasClick = () => {
    setIsPlaying(!isPlaying);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const rect = container.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    setCurrentFrame(
      Math.max(
        0,
        Math.min(percent * totalFrames.current, totalFrames.current - 1),
      ),
    );
  };

  const progress = (currentFrame / totalFrames.current) * 100;

  return (
    <div className="flex flex-col items-center justify-center w-full h-full gap-4">
      <div
        className="rounded-xl overflow-hidden shadow-2xl bg-black cursor-pointer hover:opacity-90 transition-opacity"
        style={{
          width: "100%",
          maxWidth: DISPLAY_WIDTH,
          aspectRatio: "16/9",
        }}
        onClick={handleCanvasClick}
      >
        <canvas
          ref={canvasRef}
          width={COMPOSITION_WIDTH}
          height={COMPOSITION_HEIGHT}
          style={{
            width: "100%",
            height: "100%",
            display: "block",
          }}
        />
      </div>

      {controls && (
        <div
          className="flex flex-col items-center gap-2 w-full"
          style={{ maxWidth: DISPLAY_WIDTH }}
        >
          {/* Progress bar */}
          <div
            className="w-full h-1 bg-gray-700 rounded cursor-pointer"
            onClick={handleProgressClick}
          >
            <div
              className="h-full bg-blue-500 transition-all rounded"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? "⏸" : "▶"}
            </button>

            {loop && (
              <span className="text-xs text-gray-400 ml-2">
                Frame {Math.floor(currentFrame)} / {totalFrames.current}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
