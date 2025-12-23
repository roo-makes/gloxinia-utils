import { WIDTHS_BY_SUBSTRING } from "../config/sizes";
import { Size, VideoInfo } from "../types/common";
import getSourceVideoInfo from "./get-source-video-info";

const matchesRatio = (size: Size, ratioSubstring: string) => {
  const [widthStr, heightStr] = ratioSubstring.split(":");
  const ratioWidth = parseInt(widthStr);
  const ratioHeight = parseInt(heightStr);
  // Avoid floating point comparison errors by cross-multiplying
  return size.width * ratioHeight === size.height * ratioWidth;
};

export const getSizesForInputFile = async (
  inputPath: string,
  videoInfo?: VideoInfo
) => {
  const { size } = videoInfo ?? (await getSourceVideoInfo(inputPath));
  const ratio = size.width / size.height;

  const widths: number[] = [];
  Object.keys(WIDTHS_BY_SUBSTRING).forEach((substringWithRatio) => {
    const [inputSubstring, ratioSubstring] = substringWithRatio.split("|");
    if (inputPath.includes(inputSubstring)) {
      if (ratioSubstring) {
        if (matchesRatio(size, ratioSubstring)) {
          widths.push(...WIDTHS_BY_SUBSTRING[substringWithRatio]);
        }
      } else {
        widths.push(...WIDTHS_BY_SUBSTRING[substringWithRatio]);
      }
    }
  });

  const deduplicatedWidths = [...new Set(widths)];

  return deduplicatedWidths.map((width) => ({
    width,
    height: width / ratio,
  }));
};
