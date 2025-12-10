export type Size = {
  height: number;
  width: number;
};

export type VideoInfo = {
  size: Size;
  fps: number;
  duration: number;
};

export type OutputVideoFormat = "webm" | "hap";

export type QualitySettings = {
  crf: number;
  bitrate: number;
};

export type EncodeVideoOptions = {
  input: string;
  output: string;
  height: number;
  width: number;
  fps: number;
  qualitySettings?: QualitySettings;
};
