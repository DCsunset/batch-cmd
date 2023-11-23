# Changelog

All notable changes to this project will be documented in this file. See [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) for commit guidelines.

## [0.2.0](https://github.com/DCsunset/batch-cmd/compare/v0.1.7...v0.2.0) (2023-11-23)


### ⚠ BREAKING CHANGES

* write async transformer to split output by lines

### Features

* support flushing output on timeout ([194f10d](https://github.com/DCsunset/batch-cmd/commit/194f10d46f4e61e22eef949aaf9dca06f7e5c697))


### Misc

* write async transformer to split output by lines ([2d38a74](https://github.com/DCsunset/batch-cmd/commit/2d38a74229495e412158955b74c9aa6a127616c3))

## [0.1.7](https://github.com/DCsunset/batch-cmd/compare/v0.1.6...v0.1.7) (2023-11-11)


### Features

* add option to disable prefix on each line ([857712b](https://github.com/DCsunset/batch-cmd/commit/857712b8d403a89209513f514862004dbf2a9f8b))

## [0.1.6](https://github.com/DCsunset/batch-cmd/compare/v0.1.5...v0.1.6) (2023-11-03)


### Bug Fixes

* fix hanging by listening on exit event and checking exitCode ([c0e07b0](https://github.com/DCsunset/batch-cmd/commit/c0e07b0797e779a3bfecb4d82c745efe0c5f967d))


### Misc

* fix example with specified separator ([5195c04](https://github.com/DCsunset/batch-cmd/commit/5195c04f9855727d1c8cd0566647404110fef330))

## [0.1.5](https://github.com/DCsunset/batch-cmd/compare/v0.1.4...v0.1.5) (2023-10-07)


### Bug Fixes

* close input pipe before killing to prevent hanging ([f8d2da3](https://github.com/DCsunset/batch-cmd/commit/f8d2da391ce95401157e0808a52304c02e31ce36))

## [0.1.4](https://github.com/DCsunset/batch-cmd/compare/v0.1.3...v0.1.4) (2023-09-15)


### Bug Fixes

* support using command template without quotes ([7041079](https://github.com/DCsunset/batch-cmd/commit/7041079255aa36eaf42aadfbd318bee6c89562d8))

## [0.1.3](https://github.com/DCsunset/batch-cmd/compare/v0.1.2...v0.1.3) (2023-09-08)


### Bug Fixes

* avoid killing exited process and support exiting forcefully ([f7334fe](https://github.com/DCsunset/batch-cmd/commit/f7334fe4b01b649ac67bfaaa98cfe5995790124e))


### Misc

* update README ([36264fa](https://github.com/DCsunset/batch-cmd/commit/36264fae22487afe994aa6a68fca6b86f7dbb773))

## [0.1.2](https://github.com/DCsunset/batch-cmd/compare/v0.1.1...v0.1.2) (2023-08-25)


### Features

* add debug option for more verbose error messages ([42ff0b8](https://github.com/DCsunset/batch-cmd/commit/42ff0b86d2e9ef1926cbe5cc6f400fdf081261f6))


### Misc

* add badges ([6b43c5c](https://github.com/DCsunset/batch-cmd/commit/6b43c5ce6d3fa2507f652a2492854417268bc92d))
* add github page to package.json ([8835bf0](https://github.com/DCsunset/batch-cmd/commit/8835bf0ef118b72614332c680ea849ce528aed27))
* add README.org to npmignore ([ba8cd98](https://github.com/DCsunset/batch-cmd/commit/ba8cd983bbcfae14e974c33ed8d2487124e424f8))
* use absolute path for files in package.json ([dc2053e](https://github.com/DCsunset/batch-cmd/commit/dc2053e16e78e6c6cd37e5762e079c4014bcc45d))

## [0.1.1](https://github.com/DCsunset/batch-cmd/compare/v0.1.0...v0.1.1) (2023-08-22)


### Bug Fixes

* fix README in npm registry ([dd74fe2](https://github.com/DCsunset/batch-cmd/commit/dd74fe2b1841845001beb308ca596781a8d05ed0))


### Misc

* add link to changelog ([2c9b6f6](https://github.com/DCsunset/batch-cmd/commit/2c9b6f6e86acc845ebd0b61c1d94453e3c535267))

## 0.1.0 (2023-08-22)


### Features

* add library export and tests ([c617551](https://github.com/DCsunset/batch-cmd/commit/c61755114f19e7afc4c128d1c7beb96a95480ad4))
* add more functionality and ssh executor ([7e99657](https://github.com/DCsunset/batch-cmd/commit/7e9965746fa7d1d5cb45a02f482dd7ccea5b92e3))
* add signal hanlder to kill commands ([92d4465](https://github.com/DCsunset/batch-cmd/commit/92d4465e355df72bf111eab198c454e23806f5ba))
* colorize output ([718f579](https://github.com/DCsunset/batch-cmd/commit/718f5798317b65f0b94da0a94ca413c50c0b7c52))
* implement cli and fix some bugs ([c12e494](https://github.com/DCsunset/batch-cmd/commit/c12e49403ababe52b3f9c146d1d15ba5bb204bbb))
* support multiple variables for command ([791bb2e](https://github.com/DCsunset/batch-cmd/commit/791bb2ed5f691d618d128cd0c372c926a2546b57))


### Bug Fixes

* add tests and fix some bugs ([b2e7c16](https://github.com/DCsunset/batch-cmd/commit/b2e7c16849628d7b253855313f8b2c0be8f6f64e))
* close stdin on error to prevent hanging ([097b1c8](https://github.com/DCsunset/batch-cmd/commit/097b1c803b714e7b21214608958dad29a494d72c))
* share the same counter in SignalHandler ([2e1a395](https://github.com/DCsunset/batch-cmd/commit/2e1a3953ea5bbb0ecff1be0dcc416048ee43ed03))
* throw an error if no variable is provided ([871127e](https://github.com/DCsunset/batch-cmd/commit/871127e8e9a35f137168a097426121c679fe7a28))


### Misc

* add copyright notice to source files ([2b5f679](https://github.com/DCsunset/batch-cmd/commit/2b5f679b835f9565c2df0748d96d2b84743b1079))
* add node_modules to gitignore ([8da20d3](https://github.com/DCsunset/batch-cmd/commit/8da20d3d1df6455ffe94931ec0d05e00a3aac39d))
* add README ([eaf469e](https://github.com/DCsunset/batch-cmd/commit/eaf469eefab5d36d9d6eb728dac7582564c371d0))
* add version config ([de3d2ce](https://github.com/DCsunset/batch-cmd/commit/de3d2cebb7c06c0fc6aedd7f9e6feb578e81259b))
* add workflow to build and publish package to npm ([de58a60](https://github.com/DCsunset/batch-cmd/commit/de58a6014fc7e344bf136cfd25fd4afd906a3faf))
* extract common functions to cli.ts ([60dd0d2](https://github.com/DCsunset/batch-cmd/commit/60dd0d2e47f8546df2192faec6f4143f62085b2b))
* generate markdown for npm js automatically ([7124fb0](https://github.com/DCsunset/batch-cmd/commit/7124fb0e325e83c81c116ae230d6cf5ce297388b))
* remove unnecessary files field ([2ea089e](https://github.com/DCsunset/batch-cmd/commit/2ea089e21a6f559f60d72c1f60eaf06778869736))
* update initial version ([e6dc993](https://github.com/DCsunset/batch-cmd/commit/e6dc993ed043ac470657aae9a15a9538b49d018f))
* update package metadata and gitignore ([0f4d2f0](https://github.com/DCsunset/batch-cmd/commit/0f4d2f03aab0f674abc62ecd3fb6fabaa41c7166))
