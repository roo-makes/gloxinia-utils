import { Subscriber } from "rxjs";

function isFfmpegError(line: string): boolean {
  // FFmpeg informational lines that contain "unknown" but aren't errors
  const informationalPatterns = [
    /muxing overhead: unknown/i,
    /Unknown AVPixelFormat/i,
    /Unknown AVSampleFormat/i,
  ];

  // Skip informational lines
  if (informationalPatterns.some((pattern) => pattern.test(line))) {
    return false;
  }

  // Actual error patterns
  const errorKeywords = [
    "Error",
    "error",
    "failed",
    "Failed",
    "Invalid",
    "invalid",
    "No such file",
    "Permission denied",
    "Unrecognized option",
    "Error splitting",
    "Cannot",
    "cannot",
    "impossible",
    "Impossible",
  ];
  return errorKeywords.some((keyword) => line.includes(keyword));
}

function extractProgress(line: string): string | null {
  // FFmpeg progress format: frame=  123 fps= 45 q=28.0 size=    1024kB time=00:00:05.12 bitrate=1638.4kbits/s speed=1.5x
  const match = line.match(
    /frame=\s*(\d+).*?fps=\s*([\d.]+).*?time=([\d:\.]+).*?bitrate=\s*([\d.]+)\s*(\w+).*?speed=\s*([\d.]+)x/
  );

  if (match) {
    const [, frame, fps, time, bitrate, bitrateUnit, speed] = match;
    return `Progress: frame ${frame}, ${fps} fps, time ${time}, bitrate ${bitrate} ${bitrateUnit}, speed ${speed}x`;
  }

  // Fallback: if it looks like a progress line, show it
  if (line.includes("frame=") && line.includes("time=")) {
    return `Progress: ${line.trim()}`;
  }

  return null;
}

export function parseFfmpegLogs(
  output: string,
  isStderr: boolean,
  subscriber: Subscriber<string>
) {
  const lines = output.split("\n").filter((line) => line.trim());

  lines.forEach((line) => {
    if (isStderr) {
      // Only emit errors and progress, ignore everything else (metadata)
      if (isFfmpegError(line)) {
        subscriber.error(new Error(`FFmpeg error: ${line}`));
      } else {
        const progress = extractProgress(line);
        if (progress) {
          subscriber.next(progress);
        }
      }
    } else {
      // stdout is rare, but emit non-empty lines
      if (line.trim()) {
        subscriber.next(line);
      }
    }
  });
}
