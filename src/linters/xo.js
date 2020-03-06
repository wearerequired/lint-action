const commandExists = require("../../vendor/command-exists");
const { run } = require("../utils/action");
const { npmPrefix } = require("../utils/npm/npm-prefix");
const ESLint = require("./eslint");

/**
 * https://github.com/xojs/xo
 * XO is a wrapper for ESLint, so it can use the same logic for parsing lint results
 */
class XO extends ESLint {
	static get name() {
		return "XO";
	}

	/**
	 * Verifies that all required programs are installed. Throws an error if programs are missing
	 * @param {string} dir - Directory to run the linting program in
	 */
	static async verifySetup(dir) {
		// Verify that NPM is installed (required to execute XO)
		if (!(await commandExists("npm"))) {
			throw new Error("NPM is not installed");
		}

		// Verify that XO is installed
		try {
			run("xo --version", { dir, prefix: npmPrefix('xo', { dir }) });
		} catch (err) {
			throw new Error(`${this.name} is not installed`);
		}
	}

	/**
	 * Runs the linting program and returns the command output
	 * @param {string} dir - Directory to run the linter in
	 * @param {string[]} extensions - File extensions which should be linted
	 * @param {string} args - Additional arguments to pass to the linter
	 * @param {boolean} fix - Whether the linter should attempt to fix code style issues automatically
	 * @returns {{status: number, stdout: string, stderr: string}} - Output of the lint command
	 */
	static lint(dir, extensions, args = "", fix = false) {
		const extensionArgs = extensions.map(ext => `--extension ${ext}`).join(" ");
		const fixArg = fix ? "--fix" : "";
		return run(`xo ${extensionArgs} ${fixArg} --reporter json ${args} "."`, {
			dir,
			ignoreErrors: true,
			prefix: npmPrefix('xo', { dir })
		});
	}
}

module.exports = XO;
