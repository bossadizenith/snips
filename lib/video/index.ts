/**
 * Video export library
 * Exports for frame rendering and video encoding
 */

export { FrameRenderer, renderFrame } from "./frame-renderer";
export type { FrameRenderOptions, FrameRenderState } from "./frame-renderer";

export {
  WebCodecsEncoder,
  encodeFramesWebCodecs,
  WebCodecsStreamEncoder,
  isWebCodecsSupported,
} from "./export-web";
export type { WebCodecsExportOptions } from "./export-web";

export { VideoExporter, exportVideo } from "./exporter";
export type { VideoExporterOptions, FrameRenderProgress } from "./exporter";
