import { OutputVideoFormat, Size } from "../types/common";
import defaults from "../config/defaults";

interface GetVideoParamsMatrixOptions {
  crfs?: number[];
  bitrates?: number[];
  fpses?: number[];
  sizes?: Size[];
}

const getVideoParamsMatrix = (
  options: GetVideoParamsMatrixOptions,
  format: OutputVideoFormat
) => {
  const defaultsForFormat = defaults[format];

  const {
    crfs = [defaultsForFormat.crf],
    bitrates = [defaultsForFormat.bitrate],
    fpses = [defaultsForFormat.fps],
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
