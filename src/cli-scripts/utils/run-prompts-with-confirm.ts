import prompts, { PromptObject } from "prompts";

export const runPromptsWithConfirm = async (
  customPrompts: PromptObject[] = []
) => {
  const response = await prompts([
    ...customPrompts,
    {
      type: "confirm",
      name: "confirm",
      message: "Start Conversion?",
      initial: true,
    },
  ]);
  if (!response.confirm) {
    console.log("Conversion cancelled by user");
    process.exit(0);
  }
  return response;
};
