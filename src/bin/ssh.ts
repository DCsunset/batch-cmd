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
import { arrayFromAsync, asyncFilter, asyncForEach, asyncInterleaveReady, asyncMap, findBest, firstHighest } from "iter-tools-es";
import { Command } from "commander";
import { SshExecutor } from "../executor.js";

const program = new Command();

type Options = {
  ssh: string,
  file?: string,
  hosts?: string[]
};

program
  .name("batch-cmd")
  .description("Execute multiple commands in batch concurrently")
  .version("v0.1.0")
  .option("-s, --ssh", "ssh command to use", "ssh")
  .option("-f, --file <file>", "use a file in which each line contains a host to execute command on")
  .option("-h, --hosts <host...>", "a list of hosts used in the template command")
  .argument("<template>", "template command to execute remotely")
  .action(execute);

async function execute(template: string, options: Options) {
  const hosts: string[] = options.hosts ?? [];
  if (options.file) {
    const file = await open(options.file);
    // append to vars
    await asyncForEach(
      (h: string) => hosts.push(h),
      asyncFilter(
        // Ignore empty line
        (v: string) => v.length > 0,
        asyncMap(
          // trim whitespaces (not allowed for host)
          (v: string) => v.trim(),
          file.readLines()
        )
      )
    );
  }

  const executor = new SshExecutor(hosts, options.ssh);
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

  const maxLen = findBest(firstHighest, hosts.map(h => h.length))!;
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

