const { run } = require("../utils/action");
const commandExists = require("../utils/command-exists");
const { initLintResult } = require("../utils/lint-result");
const { getNpmBinCommand } = require("../utils/npm/get-npm-bin-command");
const { removeTrailingPeriod } = require("../utils/string");

/** @typedef {import('../utils/lint-result').LintResult} LintResult */

/**
 * https://eslint.org
 */
class ESLint {
	static get name() {
		return "ESLint";
	}

	/**
	 * Verifies that all required programs are installed. Throws an error if programs are missing
	 * @param {string} dir - Directory to run the linting program in
	 * @param {string} prefix - Prefix to the lint command
	 */
	static async verifySetup(dir, prefix = "") {
		// Verify that NPM is installed (required to execute ESLint)
		if (!(await commandExists("npm"))) {
			throw new Error("NPM is not installed");
		}

		// Verify that ESLint is installed
		const commandPrefix = prefix || getNpmBinCommand(dir);
		try {
			run(`${commandPrefix} eslint -v`, { dir });
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
	static lint(dir, extensions = [], args = "", fix = false, prefix = "") {
		const commandPrefix = prefix || getNpmBinCommand(dir);
		const { stdout: version } = run(`${commandPrefix} eslint -v`, { dir });
		const isV9 = version.startsWith("v9.");
		const extensionsArg =
			extensions.length > 0 ? `--ext ${extensions.map((ext) => `.${ext}`).join(",")}` : "";
		const fixArg = fix ? "--fix" : "";

		const command = [
			commandPrefix,
			"eslint",
			isV9 ? "" : extensionsArg,
			fixArg,
			"--no-color",
			"--format json",
			args,
			'"."',
		]
			.filter((s) => s.length > 0)
			.join(" ");

		return run(command, {
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

		for (const violation of outputJson) {
			const { filePath, messages } = violation;
			const path = filePath.substring(dir.length + 1);

			for (const msg of messages) {
				const { fatal, line, message, ruleId, severity } = msg;

				// Exit if a fatal ESLint error occurred
				if (fatal) {
					throw Error(`ESLint error: ${message}`);
				}

				const entry = {
					path,
					firstLine: line,
					lastLine: line,
					message: `${removeTrailingPeriod(message)} (${ruleId})`,
				};
				if (severity === 1) {
					lintResult.warning.push(entry);
				} else if (severity === 2) {
					lintResult.error.push(entry);
				}
			}
		}

		return lintResult;
	}
}

module.exports = ESLint;
