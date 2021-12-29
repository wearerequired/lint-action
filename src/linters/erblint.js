const core = require("@actions/core");

const { run } = require("../utils/action");
const commandExists = require("../utils/command-exists");
const { initLintResult } = require("../utils/lint-result");
const { removeTrailingPeriod } = require("../utils/string");

/** @typedef {import('../utils/lint-result').LintResult} LintResult */

/**
 * https://https://github.com/Shopify/erb-lint
 */
class Erblint {
	static get name() {
		return "ERB Lint";
	}

	/**
	 * Verifies that all required programs are installed. Throws an error if programs are missing
	 * @param {string} dir - Directory to run the linting program in
	 * @param {string} prefix - Prefix to the lint command
	 */
	static async verifySetup(dir, prefix = "") {
		// Verify that Ruby is installed (required to execute erblint)
		if (!(await commandExists("ruby"))) {
			throw new Error("Ruby is not installed");
		}
		// Verify that erblint is installed
		try {
			run(`${prefix} erblint -v`, { dir });
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
		if (extensions.length !== 1 || extensions[0] !== "erb") {
			throw new Error(`${this.name} error: File extensions are not configurable`);
		}
		if (fix) {
			core.warning(`${this.name} does not support auto-fixing`);
		}

		return run(`${prefix} erblint --format json --lint-all ${args}`, {
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

		let outputJson;
		try {
			outputJson = JSON.parse(output.stdout);
		} catch (err) {
			throw Error(
				`Error parsing ${this.name} JSON output: ${err.message}. Output: "${output.stdout}"`,
			);
		}

		for (const file of outputJson.files) {
			const { path, offenses } = file;
			for (const offense of offenses) {
				const { message, linter, corrected, location } = offense;
				if (!corrected) {
					// ERB Lint does not provide severities in its JSON output
					lintResult.error.push({
						path,
						firstLine: location.start_line,
						lastLine: location.last_line,
						message: `${removeTrailingPeriod(message)} (${linter})`,
					});
				}
			}
		}

		return lintResult;
	}
}

module.exports = Erblint;
