import path from "path";

const getOutputBasename = (
  inputPath: string,
  outputDirectory: string = "."
): string => {
  const { name } = path.parse(inputPath);

  const [actor, outfit, type, ...rest] = name.split("-");

  const num = rest.pop();

  const middle = rest.join("-");

  return [actor, outfit, type, middle, num].filter((part) => !!part).join("/");
};

export default getOutputBasename;
