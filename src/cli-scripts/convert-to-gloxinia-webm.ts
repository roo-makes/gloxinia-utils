import prompts, { PromptObject } from "prompts";
import { getIntArrayFromStringList } from "./utils/get-int-array-from-string-list";
import encodeVideosWebm from "./parts/encode-videos-webm";
import gatherSourceFiles from "./parts/gather-source-files";
import getSizesForRatio from "./parts/get-sizes-for-ratio";
import getSourceVideoInfo from "./parts/get-source-video-info";
import { setupProgram } from "./utils/setup-program";
import { VideoInfo } from "./types/common";

type ResponseType = {
  crf: number[];
  fps: number[];
};

type VideoPathWithInfo = {
  path: string;
  videoInfo: VideoInfo;
};

const validateIntArray = (input: string): boolean | string => {
  try {
    getIntArrayFromStringList(input);
    return true;
  } catch (e) {
    return String(e);
  }
};

const getFileToVideoInfoMap = async (inputFiles: string[]) => {
  const fileToVideoInfoMap = new Map<string, VideoInfo>();
  for (const inputFile of inputFiles) {
    const videoInfo = await getSourceVideoInfo(inputFile);
    fileToVideoInfoMap.set(inputFile, videoInfo);
  }
  return fileToVideoInfoMap;
};

const getRatioToFilesMap = async (
  fileToVideoInfoMap: Map<string, VideoInfo>
) => {
  const ratioToFilesMap = new Map<number, VideoPathWithInfo[]>();

  for (const [path, videoInfo] of fileToVideoInfoMap.entries()) {
    const ratio = videoInfo.size.width / videoInfo.size.height;
    if (!ratioToFilesMap.has(ratio)) {
      ratioToFilesMap.set(ratio, []);
    }
    ratioToFilesMap.get(ratio)?.push({ path, videoInfo });
  }

  return ratioToFilesMap;
};

(async () => {
  const program = setupProgram();
  const options = program.opts();
  console.log("Scanning input directory...");
  const inputFiles = await gatherSourceFiles(options.input, ["mov"], options.r);
  console.log(`Found ${inputFiles.length} input videos`);
  console.log("Reading video files...");
  const fileToVideoInfoMap = await getFileToVideoInfoMap(inputFiles);
  const ratioToFilesMap = await getRatioToFilesMap(fileToVideoInfoMap);

  const ratioPrompts: PromptObject<string>[] = Array.from(
    ratioToFilesMap.keys()
  ).map((ratio) => {
    return {
      type: "multiselect",
      message: `Select output sizes for videos with ratio ${ratio} (spacebar to toggle)`,
      instructions: false,
      name: String(ratio),
      choices: getSizesForRatio(ratio).map((size) => {
        return {
          title: `${size.width} x ${size.height}`,
          value: size,
          selected: true,
        };
      }),
      min: 1,
    };
  });

  const response: ResponseType = await prompts([
    {
      type: "text",
      name: "crf",
      message: "-crf value?",
      initial: "30",
      validate: validateIntArray,
      format: getIntArrayFromStringList,
    },
    {
      type: "text",
      name: "fps",
      message: "fps?",
      initial: "60",
      validate: validateIntArray,
      format: getIntArrayFromStringList,
    },
  ]);

  const resolutionsByRatio = await prompts(ratioPrompts);

  for (const [ratio, files] of ratioToFilesMap.entries()) {
    const sizes = resolutionsByRatio[ratio];
    if (!sizes) {
      console.log(`No sizes selected for ratio ${ratio}`);
      continue;
    }
    console.log(`Encoding ${files.length} videos with ratio ${ratio}`);
    await encodeVideosWebm({
      inputFiles: files.map(({ path }) => path),
      inputBasePath: options.input[0],
      outputBasePath: options.output,
      crfs: response.crf,
      fpses: response.fps,
      sizes,
    });
  }
})();
