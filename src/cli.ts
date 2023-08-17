import chalk from "chalk";
import { asyncMap, findBest, firstHighest, asyncInterleaveReady } from "iter-tools-es";
import { CommandExecutor } from "./executor.js";
import { SignalHandler } from "./signal.js";

export function setupSignalHandler(executor: CommandExecutor) {
  const signalHandler = new SignalHandler(["SIGINT", "SIGTERM"], (sig, cnt) => {
    if (cnt === 1) {
      console.error(chalk.yellowBright("Terminating all commands..."));
      executor.kill("SIGTERM");
    }
    else {
      console.error(chalk.redBright("Killing all commands..."));
      executor.kill("SIGKILL");
    }
  });

  signalHandler.register();
}

export async function runExecutor(executor: CommandExecutor, template: string) {
  executor.run(template);
  const inputPromise = executor.pipe_input(process.stdin);

  const stdout = asyncMap(
    ({ data, variable }) => ({ data, variable, source: "stdout" }),
    executor.collect_output("stdout", "utf-8", true)
  );
  const stderr = asyncMap(
    ({ data, variable }) => ({ data, variable, source: "stderr" }),
    executor.collect_output("stderr", "utf-8", true)
  );

  const maxLen = findBest(firstHighest, executor.variables.map(v => v.length))!;
  for await (const { data, variable, source } of asyncInterleaveReady(stdout, stderr)) {
    const outputFn = source === "stdout" ? console.log : console.error;
    const colorize = source === "stdout" ? chalk.gray : chalk.red;
    const prefix = colorize(`${variable.padEnd(maxLen)} |`);
    outputFn(`${prefix} ${data.trimEnd()}`);
  }

  await executor.wait();
  // Close input pipe
  process.stdin.emit("end");
  await inputPromise;
}

