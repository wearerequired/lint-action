const { sep } = require("path");

const { run } = require("../utils/action");
const commandExists = require("../utils/command-exists");
const { parseErrorsFromDiff } = require("../utils/diff");
const { initLintResult } = require("../utils/lint-result");

/** @typedef {import('../utils/lint-result').LintResult} LintResult */

/**
 * https://pycqa.github.io/isort
 */
class Isort {
	static get name() {
		return "isort";
	}

	/**
	 * Verifies that all required programs are installed. Throws an error if programs are missing
	 * @param {string} dir - Directory to run the linting program in
	 * @param {string} prefix - Prefix to the lint command
	 */
	static async verifySetup(dir, prefix = "") {
		// Verify that Python is installed (required to execute isort)
		if (!(await commandExists("python"))) {
			throw new Error("Python is not installed");
		}

		// Verify that isort is installed
		try {
			run(`${prefix} isort --version`, { dir });
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
	 * @param {string} prefix - Prefix to the lint command
	 * @returns {{status: number, stdout: string, stderr: string}} - Output of the lint command
	 */
	static lint(dir, extensions, args = "", fix = false, prefix = "") {
		if (extensions.length !== 1 || extensions[0] !== "py") {
			throw new Error(`${this.name} error: File extensions are not configurable`);
		}

		const fixArg = fix ? "" : "--check --diff";
		return run(`${prefix} isort ${fixArg} ${args} .`, {
			dir,
			ignoreErrors: true,
		});
	}

	/**
	 * Parses the output of the lint command. Determines the success of the lint process and the
	 * severity of the identified code style violations
	 * @param {string} dir - Directory in which the linter has been run
	 * @param {{status: number, stdout: string, stderr: string}} output - Output of the lint command
	 * @returns {LintResult} - Parsed lint result
	 */
	static parseOutput(dir, output) {
		const lintResult = initLintResult();
		lintResult.isSuccess = output.status === 0;

		lintResult.error = parseErrorsFromDiff(output.stdout).map((error) => {
			// isort names the diffed file `<path>:before`/`<path>:after`; strip the directory prefix
			// and the `:after` suffix parse-diff keeps from the diff header
			let { path } = error;
			const suffixIndex = path.lastIndexOf(":after");
			if (suffixIndex !== -1) {
				path = path.slice(0, suffixIndex);
			}
			if (path.startsWith(`${dir}${sep}`)) {
				path = path.slice(dir.length + 1);
			}
			return { ...error, path };
		});

		return lintResult;
	}
}

module.exports = Isort;
