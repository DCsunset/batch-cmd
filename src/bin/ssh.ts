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

import { Command } from "commander";
import { SshExecutor } from "../executor.js";
import { parseVars, runExecutor, setupSignalHandler } from "../cli.js";

const program = new Command();

type Options = {
  ssh: string,
  file?: string,
  vars?: string[],
  sep?: string
};

program
  .name("batch-cmd")
  .description("Execute multiple commands in batch concurrently")
  .version("v0.1.1")
  .option("--ssh", "ssh command to use", "ssh")
  .option("-f, --file <file>", "use a file in which each line contains a host to execute command on")
  .option("-v, --vars <host...>", "a list of variables (hosts) used in the template command")
  .option("-s, --sep <separator>", "separator to split the variable")
  .argument("<template>", "template command to execute remotely")
  .action(execute);

async function execute(template: string, options: Options) {
  const vars = await parseVars(options.vars, options.file, options.sep);
  const executor = new SshExecutor(vars, options.ssh);
  setupSignalHandler(executor);
  await runExecutor(executor, template, options.sep);
}

try {
  await program.parseAsync();
}
catch (err: any) {
	console.error("Error:", (err as Error).message);
  // Close input pipe in case of hanging
  process.stdin.emit("end");
}

