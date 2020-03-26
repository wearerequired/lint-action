const fs = require("fs");
const { sep } = require("path");

const commandExists = require("../../vendor/command-exists");
const { log, run } = require("../utils/action");
const { initLintResult } = require("../utils/lint-result");
const { getCommandPrefix } = require("../utils/prefix");

const PARSE_REGEX = /^(.*):([0-9]+): (\w*): (.*)$/gm;

/**
 * https://mypy.readthedocs.io/en/stable/
 */
class Mypy {
	static get name() {
		return "Mypy";
	}

	/**
	 * Verifies that all required programs are installed. Throws an error if programs are missing
	 * @param {string} dir - Directory to run the linting program in
	 * @param {string} prefix - Prefix to the run command
	 */
	static async verifySetup(dir, prefix="") {
		// Verify that Python is installed (required to execute Mypy)
		if (!(await commandExists("python"))) {
			throw new Error("Python is not installed");
		}

		// Verify that Mypy is installed
		if (!(await commandExists("mypy"))) {
			throw new Error(`${this.name} is not installed`);
		}
	}

	/**
	 * Runs the linting program and returns the command output
	 * @param {string} dir - Directory to run the linter in
	 * @param {string[]} extensions - File extensions which should be linted
	 * @param {string} args - Additional arguments to pass to the linter
	 * @param {boolean} fix - Whether the linter should attempt to fix code style issues automatically
	 * @returns {{status: number, stdout: string, stderr: string}} - Output of the lint command
	 */
	static lint(dir, extensions, args = "", fix = false, prefix="") {
		if (extensions.length !== 1 || extensions[0] !== "py") {
			throw new Error(`${this.name} error: File extensions are not configurable`);
		}
		if (fix) {
			log(`${this.name} does not support auto-fixing`, "warning");
		}

		let specifiedPath = false;
		// Check if they passed a directory as an arg
		for (const arg of args.split(" ")) {
			if (fs.existsSync(arg)) {
				specifiedPath = true;
				break;
			}
		}
		let extraArgs = "";
		if (!specifiedPath) {
			extraArgs = ` ${dir}`;
		}
		return run(`${prefix}mypy ${args}${extraArgs}`, {
			dir,
			ignoreErrors: true
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
			const [_, pathFull, line, level, text] = match;
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

		return lintResult;
	}
}

module.exports = Mypy;
