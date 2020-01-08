const commandExists = require("../../vendor/command-exists");
const { run } = require("../utils/action");
const { parseErrorsFromDiff } = require("../utils/diff");
const { initLintResult } = require("../utils/lint-result");

/**
 * https://black.readthedocs.io
 */
class Black {
	static get name() {
		return "Black";
	}

	/**
	 * Verifies that all required programs are installed. Throws an error if programs are missing
	 * @param {string} dir - Directory to run the linting program in
	 */
	static async verifySetup(dir) {
		// Verify that Python is installed (required to execute Black)
		if (!(await commandExists("python"))) {
			throw new Error("Python is not installed");
		}

		// Verify that Black is installed
		if (!(await commandExists("black"))) {
			throw new Error(`${this.name} is not installed`);
		}
	}

	/**
	 * Runs the linting program and returns the command output
	 * @param {string} dir - Directory to run the linter in
	 * @param {string[]} extensions - File extensions which should be linted
	 * @param {boolean} fix - Whether the linter should attempt to fix code style issues automatically
	 * @returns {{status: number, stdout: string, stderr: string}} - Output of the lint command
	 */
	static lint(dir, extensions, fix = false) {
		return run(
			`black ${fix ? "" : "--check --diff"} --include "^.*\\.(${extensions.join("|")})$" "."`,
			{
				dir,
				ignoreErrors: true,
			},
		);
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
		lintResult.error = parseErrorsFromDiff(output.stdout);
		lintResult.isSuccess = output.status === 0;
		return lintResult;
	}
}

module.exports = Black;
