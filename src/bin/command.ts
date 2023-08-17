#!/usr/bin/env node

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

import { open } from "node:fs/promises";
import { AsyncWrappable, arrayFromAsync, asyncFilter, asyncForEach, asyncInterleaveReady, asyncMap, findBest, firstHighest } from "iter-tools-es";
import { Command } from "commander";
import chalk from "chalk";
import { CommandExecutor } from "../executor.js";
import { SignalHandler } from "../signal.js";

const program = new Command();

type Options = {
  file?: string,
  vars?: string[]
};

program
  .name("batch-cmd")
  .description("Execute multiple commands in batch concurrently")
  .version("v0.1.0")
  .option("-f, --file <file>", "use a file in which each line contains a variable for the template command")
  .option("-v, --vars <var...>", "a list of variables used in the template command")
  .argument("<template>", "template command to execute in batch")
  .action(execute);

async function execute(template: string, options: Options) {
  const vars: string[] = options.vars ?? [];
  if (options.file) {
    const file = await open(options.file);
    // append to vars
    await asyncForEach(
      (v: string) => vars.push(v),
      asyncFilter(
        // Ignore empty line
        (v: string) => v.length > 0,
        file.readLines()
      )
    );
  }

  const executor = new CommandExecutor(vars);
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

  const maxLen = findBest(firstHighest, vars.map(v => v.length))!;
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

try {
  await program.parseAsync();
}
catch (err: any) {
	console.error("Error:", (err as Error).message);
}

