const { run } = require("../utils/action");
const commandExists = require("../utils/command-exists");
const { initLintResult } = require("../utils/lint-result");

const PARSE_REGEX = /^(.*)\(([0-9]+),([0-9]+)\): (warning|error) (.*) \[.*$/gm;

/** @typedef {import('../utils/lint-result').LintResult} LintResult */

/**
 * https://github.com/dotnet/format
 */
class DotnetFormat {
	static get name() {
		return "dotnet_format";
	}

	/**
	 * Verifies that all required programs are installed. Throws an error if programs are missing
	 * @param {string} dir - Directory to run the linting program in
	 * @param {string} prefix - Prefix to the lint command
	 */
	static async verifySetup(dir, prefix = "") {
		// Verify that dotnet is installed (required to execute dotnet format)
		if (!(await commandExists("dotnet"))) {
			throw new Error(".NET SDK is not installed");
		}

		// Verify that dotnet-format is installed
		try {
			run(`${prefix} dotnet format --version`, { dir });
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
		if (extensions.length !== 1 || extensions[0] !== "cs") {
			throw new Error(`${this.name} error: File extensions are not configurable`);
		}

		const fixArg = fix ? "" : "--verify-no-changes";
		return run(`${prefix} dotnet format ${fixArg} ${args}`, {
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

		const matches = output.stderr.matchAll(PARSE_REGEX);
		for (const match of matches) {
			const [_line, pathFull, line, _column, level, message] = match;
			const path = pathFull.substring(dir.length + 1);
			const lineNr = parseInt(line, 10);
			lintResult[level].push({
				path,
				firstLine: lineNr,
				lastLine: lineNr,
				message: `${message}`,
			});
		}

		return lintResult;
	}
}

module.exports = DotnetFormat;
