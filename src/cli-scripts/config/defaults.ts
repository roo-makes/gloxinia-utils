import { OutputVideoFormat } from "../types/common";

interface DefaultsConfig {
  [index: string]: number;
}

const defaultsConfig: Record<OutputVideoFormat, DefaultsConfig> = {
  webm: {
    crf: 30,
    bitrate: 50000,
    fps: 60,
  },
  webmNoAlpha: {
    crf: 22,
    bitrate: 20000,
    fps: 60,
  },
  hap: {
    crf: 30, // Ignored for HAP
    bitrate: 50000, // Ignored for HAP
    fps: 60,
  },
};

export default defaultsConfig;
