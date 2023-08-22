# batch-cmd

Executing multiple commands in batches concurrently. It provides useful
command-line tools and can also be imported as a library in JS (ESM).

## Installation

You can install it directly from npm:

``` shell
npm install batch-cmd
```

## Command-line Usage

This repo provides two tools, `bcmd` and `bssh`. The first one is used
for running general shell commands, while the second one is more
conveniently for running commands on remote machines via SSH.

Both tools will handle OS signals in the following way:

-   Upon receiving the first `SIGINT` / `SIGTERM`: the program will send
    `SIGTERM` to all running commands and wait for them to stop.
-   Upon receiving more than one `SIGINT` / `SIGTERM`: the program will
    send `SIGKILL` to force kill all running commands.

Both tools will pass input from `stdin` to `stdin` of all the commands.
It will also collect `stdout` / `stderr` from all commands and output in
the `stdout` / `stderr`, with a prefix to distinguish them.

### bcmd

``` shell
# running 3 commands with 3 variables (-- is used to separate options from command)
# variables can be used in the template command (must be quoted)
bcmd -v A B C -- "echo {}"
# multiple variables can be used for each command by specifying a separator
bcmd -v A:1 B:2 C:2 -- "echo {0} {1}"
# read variables from a file (can be combined with -v option)
bcmd -f vars.txt -- "mkdir {0} && echo {0}"
# pipe input to all commands
echo 'var' | bcmd -v A B C -- "cat -"
```

For more usage, please see `bcmd -h`.

### bssh

`bssh` is similar to `bcmd` but more convenient to run command on remote
machines. The first variable for each command must be the address of the
remote machine.

``` shell
# running 3 commands with 3 variables (-- is used to separate options from command)
# variables can be used in the template command (must be quoted)
bssh -v host1 host2 host3 -- "ls"
# multiple variables can be used for each command by specifying a separator
# note: the first argument is consumed internally using {0}, so other placeholders must be numbered as well
bssh -v host1:A host2:B -- "echo {1}"
# read variables from a file (can be combined with -v option)
bssh -f hosts.txt -v host3 host4 -- "echo {0}"
# pipe input to all commands
echo 'var' | bssh -v host1 host2 -- "cat -"
```

For more usage, please see `bssh -h`.

## Library Usage

This repo also exports a JS (ESM) library (with type declarations).
Example usage:

``` {.javascript org-language="js"}
import { CommandExecutor, runExecutor } from "../src/lib.js";

const executor = new CommandExecutor([
  ["a", "1"],
  ["b", "2"],
  ["c", "3"]
]);
await runExecutor(executor, "echo From {0}: {1}", ":");
```

## License

This project is licensed under AGPL-3.0.

> Copyright (C) 2023 DCsunset
>
> This program is free software: you can redistribute it and/or modify
> it under the terms of the GNU Affero General Public License as
> published by the Free Software Foundation, either version 3 of the
> License, or (at your option) any later version.
>
> This program is distributed in the hope that it will be useful, but
> WITHOUT ANY WARRANTY; without even the implied warranty of
> MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
> Affero General Public License for more details.
>
> You should have received a copy of the GNU Affero General Public
> License along with this program. If not, see
> <https://www.gnu.org/licenses/>.
