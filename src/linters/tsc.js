const core = require("@actions/core");

const { run } = require("../utils/action");
const commandExists = require("../utils/command-exists");
const { initLintResult } = require("../utils/lint-result");
const { getNpmBinCommand } = require("../utils/npm/get-npm-bin-command");
const { removeTrailingPeriod } = require("../utils/string");

/** @typedef {import('../utils/lint-result').LintResult} LintResult */

/**
 * https://www.typescriptlang.org/docs/handbook/compiler-options.html
 */
class TSC {
	static get name() {
		return "TypeScript";
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
			run(`${commandPrefix} tsc -v`, { dir });
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
		if (fix) {
			core.warning(`${this.name} does not support auto-fixing`);
		}

		const commandPrefix = prefix || getNpmBinCommand(dir);
		return run(`${commandPrefix} tsc --noEmit --pretty false ${args}`, {
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

		// example: file1.ts(4,25): error TS7005: Variable 'str' implicitly has an 'any' type.
		const regex = /^(?<file>.+)\((?<line>\d+),(?<column>\d+)\):\s(?<code>\w+)\s(?<message>.+)$/gm;

		const errors = [];
		const matches = output.stdout.matchAll(regex);

		for (const match of matches) {
			const { file, line, column, code, message } = match.groups;
			errors.push({ file, line, column, code, message });
		}

		for (const error of errors) {
			const { file, line, message } = error;

			const entry = {
				path: file,
				firstLine: Number(line),
				lastLine: Number(line),
				message: `${removeTrailingPeriod(message)}`,
			};

			lintResult.error.push(entry);
		}

		return lintResult;
	}
}

module.exports = TSC;
