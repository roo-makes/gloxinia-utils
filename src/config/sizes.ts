interface SizesConfig {
  [index: string]: number[];
}

const sizesConfig: SizesConfig = {
  "3:4": [240, 360, 480, 600, 720, 960],

  "1:1": [1080, 960, 720],

  "4:3": [],

  "3:2": [],

  "16:9": [1280, 1920],
};

export { SizesConfig };

export default sizesConfig;
