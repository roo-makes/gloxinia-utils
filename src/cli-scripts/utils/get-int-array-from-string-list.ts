export const getIntArrayFromStringList = (input: string): number[] => {
  return input.split(",").map((part) => {
    const intVal = parseInt(part);
    if (isNaN(intVal)) throw `Error: "${part}" is not a number`;
    return intVal;
  });
};
