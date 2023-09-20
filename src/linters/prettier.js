const { sep } = require("path");

const { run } = require("../utils/action");
const commandExists = require("../utils/command-exists");
const { initLintResult } = require("../utils/lint-result");
const { getNpmBinCommand } = require("../utils/npm/get-npm-bin-command");

/** @typedef {import('../utils/lint-result').LintResult} LintResult */

const PARSE_REGEX = /^\[(warning|error)] ([^:]*): (.*) \(([0-9]+):([0-9]+)\)$/gm;

/**
 * https://prettier.io
 */
class Prettier {
	static get name() {
		return "Prettier";
	}

	/**
	 * Verifies that all required programs are installed. Throws an error if programs are missing
	 * @param {string} dir - Directory to run the linting program in
	 * @param {string} prefix - Prefix to the lint command
	 */
	static async verifySetup(dir, prefix = "") {
		// Verify that NPM is installed (required to execute Prettier)
		if (!(await commandExists("npm"))) {
			throw new Error("NPM is not installed");
		}

		// Verify that Prettier is installed
		const commandPrefix = prefix || getNpmBinCommand(dir);
		try {
			run(`${commandPrefix} prettier -v`, { dir });
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
		const files =
			extensions.length === 1 ? `**/*.${extensions[0]}` : `**/*.{${extensions.join(",")}}`;
		const fixArg = fix ? "--write" : "--list-different";
		const commandPrefix = prefix || getNpmBinCommand(dir);
		return run(`${commandPrefix} prettier ${fixArg} --no-color ${args} "${files}"`, {
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
		if (lintResult.isSuccess || !output) {
			return lintResult;
		}

		const paths = output.stdout.split(/\r?\n/);
		lintResult.error = paths
			.filter((path) => !!path)
			.map((path) => ({
				path,
				firstLine: 1,
				lastLine: 1,
				message:
					"There are issues with this file's formatting, please run Prettier to fix the errors",
			}));

		// Fall back to stderr if stdout is empty
		if (lintResult.error.length === 0 && output.stderr) {
			const matches = output.stderr.matchAll(PARSE_REGEX);
			for (const match of matches) {
				const [_, level, pathFull, text, line] = match;
				const leadingSep = `.${sep}`;
				let path = pathFull;
				if (path.startsWith(leadingSep)) {
					path = path.substring(2); // Remove "./" or ".\" from start of path
				}
				const lineNr = parseInt(line, 10);
				const result = {
					path,
					firstLine: lineNr,
					lastLine: lineNr,
					message: text,
				};
				if (level === "error") {
					lintResult.error.push(result);
				} else if (level === "warning") {
					lintResult.warning.push(result);
				}
			}
		}

		return lintResult;
	}
}

module.exports = Prettier;
