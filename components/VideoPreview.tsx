"use client";

import React from "react";
import { VideoPreviewCanvas } from "./VideoPreviewCanvas";

export function VideoPreview() {
  return <VideoPreviewCanvas autoPlay controls loop />;
}
