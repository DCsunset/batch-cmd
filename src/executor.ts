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
import { createInterface } from "node:readline";

class CommandExecutor {
  /// Pass a list of variables to each command
  variables: string[][];
  processes: ChildProcess[] = [];

  constructor(variables: string[][]) {
    if (variables.length === 0) {
      throw new Error("No variable provided");
    }
    this.variables = variables;
  }

  /// Run command concurrently with template
  run(template: string) {
    this.processes = this.variables.map(v => (
      spawn(
        stringFormat(template, ...v),
        { shell: true }
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
  collect_output(source: "stdout" | "stderr", encoding?: BufferEncoding, lineMode?: boolean) {
    const transform = (s: stream.Readable | null) => {
      if (!s) {
        return null;
      }
      let result: AsyncIterable<any> = s;
      if (encoding) {
        result = s.setEncoding(encoding);
      }
      if (lineMode) {
        result = createInterface({ input: s });
      }
      return result;
    };
    return asyncInterleaveReady(
      ...this.processes.map((p, i) => (
        asyncMap(
          data => ({ data, variable: this.variables[i] }),
          transform(p[source])
        )
      ))
    );
  }

  async pipe_input(source: AsyncWrappable<any>) {
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

class SshExecutor extends CommandExecutor {
  sshCommand: string;

  /// The first var for each command must be the host
  constructor(vars: string[][], sshCommand: string = "ssh") {
    super(vars);
    this.sshCommand = sshCommand;
  }

  run(template: string) {
    super.run(`${this.sshCommand} {0} -- ${template}`);
  }
}

export {
  CommandExecutor,
  SshExecutor
};

