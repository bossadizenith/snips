import { Muxer, ArrayBufferTarget } from "webm-muxer";
import type { EncoderChunk } from "./encoder";

export class WebMVideoMuxer {
  private muxer: Muxer<ArrayBufferTarget>;
  private target: ArrayBufferTarget;

  constructor(width: number, height: number, fps: number) {
    this.target = new ArrayBufferTarget();
    this.muxer = new Muxer({
      target: this.target,
      video: {
        codec: "V_VP9",
        width,
        height,
        frameRate: fps,
      },
    });
  }

  /**
   * Add an encoded video chunk to the mux.
   * @param chunk  Encoded chunk from VideoFrameEncoder
   */
  addChunk(chunk: EncoderChunk) {
    this.muxer.addVideoChunkRaw(
      new Uint8Array(chunk.data),
      chunk.isKeyframe ? "key" : "delta",
      chunk.timestamp,
    );
  }

  /**
   * Finalise the mux and return the resulting WebM file as a Blob.
   */
  finalize(): Blob {
    this.muxer.finalize();
    return new Blob([this.target.buffer], { type: "video/webm" });
  }
}
