const { run } = require("../utils/action");
const commandExists = require("../utils/command-exists");
const { initLintResult } = require("../utils/lint-result");
const { getNpmBinCommand } = require("../utils/npm/get-npm-bin-command");
const { removeTrailingPeriod } = require("../utils/string");

/** @typedef {import('../utils/lint-result').LintResult} LintResult */

/**
 * https://eslint.org
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
		// const extensionsArg = extensions.map((ext) => `.${ext}`).join(",");
		// const fixArg = fix ? "--fix" : "";
		const commandPrefix = prefix || getNpmBinCommand(dir);
		return run(
			`${commandPrefix} tsc --noEmit --pretty false`,
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
	 * @returns {LintResult} - Parsed lint result
	 */
	static parseOutput(dir, output) {
		const lintResult = initLintResult();
		lintResult.isSuccess = output.status === 0;

const regex = /^(?<file>.+)\((?<line>\d+),(?<column>\d+)\):\s(?<code>\w+)\s(?<message>.+)$/gm;

		const errors = [];
		const matches = output.stdout.matchAll(regex);

		for (const match of matches) {
			const { file, line, column, code, message } = match.groups;
			errors.push({ file, line, column, code, message });
		}


		for (const error of errors) {
			const { file, line, message } = error;
			// const path = file.substring(dir.length + 1);

			// column = column || 0;

				const entry = {
					path: file,
					firstLine: Number(line),
					lastLine: Number(line),
					message: `${removeTrailingPeriod(message)}`,
				};

			lintResult.error.push(entry);
				// if (severity === 1) {
				// 	lintResult.warning.push(entry);
				// } else if (severity === 2) {
				// 	lintResult.error.push(entry);
				// }

		}

		return lintResult;
	}
}

module.exports = TSC;
