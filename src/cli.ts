import chalk from "chalk";
import { open } from "node:fs/promises";
import { asyncMap, asyncFilter, findBest, firstHighest, asyncInterleaveReady, asyncForEach } from "iter-tools-es";
import { CommandExecutor } from "./executor.js";
import { SignalHandler } from "./signal.js";

// parse variables from command-line input
export async function parseVars(vars?: string[], file?: string, sep?: string) {
  const variables: string[][] = vars
    ? vars.map(v => sep ? v.split(sep) : [v])
    : [];
  if (file) {
    const f = await open(file);
    // append to vars
    await asyncForEach(
      (v: string) => variables.push(
        sep ? v.split(sep) : [v]
      ),
      asyncFilter(
        // Ignore empty line
        (v: string) => v.length > 0,
        f.readLines()
      )
    );
  }
  return variables;
}

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

export async function runExecutor(executor: CommandExecutor, template: string, sep?: string) {
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

  const vars = executor.variables.map(v => sep ? v.join(sep) : v[0]);
  const maxLen = findBest(firstHighest, vars.map(v => v.length))!;
  for await (const { data, variable, source } of asyncInterleaveReady(stdout, stderr)) {
    const v = sep ? variable.join(sep) : variable[0];
    const outputFn = source === "stdout" ? console.log : console.error;
    const colorize = source === "stdout" ? chalk.gray : chalk.red;
    const prefix = colorize(`${v.padEnd(maxLen)} |`);
    outputFn(`${prefix} ${data.trimEnd()}`);
  }

  await executor.wait();
  // Close input pipe
  process.stdin.emit("end");
  await inputPromise;
}

