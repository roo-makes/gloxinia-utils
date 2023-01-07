import { Size } from "../types/common";

interface GetVideoParamsMatrixOptions {
  crfs: number[];
  bitrates: number[];
  fpses?: number[];
  sizes?: Size[];
}

const getVideoParamsMatrix = (options: {
  crfs: number[];
  bitrates: number[];
  fpses?: number[];
  sizes?: Size[];
}) => {
  const {
    crfs,
    bitrates,
    fpses = [30],
    sizes = [{ width: 720, height: 1280 }],
  } = options;

  return crfs.flatMap((crf) => {
    return bitrates.flatMap((bitrate) => {
      return fpses.flatMap((fps) => {
        return sizes.flatMap((size) => {
          return {
            crf,
            bitrate,
            fps,
            size,
          };
        });
      });
    });
  });
};

export default getVideoParamsMatrix;
