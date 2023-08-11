import { CommandExecutor } from "./executor";

async function batchCommandMain() {
  const variables = ["a", "b", "c"];
  // const template = "echo Message: {}";
  const template = "cat -";
  const executor = new CommandExecutor(variables);
  executor.run(template);
  executor.pipe_input(process.stdin);

  for await (const { data, variable } of executor.aggregate_output("stdout", "utf-8")) {
    console.log(`From ${variable}: ${data.trimEnd()}`);
  }

  await executor.wait();
}

batchCommandMain()

