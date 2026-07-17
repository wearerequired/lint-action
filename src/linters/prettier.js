const { sep } = require("path");

const { run } = require("../utils/action");
const commandExists = require("../utils/command-exists");
const { initLintResult } = require("../utils/lint-result");
const { getNpmBinCommand } = require("../utils/npm/get-npm-bin-command");

/** @typedef {import('../utils/lint-result').LintResult} LintResult */

// Matches the summary lines Prettier prints to stderr when a file cannot be parsed, e.g.
// `[error] file.ts: SyntaxError: '}' expected. (2:1)`. Only error-level lines carry a file
// position; Prettier's `[warn]` lines are option/config warnings without one. The path is anchored
// to a single line so it does not swallow the code frame Prettier prints on the following lines
const PARSE_REGEX = /^\[error] ([^:\n]*): (.*) \(([0-9]+):([0-9]+)\)$/gm;

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

		// In `--list-different` mode Prettier prints the paths of files with formatting issues to
		// stdout, one per line. Empty lines are skipped so a crash (empty stdout) does not produce an
		// annotation with a blank path, which the GitHub API rejects with a 422 error
		const paths = output.stdout.split(/\r?\n/).filter((path) => path.length > 0);
		lintResult.error = paths.map((path) => ({
			path,
			firstLine: 1,
			lastLine: 1,
			message:
				"There are issues with this file's formatting, please run Prettier to fix the errors",
		}));

		// When Prettier fails to parse a file (e.g. a syntax error) it exits without listing the file
		// on stdout and instead prints the error to stderr. Parse it to surface a useful annotation
		// instead of a generic empty failure
		const leadingPathSep = `.${sep}`;
		for (const match of (output.stderr || "").matchAll(PARSE_REGEX)) {
			const [, pathRaw, message, line] = match;
			const path = pathRaw.startsWith(leadingPathSep) ? pathRaw.substring(2) : pathRaw;
			const lineNr = parseInt(line, 10);
			lintResult.error.push({ path, firstLine: lineNr, lastLine: lineNr, message });
		}

		return lintResult;
	}
}

module.exports = Prettier;
