import * as path from "node:path";
import * as fs from "node:fs/promises";

const HISTORY_SIZE = 1000;

export const getHistoryFilePath = () => {
  const home = process.env.HOME || "~";
  return path.join(home, ".config", "anthropic-ai", "history.txt");
};

export class FileHistory {
  private readonly historySize: number = HISTORY_SIZE;
  private readonly historyFilePath: string;

  constructor() {
    this.historyFilePath = getHistoryFilePath();
  }

  public static loadHistories = async (): Promise<string[]> => {
    const historyFilePath = getHistoryFilePath();
    try {
      const history = await fs.readFile(historyFilePath, "utf-8");
      return history.split("\n");
    } catch (e) {
      return [];
    }
  };

  public saveHistory = async (...items: string[]) => {
    const histories = await FileHistory.loadHistories();
    const history = [...histories, ...items]
      .slice(-this.historySize)
      .join("\n");
    await fs.writeFile(this.historyFilePath, history);
  };
}
