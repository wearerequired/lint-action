const { run } = require("../utils/action");
const commandExists = require("../utils/command-exists");
const { getViolationSeparator } = require("../utils/dart-analyzer");
const { initLintResult } = require("../utils/lint-result");

/**
 * https://dart.dev
 */
class DartAnalyzer {
	static get name() {
		return "DartAnalyzer";
	}

	/**
	 * Verifies that all required programs are installed. Throws an error if programs are missing
	 * @param {string} dir - Directory to run the linting program in
	 * @param {string} prefix - Prefix to the lint command
	 */
	static async verifySetup(dir, prefix = "") {
		// Verify that NPM is installed (required to execute ESLint)
		if (!(await commandExists("dartanalyzer"))) {
			throw new Error("Dart SDK is not installed");
		}

		// Verify that Dart SDK is installed
		const commandPrefix = prefix || "";
		try {
			run(`${commandPrefix} dartanalyzer --version `, { dir });
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
		const commandPrefix = prefix || "";

		return run(`${commandPrefix} dartanalyzer ${args} "."`, {
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

		const violations = output.stdout.split("\n").filter((line) => line.startsWith("  "));

		for (const violation of violations) {
			const items = violation.split(getViolationSeparator()).map((item) => item.trim());

			const type = items[0];
			const message = items[1];

			const location = items[2].split(":");
			const path = location[0];
			const line = parseInt(location[1], 10);

			const ruleId = items[3];

			let rule = ruleId;
			if (type === "lint") {
				rule = `[${ruleId}](https://dart-lang.github.io/linter/lints/${ruleId})`;
			}

			const entry = {
				path,
				firstLine: line,
				lastLine: line,
				message: `${message} (${rule})`,
			};

			if (type === "error") {
				lintResult.error.push(entry);
			} else {
				lintResult.warning.push(entry);
			}
		}
		return lintResult;
	}
}

module.exports = DartAnalyzer;
