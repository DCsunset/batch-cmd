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

import { SshExecutor } from "./executor";

const variables = ["a", "b", "c"];
// const template = "echo Message: {}";
const template = "echo {0}";
const executor = new SshExecutor(variables);
executor.run(template);
executor.pipe_input(process.stdin);

for await (const { data, variable } of executor.collect_output("stdout", "utf-8")) {
  console.log(`From ${variable}: ${data.trimEnd()}`);
}

await executor.wait();

