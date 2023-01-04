interface Dimension {
  width: number;
  height: number;
}

interface GetVideoParamsMatrixOptions {
  crfs: number[];
  bitrates: number[];
  fpses?: number[];
  dimensions?: Dimension[];
}

const getVideoParamsMatrix = (options: {
  crfs: number[];
  bitrates: number[];
  fpses?: number[];
  dimensions?: Dimension[];
}) => {
  const {
    crfs,
    bitrates,
    fpses = [30],
    dimensions = [{ width: 720, height: 1280 }],
  } = options;

  return crfs.flatMap((crf) => {
    return bitrates.flatMap((bitrate) => {
      return fpses.flatMap((fps) => {
        return dimensions.flatMap((dimension) => {
          return {
            crf,
            bitrate,
            fps,
            dimension,
          };
        });
      });
    });
  });
};

export default getVideoParamsMatrix;
