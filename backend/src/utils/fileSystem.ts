import { readFile, writeFile } from "fs/promises";
import path from "path";

import { __dirname } from "../const/index.js";
import { Article, Entry } from "../types/index.js";

const getDataPath = (fileName: string) => path.join(__dirname, "data", fileName);

export const readData = async (fileName: string, key: string) => {
  try {
    const rawData = await readFile(getDataPath(fileName), "utf-8");
    return JSON.parse(rawData)[key];
  } catch (error) {
    return [];
  }
};

export const writeData = async (fileName: string, key: string, data: Article | Entry
) => {
  await writeFile(
    getDataPath(fileName),
    JSON.stringify({ [key]: data }, null, 2)
  );
};
