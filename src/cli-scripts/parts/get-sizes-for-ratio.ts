import { Size } from "../types/common";
import defaultSizes, { SizesConfig } from "../config/sizes";

const convertSizesConfigToDecimal = (sizesConfig: SizesConfig): SizesConfig => {
  return Object.keys(sizesConfig).reduce((acc: SizesConfig, ratio) => {
    const [widthStr, heightStr] = ratio.split(":");
    const width = parseInt(widthStr);
    const height = parseInt(heightStr);

    acc[getRoundedString(width / height)] = sizesConfig[ratio];
    return acc;
  }, {});
};

const getRoundedString = (input: number): string =>
  String(Math.round(input * 1000) / 1000);

const getSizesForRatio = (ratio: number): Size[] => {
  const ratioKey = getRoundedString(ratio);
  const decimalDefaultSizes = convertSizesConfigToDecimal(defaultSizes);

  const widths = decimalDefaultSizes[ratioKey];

  return widths.map((width) => ({
    width,
    height: width / ratio,
  }));
};

export default getSizesForRatio;
