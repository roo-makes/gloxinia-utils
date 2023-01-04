import getVideoParamsMatrix from "./get-video-params-matrix";

test("returns something", () => {
  const result = getVideoParamsMatrix({
    crfs: [10, 20],
    bitrates: [2000, 3000],
    dimensions: [
      {
        width: 720,
        height: 1280,
      },
    ],
  });

  expect(Array.isArray(result)).toBeTruthy;
  expect(typeof result[0]).toBe("object");
  expect(result).toHaveLength(4);
  expect(result.filter((res) => res.crf === 10)).toHaveLength(2);
});
