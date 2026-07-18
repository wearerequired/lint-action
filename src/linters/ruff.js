const { run } = require("../utils/action");
const commandExists = require("../utils/command-exists");
const { initLintResult } = require("../utils/lint-result");

/** @typedef {import('../utils/lint-result').LintResult} LintResult */

/**
 * https://docs.astral.sh/ruff
 */
class Ruff {
	static get name() {
		return "Ruff";
	}

	/**
	 * Verifies that all required programs are installed. Throws an error if programs are missing
	 * @param {string} dir - Directory to run the linting program in
	 * @param {string} prefix - Prefix to the lint command
	 */
	static async verifySetup(dir, prefix = "") {
		// Verify that Python is installed (required to execute Ruff)
		if (!(await commandExists("python"))) {
			throw new Error("Python is not installed");
		}

		// Verify that Ruff is installed
		try {
			run(`${prefix} ruff --version`, { dir });
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
		if (extensions.length !== 1 || extensions[0] !== "py") {
			throw new Error(`${this.name} error: File extensions are not configurable`);
		}

		const fixArg = fix ? "--fix" : "";
		return run(`${prefix} ruff check --output-format json ${fixArg} ${args} .`, {
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

		let violations;
		try {
			violations = JSON.parse(output.stdout);
		} catch (err) {
			throw Error(
				`Error parsing ${this.name} JSON output: ${err.message}. Output: "${output.stdout}"`,
			);
		}

		// Compare with forward slashes so the directory is stripped regardless of the path separator
		// Ruff uses
		const normalizedDir = dir.replace(/\\/g, "/");
		for (const violation of violations) {
			const { filename, message, code, location } = violation;
			// Ruff reports absolute paths; strip the directory it ran in
			const normalizedFile = filename.replace(/\\/g, "/");
			const path = normalizedFile.startsWith(`${normalizedDir}/`)
				? normalizedFile.substring(normalizedDir.length + 1)
				: normalizedFile;
			lintResult.error.push({
				path,
				firstLine: location.row,
				lastLine: location.row,
				message: code ? `${message} (${code})` : message,
			});
		}

		return lintResult;
	}
}

module.exports = Ruff;
