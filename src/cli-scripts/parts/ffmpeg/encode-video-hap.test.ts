import encodeVideoHap from "./encode-video-hap";

test("executes expected command", () => {
  const result = encodeVideoHap({
    input: "/path/to/input.mov",
    output: "/path/to/output.mov",
    fps: 30,
    height: 1000,
    width: 1000,
  });

  result.subscribe((str) => {
    console.log(str);
  });

  // expect(Array.isArray(result)).toBeTruthy;
  // expect(typeof result[0]).toBe("object");
  // expect(result).toHaveLength(4);
  // expect(result.filter((res) => res.crf === 10)).toHaveLength(2);
});
