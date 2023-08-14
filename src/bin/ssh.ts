import { SshExecutor } from "../executor";

export async function batchCommandMain() {
  const variables = ["a", "b", "c"];
  // const template = "echo Message: {}";
  const template = "cat -";
  const executor = new CommandExecutor(variables);
  executor.run(template);
  executor.pipe_input(process.stdin);

  for await (const { data, variable } of executor.collect_output("stdout", "utf-8")) {
    console.log(`From ${variable}: ${data.trimEnd()}`);
  }

  await executor.wait();
}

export async function batchSshMain() {
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
}

batchCommandMain()

