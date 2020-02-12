const { run } = require("../action");
const { useYarn } = require("./use-yarn");

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
