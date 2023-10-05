interface DefaultsConfig {
  [index: string]: number;
}

const defaultsConfig: DefaultsConfig = {
  crf: 30,
  bitrate: 50000,
  fps: 60,
};

export { DefaultsConfig };

export default defaultsConfig;
