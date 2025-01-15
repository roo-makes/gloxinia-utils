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

export type EncodeVideoOptions = {
  input: string;
  output: string;
  fps: number;
  height: number;
  width: number;
};
