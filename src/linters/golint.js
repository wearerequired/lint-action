const commandExists = require("../../vendor/command-exists");
const { log, run } = require("../utils/action");
const { initLintResult } = require("../utils/lint-result");
const { capitalizeFirstLetter } = require("../utils/string");

const PARSE_REGEX = /^(.+):([0-9]+):[0-9]+: (.+)$/gm;

/**
 * https://github.com/golang/lint
 */
class Golint {
	static get name() {
		return "golint";
	}

	/**
	 * Verifies that all required programs are installed. Throws an error if programs are missing
	 * @param {string} dir - Directory to run the linting program in
	 * @param {string} prefix - Prefix to the lint command
	 */
	static async verifySetup(dir, prefix = "") {
		// Verify that golint is installed
		if (!(await commandExists("golint"))) {
			throw new Error(`${this.name} is not installed`);
		}
	}

	/**
	 * Runs the linting program and returns the command output
	 * @param {string} dir - Directory to run the linter in
	 * @param {string[]} extensions - File extensions which should be linted
	 * @param {string} args - Additional arguments to pass to the linter
	 * @param {boolean} fix - Whether the linter should attempt to fix code style issues automatically
	 * @param {string} prefix - Prefix to the lint command
	 * @param {string[]|string} fileNames - File names which should be linted
	 * @returns {{status: number, stdout: string, stderr: string}} - Output of the lint command
	 */
	static lint(dir, extensions, args = "", fix = false, prefix = "", fileNames = ".") {
		if (extensions.length !== 1 || extensions[0] !== "go") {
			throw new Error(`${this.name} error: File extensions are not configurable`);
		}
		if (fix) {
			log(`${this.name} does not support auto-fixing`, "warning");
		}

		return run(`${prefix} golint -set_exit_status ${args} "${fileNames}"`, {
			dir,
			ignoreErrors: true,
		});
	}

	/**
	 * Parses the output of the lint command. Determines the success of the lint process and the
	 * severity of the identified code style violations
	 * @param {string} dir - Directory in which the linter has been run
	 * @param {{status: number, stdout: string, stderr: string}} output - Output of the lint command
	 * @returns {{isSuccess: boolean, warning: [], error: []}} - Parsed lint result
	 */
	static parseOutput(dir, output) {
		const lintResult = initLintResult();
		lintResult.isSuccess = output.status === 0;

		const matches = output.stdout.matchAll(PARSE_REGEX);
		for (const match of matches) {
			const [_, path, line, text] = match;
			const lineNr = parseInt(line, 10);
			lintResult.error.push({
				path,
				firstLine: lineNr,
				lastLine: lineNr,
				message: capitalizeFirstLetter(text),
			});
		}

		return lintResult;
	}
}

module.exports = Golint;
