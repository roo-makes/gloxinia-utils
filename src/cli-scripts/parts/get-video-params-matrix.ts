import { Size } from "../types/common";
import defaults from "../config/defaults";

interface GetVideoParamsMatrixOptions {
  crfs?: number[];
  bitrates?: number[];
  fpses?: number[];
  sizes?: Size[];
}

const getVideoParamsMatrix = (options: GetVideoParamsMatrixOptions) => {
  const {
    crfs = [defaults.crf],
    bitrates = [defaults.bitrate],
    fpses = [defaults.fps],
    sizes = [{ width: 960, height: 960 }],
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
