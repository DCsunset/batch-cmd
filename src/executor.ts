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


import { spawn, ChildProcess } from "node:child_process";
import stream from "node:stream";
import stringFormat from "string-format";
import { AsyncWrappable, asyncInterleaveReady, asyncMap, asyncWrap } from "iter-tools-es";

export type CommandExecutorOptions = {
  shell?: string
};

export class CommandExecutor {
  /// Pass a list of variables to each command
  variables: string[][];
  processes: ChildProcess[] = [];
  options?: CommandExecutorOptions;

  constructor(variables: string[][], options?: CommandExecutorOptions) {
    if (variables.length === 0) {
      throw new Error("No variable provided");
    }
    this.variables = variables;
    this.options = options;
  }

  /// Run command concurrently with template
  run(template: string) {
    this.processes = this.variables.map(v => (
      spawn(
        stringFormat(template, ...v),
        { shell: this.options?.shell ?? "sh" }
      )
    ));
  }

  wait() {
    return Promise.all(
      this.processes.map(p => (
        new Promise(resolve => {
          p.on("exit", resolve);
          // already exit (won't receive event)
          if (p.exitCode !== null) {
            resolve(p.exitCode);
          }
        })
      ))
    );
  }

  /// Line mode means collect output line by line
  collectOutput(source: "stdout" | "stderr", transform?: (s: stream.Readable) => AsyncWrappable<any>) {
    return asyncInterleaveReady(
      ...this.processes.map((p, i) => (
        asyncMap(
          data => ({ data, variable: this.variables[i] }),
          (transform && p[source]) ? transform(p[source]!) : p[source]
        )
      ))
    );
  }

  async pipeInput(source: AsyncWrappable<any>) {
    for await (const data of asyncWrap(source)) {
      await Promise.all(this.processes.map(p => new Promise<void>(resolve => {
        if (p.stdin && !p.stdin.write(data)) {
          // high watermark reached, need to wait for drain
          p.stdin.once("drain", resolve);
        } else {
          resolve();
        }
      })));
    }
    // no more input
    this.processes.forEach(p => p.stdin?.end());
  }

  /// Kill all processes with a signal
  kill(signal?: number | NodeJS.Signals) {
    return this.processes.map(p => (
      // only kill running process, otherwise it may result in unexpected result
      p.exitCode === null ? p.kill() : false
    ));
  }
}

export type SshExecutorOptions = {
  /// ssh command to use
  ssh?: string
} & CommandExecutorOptions;

export class SshExecutor extends CommandExecutor {
  options?: SshExecutorOptions;

  /// The first var for each command must be the host
  constructor(vars: string[][], options?: SshExecutorOptions) {
    super(vars, options);
    this.options = options;
  }

  run(template: string) {
    super.run(`${this.options?.ssh ?? "ssh"} {0} -- ${template}`);
  }
}

