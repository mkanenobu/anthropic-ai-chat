import * as path from "node:path";
import { z } from "zod";
import * as fs from "node:fs/promises";
import * as process from "node:process";

export const getConfigPath = () => {
  const home = process.env.HOME || "~";
  return path.join(home, ".config", "anthropic-ai", "config.json");
};

export const configSchema = z.object({
  apiKey: z.string().min(1),
  model: z.string().optional().nullable(),
  systemPrompt: z.string().optional().nullable(),
});

export type Config = z.infer<typeof configSchema>;

export const loadConfig = async (): Promise<Config> => {
  const configPath = getConfigPath();
  const configJson = await fs.readFile(configPath, "utf-8");
  return configSchema.parse(JSON.parse(configJson));
};
