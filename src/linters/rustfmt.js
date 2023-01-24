const { run } = require("../utils/action");
const commandExists = require("../utils/command-exists");
const { initLintResult } = require("../utils/lint-result");

/** @typedef {import('../utils/lint-result').LintResult} LintResult */

const PARSE_REGEX = /([\s\S]*?) at line (\d*):$([\s\S]*)/m;

/**
 * https://github.com/rust-lang/rustfmt
 */
class RustFmt {
	static get name() {
		return "rustfmt";
	}

	/**
	 * Verifies that all required programs are installed. Throws an error if programs are missing
	 * @param {string} dir - Directory to run the linting program in
	 * @param {string} prefix - Prefix to the lint command
	 */
	static async verifySetup(dir, prefix = "") {
		// Verify that cargo format is installed
		if (!(await commandExists("cargo-fmt"))) {
			throw new Error("Cargo format is not installed");
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
	static lint(dir, extensions, args = "-- --color=never", fix = false, prefix = "") {
		if (extensions.length !== 1 || extensions[0] !== "rs") {
			throw new Error(`${this.name} error: File extensions are not configurable`);
		}
		const fixArg = fix ? "" : "--check";
		return run(`${prefix} cargo fmt ${fixArg} ${args}`, {
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
		if (!output.stdout) {
			return lintResult;
		}

		const diffs = output.stdout.split(/^Diff in /gm).slice(1);
		for (const diff of diffs) {
			const [_, pathFull, line, message] = diff.match(PARSE_REGEX);
			// Split on dir works for windows UNC paths, the substring strips out the
			// left over '/' or '\\'
			const path = pathFull.split(dir)[1].substring(1);
			const lineNr = parseInt(line, 10);
			lintResult.error.push({
				path,
				firstLine: lineNr,
				lastLine: lineNr,
				message,
			});
		}

		return lintResult;
	}
}

module.exports = RustFmt;
