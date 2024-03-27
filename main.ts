import { startRepl, HELP } from "./src/repl";
import { loadConfig } from "./src/config.ts";

const main = async () => {
  console.log(HELP);
  const conf = await loadConfig();
  await startRepl(conf);
};

await main();
