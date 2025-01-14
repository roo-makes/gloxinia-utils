interface SizesConfig {
  [index: string]: number[];
}

/**
 * Widths for each aspect ratio
 */
const sizesConfig: SizesConfig = {
  "3:4": [480, 720, 960],

  "1:1": [1280, 960],

  "16:9": [1280, 1920],
};

export { SizesConfig };

export default sizesConfig;
