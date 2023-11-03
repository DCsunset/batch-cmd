// Copyright (C) 2023  DCsunset

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.

// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

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
  const signalHandler = new SignalHandler(["SIGINT", "SIGTERM"], (_sig, cnt) => {
    // Close input pipe to prevent hanging
    if (cnt === 1) {
      console.error(chalk.yellowBright("Terminating all commands..."));
      executor.kill("SIGTERM");
    }
    else if (cnt === 2) {
      console.error(chalk.redBright("Killing all commands..."));
      executor.kill("SIGKILL");
    }
    else {
      console.error(chalk.redBright("Force exiting..."));
      process.exit(1);
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
  // Close input pipe to prevent hanging
  process.stdin.emit("end");
  await inputPromise;
}

