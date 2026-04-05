export interface EncoderChunk {
  data: ArrayBuffer;
  timestamp: number; // µs
  isKeyframe: boolean;
}

export class VideoFrameEncoder {
  private encoder: VideoEncoder;
  private chunks: EncoderChunk[] = [];
  private error: Error | null = null;
  private initPromise: Promise<void>;

  constructor(
    private readonly width: number,
    private readonly height: number,
    private readonly fps: number,
  ) {
    this.encoder = new VideoEncoder({
      output: (chunk) => {
        const buffer = new ArrayBuffer(chunk.byteLength);
        chunk.copyTo(buffer);
        this.chunks.push({
          data: buffer,
          timestamp: chunk.timestamp,
          isKeyframe: chunk.type === "key",
        });
      },
      error: (e) => {
        this.error = e;
      },
    });

    this.initPromise = this.init();
  }

  private async init() {
    const config: VideoEncoderConfig = {
      codec: "vp09.00.10.08",
      width: this.width,
      height: this.height,
      bitrate: 8_000_000,
      framerate: this.fps,
      latencyMode: "quality",
    };

    const support = await VideoEncoder.isConfigSupported(config);
    if (!support.supported) {
      throw new Error(
        `VP9 VideoEncoder config not supported in this browser. ` +
          `Try Chrome 94+ or Edge 94+.`,
      );
    }

    this.encoder.configure(config);
  }

  async ready() {
    await this.initPromise;
    if (this.error) throw this.error;
  }

  async encodeFrame(
    bitmap: ImageBitmap,
    timestampUs: number,
    forceKeyframe = false,
  ) {
    if (this.error) throw this.error;

    const frame = new VideoFrame(bitmap, { timestamp: timestampUs });
    this.encoder.encode(frame, { keyFrame: forceKeyframe });
    frame.close();
    bitmap.close();

    await this.encoder.flush();
  }

  async flush(): Promise<EncoderChunk[]> {
    await this.encoder.flush();
    if (this.error) throw this.error;
    return this.chunks;
  }

  close() {
    this.encoder.close();
  }
}

/**
 * Check if the WebCodecs VideoEncoder API is available in this browser.
 */
export function isWebCodecsSupported(): boolean {
  return (
    typeof VideoEncoder !== "undefined" && typeof VideoFrame !== "undefined"
  );
}
