/**
 * WebCodecs-based video export pipeline
 * Encodes frames to H.264 on the client side
 */

export interface WebCodecsExportOptions {
  fps: number;
  duration: number; // in seconds
  width: number;
  height: number;
  bitrate?: number;
}

interface VideoEncoderInit {
  codec: string;
  width: number;
  height: number;
  bitrate: number;
  framerate: number;
}

interface VideoEncoderEncodeOptions {
  keyFrame?: boolean;
}

/**
 * Checks if WebCodecs API is available in the current browser
 */
export function isWebCodecsSupported(): boolean {
  try {
    return (
      typeof window !== "undefined" &&
      "VideoEncoder" in window &&
      "VideoFrame" in window &&
      "Muxer" in window
    );
  } catch {
    return false;
  }
}

/**
 * WebCodecs video encoder wrapper
 * Encodes frames into H.264 video chunks
 */
export class WebCodecsEncoder {
  private encoder: any;
  private chunks: EncodedVideoChunk[] = [];
  private frameCount = 0;
  private options: WebCodecsExportOptions;
  private initialized = false;

  constructor(options: WebCodecsExportOptions) {
    this.options = {
      bitrate: 2500000, // 2.5 Mbps default
      ...options,
    };
  }

  /**
   * Initialize the video encoder
   * Must be called before encoding frames
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    if (!isWebCodecsSupported()) {
      throw new Error("WebCodecs API is not supported in this browser");
    }

    const VideoEncoder = (window as any).VideoEncoder;

    const init: VideoEncoderInit = {
      codec: "avc1.640028", // H.264 high profile
      width: this.options.width,
      height: this.options.height,
      bitrate: this.options.bitrate || 2500000,
      framerate: this.options.fps,
    };

    this.encoder = new VideoEncoder({
      output: (chunk: EncodedVideoChunk) => {
        this.chunks.push(chunk);
      },
      error: (error: Error) => {
        console.error("VideoEncoder error:", error);
        throw error;
      },
    });

    await this.encoder.configure(init);
    this.initialized = true;
  }

  /**
   * Encode a frame
   * @param imageBitmap The frame to encode
   * @param timestamp Timestamp in microseconds
   */
  async encodeFrame(
    imageBitmap: ImageBitmap,
    frameNumber: number,
    keyFrame: boolean = false,
  ): Promise<void> {
    if (!this.initialized) {
      throw new Error("Encoder not initialized. Call initialize() first.");
    }

    const timestamp = (frameNumber / this.options.fps) * 1_000_000; // Convert to microseconds

    const VideoFrame = (window as any).VideoFrame;
    const frame = new VideoFrame(imageBitmap, { timestamp });

    const encodeOptions: VideoEncoderEncodeOptions = {
      keyFrame,
    };

    await this.encoder.encode(frame, encodeOptions);
    frame.close();

    this.frameCount++;
  }

  /**
   * Finalize encoding and get the encoded chunks
   */
  async finalize(): Promise<EncodedVideoChunk[]> {
    if (!this.initialized) {
      throw new Error("Encoder not initialized.");
    }

    await this.encoder.flush();
    return this.chunks;
  }

  /**
   * Get encoded chunks as a Blob
   * Requires mp4box library for proper muxing
   */
  async getBlob(): Promise<Blob> {
    const chunks = await this.finalize();

    // For now, return raw encoded data as Blob
    // In production, use mp4box to mux into proper MP4 container
    const data = new Uint8Array(
      chunks.reduce((acc, chunk) => acc + chunk.byteLength, 0),
    );
    let offset = 0;

    for (const chunk of chunks) {
      const array = new Uint8Array(chunk.byteLength);
      chunk.copyTo(array);
      data.set(array, offset);
      offset += array.length;
    }

    return new Blob([data], { type: "video/mp4" });
  }

  /**
   * Get the encoded chunks for external muxing
   */
  getChunks(): EncodedVideoChunk[] {
    return this.chunks;
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.encoder && this.initialized) {
      this.encoder.close();
      this.initialized = false;
    }
  }
}

/**
 * Encode a sequence of frames using WebCodecs
 * @param frames Array of ImageBitmap frames
 * @param options Export options
 * @returns Blob ready for download
 */
export async function encodeFramesWebCodecs(
  frames: ImageBitmap[],
  options: WebCodecsExportOptions,
): Promise<Blob> {
  const encoder = new WebCodecsEncoder(options);

  try {
    await encoder.initialize();

    // Encode keyframe every 60 frames (approximately every 1 second at 60fps)
    for (let i = 0; i < frames.length; i++) {
      const isKeyFrame = i % 60 === 0;
      await encoder.encodeFrame(frames[i], i, isKeyFrame);
    }

    return await encoder.getBlob();
  } finally {
    encoder.destroy();
  }
}

/**
 * Stream-based encoding for large videos
 * Encodes frames on-the-fly and returns chunks as they're encoded
 */
export class WebCodecsStreamEncoder {
  private encoder: WebCodecsEncoder;
  private onChunk: (chunk: EncodedVideoChunk) => void;

  constructor(
    options: WebCodecsExportOptions,
    onChunk: (chunk: EncodedVideoChunk) => void,
  ) {
    this.encoder = new WebCodecsEncoder(options);
    this.onChunk = onChunk;
  }

  async initialize(): Promise<void> {
    await this.encoder.initialize();
  }

  async encodeFrame(
    imageBitmap: ImageBitmap,
    frameNumber: number,
    keyFrame: boolean = false,
  ): Promise<void> {
    await this.encoder.encodeFrame(imageBitmap, frameNumber, keyFrame);
    const chunks = this.encoder.getChunks();
    if (chunks.length > 0) {
      const lastChunk = chunks[chunks.length - 1];
      this.onChunk(lastChunk);
      // TODO: remove processed chunks to avoid memory buildup
    }
  }

  async finalize(): Promise<void> {
    await this.encoder.finalize();
  }

  destroy(): void {
    this.encoder.destroy();
  }
}
