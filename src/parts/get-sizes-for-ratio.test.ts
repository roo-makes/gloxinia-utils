import getSizesForRatio from "./get-sizes-for-ratio";

jest.mock("../config/sizes.ts", () => ({
  "3:4": [3, 6, 9],
  "1:1": [100],
  "16:9": [1280, 1920],
}));

test("properly converts sizes", () => {
  const result = getSizesForRatio(1200 / 1600);

  expect(result).toHaveLength(3);
  expect(result[0]).toStrictEqual({ width: 3, height: 4 });
});
