import { CommandExecutor } from "../src/executor.js";
import { runExecutor } from "../src/cli.js";

const executor = new CommandExecutor([
  ["a", "1"],
  ["b", "2"],
  ["c", "3"]
]);
await runExecutor(executor, "echo From {0}: {1}", ":");

