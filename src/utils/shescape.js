const { Shescape } = require("shescape");

// Quoting for the shell used by `run`/`execSync`: `cmd.exe` on Windows and `/bin/sh` elsewhere
// ("bash" quoting is valid for any POSIX sh). Used to escape values that end up in shell commands,
// most importantly attacker-controlled ones like the branch name of a fork pull request.
//
// Do not destructure the instance methods, they rely on `this` being the instance.
const shescape = new Shescape({ shell: process.platform === "win32" ? "cmd.exe" : "bash" });

module.exports = { shescape };
