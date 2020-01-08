const commandExists = require("../../vendor/command-exists");
const { sep } = require("path");
const { log, run } = require("../utils/action");
const { initLintResult } = require("../utils/lint-result");
const { capitalizeFirstLetter } = require("../utils/string");

const PARSE_REGEX = /^(.*):([0-9]+):[0-9]+: (\w*) (.*)$/gm;

/**
 * http://flake8.pycqa.org
 */
class Flake8 {
	static get name() {
		return "Flake8";
	}

	/**
	 * Verifies that all required programs are installed. Throws an error if programs are missing
	 * @param {string} dir - Directory to run the linting program in
	 */
	static async verifySetup(dir) {
		// Verify that Python is installed (required to execute Flake8)
		if (!(await commandExists("python"))) {
			throw new Error("Python is not installed");
		}

		// Verify that Flake8 is installed
		if (!(await commandExists("flake8"))) {
			throw new Error(`${this.name} is not installed`);
		}
	}

	/**
	 * Runs the linting program and returns the command output
	 * @param {string} dir - Directory to run the linter in
	 * @param {string[]} extensions - File extensions which should be linted
	 * @param {boolean} fix - Whether the linter should attempt to fix code style issues automatically
	 * @returns {{status: number, stdout: string, stderr: string}} - Output of the lint command
	 */
	static lint(dir, extensions, fix = false) {
		if (fix) {
			log(`${this.name} does not support auto-fixing`, "warning");
		}
		return run(`flake8 --filename ${extensions.map(ext => `"**${sep}*.${ext}"`).join(",")}`, {
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

		const matches = output.stdout.matchAll(PARSE_REGEX);
		for (const match of matches) {
			const [_, pathFull, line, rule, text] = match;
			const path = pathFull.substring(2); // Remove "./" or ".\" from start of path
			const lineNr = parseInt(line, 10);
			lintResult.error.push({
				path,
				firstLine: lineNr,
				lastLine: lineNr,
				message: `${capitalizeFirstLetter(text)} (${rule})`,
			});
		}

		return lintResult;
	}
}

module.exports = Flake8;
