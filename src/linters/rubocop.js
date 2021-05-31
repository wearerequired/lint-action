const { run } = require("../utils/action");
const commandExists = require("../utils/command-exists");
const { initLintResult } = require("../utils/lint-result");
const { removeTrailingPeriod } = require("../utils/string");

/** @typedef {import('../utils/lint-result').LintResult} LintResult */

// Mapping of RuboCop severities to severities used for GitHub commit annotations
const severityMap = {
	convention: "warning",
	refactor: "warning",
	warning: "warning",
	error: "error",
	fatal: "error",
};

/**
 * https://rubocop.readthedocs.io
 */
class RuboCop {
	static get name() {
		return "RuboCop";
	}

	/**
	 * Verifies that all required programs are installed. Throws an error if programs are missing
	 * @param {string} dir - Directory to run the linting program in
	 * @param {string} prefix - Prefix to the lint command
	 */
	static async verifySetup(dir, prefix = "") {
		// Verify that Ruby is installed (required to execute RuboCop)
		if (!(await commandExists("ruby"))) {
			throw new Error("Ruby is not installed");
		}
		// Verify that RuboCop is installed
		try {
			run(`${prefix} rubocop -v`, { dir });
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
		if (extensions.length !== 1 || extensions[0] !== "rb") {
			throw new Error(`${this.name} error: File extensions are not configurable`);
		}

		const fixArg = fix ? "--auto-correct" : "";
		return run(`${prefix} rubocop --format json ${fixArg} ${args}`, {
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
				const { severity, message, cop_name: rule, corrected, location } = offense;
				if (!corrected) {
					const mappedSeverity = severityMap[severity] || "error";
					lintResult[mappedSeverity].push({
						path,
						firstLine: location.start_line,
						lastLine: location.last_line,
						message: `${removeTrailingPeriod(message)} (${rule})`,
					});
				}
			}
		}

		return lintResult;
	}
}

module.exports = RuboCop;
