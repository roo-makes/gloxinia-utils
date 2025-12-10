export type SizesConfig = {
  [index: string]: number[];
};

/**
 * Widths for each aspect ratio
 */
export const WIDTH_OPTIONS_BY_RATIO: SizesConfig = {
  "3:4": [480, 720, 960],

  "1:1": [1280, 960],

  "16:9": [1280, 1920],

  "4:3": [960, 720],
};

export const WIDTH_DEFAULTS_BY_RATIO: SizesConfig = {
  "3:4": [720],
  "1:1": [1280, 960],
  "16:9": [1280, 1920],
  "4:3": [960],
};

export const WIDTHS_BY_SUBSTRING: SizesConfig = {
  // General
  freestyle: [720],
  "basic-idle": [960, 720],
  basic: [720],
  special: [720],
  closeup: [960],

  // Nightclub
  "nightclub-cinematic|16:9": [1920],
  "nightclub-cinematic|3:4": [960],
  "nightclub-cinematic|1:1": [1080],

  // Highway Driving
  "highway-drivingfront": [960],
  "highway-drivingfront-bothhands": [1280, 960],
  "highway-drivingfront-honk": [1280, 960],
  "highway-drivingleft": [960],
  "highway-backdrop": [1920],
};
