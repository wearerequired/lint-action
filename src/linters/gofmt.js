const { run } = require("../utils/action");
const commandExists = require("../utils/command-exists");
const { parseErrorsFromDiff } = require("../utils/diff");
const { initLintResult } = require("../utils/lint-result");

/** @typedef {import('../utils/lint-result').LintResult} LintResult */

/**
 * https://golang.org/cmd/gofmt
 */
class Gofmt {
	static get name() {
		return "gofmt";
	}

	/**
	 * Verifies that all required programs are installed. Throws an error if programs are missing
	 * @param {string} dir - Directory to run the linting program in
	 * @param {string} prefix - Prefix to the lint command
	 */
	static async verifySetup(dir, prefix = "") {
		// Verify that gofmt is installed
		if (!(await commandExists("gofmt"))) {
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
		if (extensions.length !== 1 || extensions[0] !== "go") {
			throw new Error(`${this.name} error: File extensions are not configurable`);
		}

		// -d: Display diffs instead of rewriting files
		// -e: Report all errors (not just the first 10 on different lines)
		// -s: Simplify code
		// -w: Write result to (source) file instead of stdout
		const fixArg = fix ? "-w" : "-d -e";
		return run(`${prefix} gofmt -s ${fixArg} ${args} "."`, {
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

		// The gofmt output lines starting with "diff" differ from the ones of tools like Git:
		//
		//   - gofmt: "diff -u file-old.txt file-new.txt"
		//   - Git: "diff --git a/file-old.txt b/file-new.txt"
		//
		// The diff parser relies on the "a/" and "b/" strings to be able to tell where file names
		// start. Without these strings, this would not be possible, because file names may include
		// spaces, which are not escaped in unified diffs. As a workaround, these lines are filtered out
		// from the gofmt diff so the diff parser can read the diff without errors
		const filteredOutput = output.stdout
			.split(/\r?\n/)
			.filter((line) => !line.startsWith("diff "))
			.join("\n");
		lintResult.error = parseErrorsFromDiff(filteredOutput);

		// gofmt exits with 0 even if there are formatting issues. Therefore, this function determines
		// the success of the linting process based on the number of parsed errors
		lintResult.isSuccess = lintResult.error.length === 0;

		return lintResult;
	}
}

module.exports = Gofmt;
