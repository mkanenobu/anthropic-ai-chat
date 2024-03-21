import readline from "node:readline/promises";
import { completionStream } from "./anthropic-ai.ts";
import process from "node:process";
import Anthropic from "@anthropic-ai/sdk";
import type { Config } from "./config.ts";

const messageStreamHandler = async (
  rl: readline.Interface,
  messageStream: Awaited<ReturnType<typeof completionStream>>,
) => {
  let buf = "";

  for await (const msg of messageStream) {
    if (msg.type === "content_block_delta") {
      const text = msg.delta.text;
      buf += text;
      rl.write(text);
    } else if (msg.type === "message_stop") {
      rl.write("\n");
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
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  // TODO: ファイルに保存
  const history: Array<History> = [];

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
        console.dir(history);
        continue;
      }
      case ".clear": {
        history.length = 0;
        rl.write("History cleared.\n");
        continue;
      }
    }

    history.push({ role: "user", content: input });

    const stream = await completionStream({
      apiKey: process.env.ANTHROPIC_API_KEY ?? config.apiKey,
      model: config.model,
      messages: historyToMessage(history),
    });

    const output = await messageStreamHandler(rl, stream);
    history.push({
      role: "assistant",
      content: output,
    });
  }
};
