import { readFile, writeFile } from "fs/promises";
import path from "path";

import { __dirname } from "../const/index.js";

const getDataPath = (fileName) => path.join(__dirname, "data", fileName);

export const readData = async (fileName, key) => {
  try {
    const rawData = await readFile(getDataPath(fileName), "utf-8");
    return JSON.parse(rawData)[key];
  } catch (error) {
    return [];
  }
};

export const writeData = async (fileName, key, data) => {
  await writeFile(
    getDataPath(fileName),
    JSON.stringify({ [key]: data }, null, 2)
  );
};
