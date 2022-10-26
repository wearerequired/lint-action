const core = require("@actions/core");

const { run } = require("../utils/action");
const commandExists = require("../utils/command-exists");
const { initLintResult } = require("../utils/lint-result");
const { capitalizeFirstLetter } = require("../utils/string");

const PARSE_REGEX = /^(.+):([0-9]+):[0-9]+: (.+)$/gm;

/** @typedef {import('../utils/lint-result').LintResult} LintResult */

/**
 * https://github.com/golang/lint
 */
class Golint {
	static get name() {
		return "golint";
	}

	/**
	 * Verifies that all required programs are installed. Throws an error if programs are missing
	 * @param {string} dir - Directory to run the linting program in
	 * @param {string} prefix - Prefix to the lint command
	 */
	static async verifySetup(dir, prefix = "") {
		// Verify that golint is installed
		if (!(await commandExists("golint"))) {
			throw new Error(`${this.name} is not installed`);
		}
	}

	/**
	 * Runs the linting program and returns the command output
	 * @param {object} props - Params
	 * @param {string} props.dir - Directory to run the linter in
	 * @param {string[]} props.extensions - File extensions which should be linted
	 * @param {string} props.args - Additional arguments to pass to the linter
	 * @param {boolean} props.fix - If linter should attempt to fix code style issues automatically
	 * @param {string} props.prefix - Prefix to the lint binary
	 * @param {string} props.files - Files to lint
	 * @param {string} props.linterPrefix - Prefix to the entire lint command
	 * @returns {{status: number, stdout: string, stderr: string}} - Output of the lint command
	 */
	static lint({
		dir,
		extensions,
		args = "",
		fix = false,
		prefix = "",
		files = '"."',
		linterPrefix = "",
	}) {
		if (extensions.length !== 1 || extensions[0] !== "go") {
			throw new Error(`${this.name} error: File extensions are not configurable`);
		}
		if (fix) {
			core.warning(`${this.name} does not support auto-fixing`);
		}

		return run(`${prefix} golint -set_exit_status ${args} "."`, {
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

		const matches = output.stdout.matchAll(PARSE_REGEX);
		for (const match of matches) {
			const [_, path, line, text] = match;
			const lineNr = parseInt(line, 10);
			lintResult.error.push({
				path,
				firstLine: lineNr,
				lastLine: lineNr,
				message: capitalizeFirstLetter(text),
			});
		}

		return lintResult;
	}
}

module.exports = Golint;
