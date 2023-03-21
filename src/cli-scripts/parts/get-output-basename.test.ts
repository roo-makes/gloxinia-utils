import getOutputBasename from "./get-output-basename";

test("should get a proper directory structure for a freestyle vid", () => {
  const result = getOutputBasename("shady-nightclub-freestyle-1.mov");

  result;

  const resultParts = result.split("/");

  expect(resultParts).toHaveLength(4);
  expect(resultParts[0]).toBe("shady");
  expect(resultParts[1]).toBe("nightclub");
  expect(resultParts[2]).toBe("freestyle");
  expect(resultParts[3]).toBe("1");
});

test("should get a proper directory structure for a cfront vid", () => {
  const result = getOutputBasename(
    "shady-nightclub-gameplay-idle-cfront-1.mov"
  );

  result;

  const resultParts = result.split("/");

  expect(resultParts).toHaveLength(5);
  expect(resultParts[0]).toBe("shady");
  expect(resultParts[1]).toBe("nightclub");
  expect(resultParts[2]).toBe("gameplay");
  expect(resultParts[3]).toBe("idle-cfront");
  expect(resultParts[4]).toBe("1");
});
