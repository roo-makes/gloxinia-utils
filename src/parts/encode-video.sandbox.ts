import path from "path";
import encodeVideo from "./encode-video";

const observable = encodeVideo({
  input: path.resolve(
    __dirname,
    "../../gloxinia-nongit/gloxinia-ready/animation.mov"
  ),
  output: path.resolve(
    __dirname,
    "../../gloxinia-nongit/gloxinia-done/animation.webm"
  ),
  fps: 30,
  crf: 10,
  bitrate: 2000,
  width: 720,
  height: 1280,
});

observable.subscribe((str) => console.log(str));
