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

import { CommandExecutor } from "../executor";
import { asyncInterleaveReady, asyncMap } from "iter-tools-es";

const variables = ["a", "b", "c"];
// const template = "echo Message: {}";
const template = "cat -";
const executor = new CommandExecutor(variables);
executor.run(template);
executor.pipe_input(process.stdin);

const stdout = asyncMap(
  ({ data, variable }) => ({ data, variable, source: "stdout" }),
  executor.collect_output("stdout", "utf-8")
);
const stderr = asyncMap(
  ({ data, variable }) => ({ data, variable, source: "stderr" }),
  executor.collect_output("stderr", "utf-8")
);

for await (const { data, variable, source } of asyncInterleaveReady(stdout, stderr)) {
  console.log(`From ${variable} ${source}: ${data.trimEnd()}`);
}

await executor.wait();

