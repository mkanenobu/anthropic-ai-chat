import readline from "node:readline/promises";
import { completionStream, DEFAULT_MODEL } from "./anthropic-ai.ts";
import process from "node:process";
import Anthropic from "@anthropic-ai/sdk";
import type { Config } from "./config.ts";
import { countTokens } from "@anthropic-ai/tokenizer";
import { FileHistory } from "./file-history.ts";

const messageStreamHandler = async (
  messageStream: Awaited<ReturnType<typeof completionStream>>,
) => {
  let buf = "";

  for await (const msg of messageStream) {
    if (msg.type === "content_block_delta") {
      const text = msg.delta.text;
      buf += text;
      process.stdout.write(text);
    } else if (msg.type === "message_stop") {
      process.stdout.write("\n");
    }
  }

  return buf;
};

type History = { role: "user" | "assistant"; content: string };

const historyToMessage = (
  history: Array<History>,
): Array<Anthropic.MessageParam> => {
  return history.map((h) => {
    return {
      role: h.role,
      content: h.content,
    };
  });
};

export const startRepl = async (config: Config) => {
  const histories = await FileHistory.loadHistories();

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    tabSize: 2,
    history: histories,
  });

  const fileHistory = new FileHistory();
  const localHistory: Array<History> = [];

  while (true) {
    const rawInput = await rl.question("> ");
    const input = rawInput.trim();

    if (!input) continue;

    switch (input) {
      case ".exit": {
        rl.close();
        process.exit(0);
        return;
      }
      case ".history": {
        console.dir(localHistory);
        continue;
      }
      case ".clear": {
        localHistory.length = 0;
        rl.write("History cleared.\n");
        continue;
      }
    }

    localHistory.push({ role: "user", content: input });
    const saveHistoryTask = fileHistory.saveHistory(input);

    const stream = await completionStream({
      apiKey: process.env.ANTHROPIC_API_KEY ?? config.apiKey,
      messageStreamParams: {
        model: config.model ?? DEFAULT_MODEL,
        messages: historyToMessage(localHistory),
        max_tokens: 2000,
        system: config.systemPrompt ?? undefined,
      },
    });

    const output = await messageStreamHandler(stream);

    console.log("\nResponse token count:", countTokens(output));
    localHistory.push({
      role: "assistant",
      content: output,
    });

    await saveHistoryTask;
  }
};
