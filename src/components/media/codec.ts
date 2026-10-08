"use client";
// Whether this device decodes AV1 in hardware. The reels ship as AV1 WebM (small) and H.264
// MP4 (decoded in hardware almost everywhere). A browser that merely *supports* AV1 picks the
// WebM first, and without a hardware decoder that means software decoding on the main CPU:
// several reels at once then starve scrolling and animation. So the WebM is only offered where
// the decoder reports itself power-efficient (i.e. hardware); everyone else gets the MP4.

let av1: Promise<boolean> | undefined;

export function av1Efficient(): Promise<boolean> {
  av1 ??= (async () => {
    try {
      const info = await navigator.mediaCapabilities?.decodingInfo({
        type: "file",
        video: { contentType: 'video/webm; codecs="av01.0.05M.08"', width: 1080, height: 1920, bitrate: 3_000_000, framerate: 30 },
      });
      return Boolean(info?.supported && info.powerEfficient);
    } catch {
      return false;
    }
  })();
  return av1;
}
