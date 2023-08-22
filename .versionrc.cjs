const re = /\.version\("v(\d\.\d\.\d)"\)/;

const updater = {
  readVersion: (contents) => contents.match(re)[1],
  writeVersion: (contents, version) => contents.replace(re, `.version("v${version}")`)
};

const cmdTracker = {
  filename: "./src/bin/command.ts",
  updater
}

const sshTracker = {
  filename: "./src/bin/ssh.ts",
  updater
}

module.exports = {
  types: [
    {"type": "feat", "section": "Features"},
    {"type": "fix", "section": "Bug Fixes"},
    {"type": "chore", "section": "Misc"},
    {"type": "docs", "section": "Misc"},
    {"type": "style", "section": "Misc"},
    {"type": "refactor", "section": "Misc"},
    {"type": "perf", "section": "Misc"},
    {"type": "test", "section": "Misc"},
    {"type": "ci", "section": "Misc"}
  ],
  // read version
  packageFiles: [cmdTracker, sshTracker, "package.json", "package-lock.json"],
  // write version
  bumpFiles: [cmdTracker, sshTracker, "package.json", "package-lock.json"]
};
