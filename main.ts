import { startRepl } from "./src/repl";
import { loadConfig } from "./src/config.ts";

const main = async () => {
  const conf = await loadConfig();
  await startRepl(conf);
};

await main();
