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
import { CommandExecutor } from "../executor.js";
import { parseVars, runExecutor, setupSignalHandler } from "../cli.js";

const program = new Command();

type Options = {
  file?: string,
  vars?: string[],
  sep?: string,
  debug?: boolean
};

program
  .name("batch-cmd")
  .description("Execute multiple commands in batch concurrently")
  .version("v0.1.5")
  .option("-f, --file <file>", "use a file in which each line contains a variable for the template command")
  .option("-v, --vars <var...>", "a list of variables used in the template command")
  .option("-s, --sep <separator>", "separator to split the variable")
  .option("--debug", "enable debug mesages")
  .argument("<template...>", "template command to execute in batch (multiple args will be joined with spaces)")
  .action(execute);

async function execute(template: string[], options: Options) {
  try {
    const vars = await parseVars(options.vars, options.file, options.sep);
    const executor = new CommandExecutor(vars);
    setupSignalHandler(executor);
    await runExecutor(executor, template.join(" "), options.sep);
  }
  catch (err: any) {
    if (options.debug) {
      console.error(err.stack);
    } else {
      console.error("Error:", (err as Error).message);
    }
    // Close input pipe in case of hanging
    process.stdin.emit("end");
  }
}

await program.parseAsync();

