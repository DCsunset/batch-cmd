import { spawn, ChildProcess } from "node:child_process";
import stringFormat from "string-format";
import { AsyncWrappable, asyncInterleaveReady, asyncMap, asyncWrap } from "iter-tools-es";

class CommandExecutor {
  processes: ChildProcess[];
  variables: string[];

  constructor(variables: string[]) {
    this.variables = variables;
  }

  /// Run command concurrently with template
  run(template: string) {
    this.processes = this.variables.map(v => (
      spawn(
        stringFormat(template, v),
        { shell: true }
      )
    ))
  }

  wait() {
    return Promise.all(
      this.processes.map(p => (
        new Promise(resolve => {
          p.on("close", resolve);
        })
      ))
    );
  }

  collect_output(source: "stdout" | "stderr", encoding?: BufferEncoding) {
    return asyncInterleaveReady(
      ...this.processes.map((p, i) => (
        asyncMap(
          data => ({ data, variable: this.variables[i] }),
          encoding
            ? p[source]?.setEncoding(encoding)
            : p[source]
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
      })))
    }
    // no more input
    this.processes.forEach(p => p.stdin?.end());
  }

  /// Kill all processes with a signal
  kill(signal?: number | NodeJS.Signals) {
    return this.processes.map(p => p.kill(signal));
  }
}


class SshExecutor extends CommandExecutor {
  sshCommand: string;

  constructor(hosts: string[], sshCommand: string = "ssh") {
    super(hosts);
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

