const { existsSync } = require("fs");
const { join } = require("path");

const { run } = require("../utils/action");

const YARN_LOCK_NAME = "yarn.lock";

/**
 * Determines whether Yarn should be used to execute commands or binaries. This decision is based on
 * the existence of a Yarn lockfile in the package directory. The distinction between NPM and Yarn
 * is necessary e.g. for Yarn Plug'n'Play to work
 * @param {string} [pkgRoot] - Package directory (directory where Yarn lockfile would exist)
 * @returns {boolean} - Whether Yarn should be used
 */
function useYarn(pkgRoot) {
	// Use an absolute path if `pkgRoot` is specified and a relative one (current directory) otherwise
	const lockfilePath = pkgRoot ? join(pkgRoot, YARN_LOCK_NAME) : YARN_LOCK_NAME;
	return existsSync(lockfilePath);
}

/**
 * Executes the specified binary with NPM or Yarn (the correct tool is determined automatically).
 * This function wraps the general {@see run} function and accepts the same parameters
 * @param {string} cmd - NPM binary to execute
 * @param {{dir: string, ignoreErrors: boolean}} [options] - {@see RUN_OPTIONS_DEFAULTS}
 * @returns {{status: number, stdout: string, stderr: string}} - Output of the NPM binary
 */
function runNpmBin(cmd, options) {
	const npmCmd = useYarn(options.dir) ? `yarn run --silent ${cmd}` : `npx --no-install ${cmd}`;
	return run(npmCmd, options);
}

module.exports = { runNpmBin };
