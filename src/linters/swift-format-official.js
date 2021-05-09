const { run, execute } = require("../utils/action");
const commandExists = require("../utils/command-exists");
const { initLintResult } = require("../utils/lint-result");

const PARSE_REGEX = /^(.*):([0-9]+):([0-9]+): (warning|error): (.*)$/gm;

/**
 * https://github.com/apple/swift-format
 */
class SwiftFormatOfficial {
	static get name() {
		return "swift-format";
	}

	/**
	 * Verifies that all required programs are installed. Throws an error if programs are missing
	 * @param {string} dir - Directory to run the linting program in
	 * @param {string} prefix - Prefix to the lint command
	 */
	static async verifySetup(dir, prefix = "") {
		// Verify that swift-format is installed.
		if (!(await commandExists("swift-format"))) {
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
		if (extensions.length !== 1 || extensions[0] !== "swift") {
			throw new Error(`${this.name} error: File extensions are not configurable`);
		}

		if (process.platform === "win32") {
			if (args.length !== 0) {
				throw new Error(`${this.name} error: args is unsupported on Windows`);
			}
			if (prefix.length !== 0) {
				throw new Error(`${this.name} error: prefix is unsupported on Windows`);
			}
		}

		const modeArgs = fix ? ["format", "-i"] : ["lint"];
		if (process.platform === "win32") {
			return execute("swift-format", modeArgs.concat(["--recursive", "."]), {
				dir,
				ignoreErrors: true,
			});
		} else {
			return run(`${prefix} swift-format ${modeArgs.join(" ")} ${args} --recursive "."`, {
				dir,
				ignoreErrors: true,
			});
		}
	}

	/**
	 * Parses the output of the lint command. Determines the success of the lint process and the
	 * severity of the identified code style violations
	 * @param {string} dir - Directory in which the linter has been run
	 * @param {{status: number, stdout: string, stderr: string}} output - Output of the lint command
	 * @returns {import('../utils/lint-result').LintResult} - Parsed lint result
	 */
	static parseOutput(dir, output) {
		const lintResult = initLintResult();

		const matches = output.stderr.matchAll(PARSE_REGEX);
		for (const match of matches) {
			const [_line, pathFull, line, _column, _level, message] = match;
			const path = pathFull.substring(dir.length + 1);
			const lineNr = parseInt(line, 10);
			// swift-format only seems to use the "warning" level, which this action will therefore
			// categorize as errors
			lintResult.error.push({
				path,
				firstLine: lineNr,
				lastLine: lineNr,
				message: `${message}`,
			});
		}

		// Since 0.50300.0 swift-format exits with 0 even if there are formatting issues. Therefore,
		// this function determines the success of the linting process based on the number of parsed
		// errors.
		lintResult.isSuccess = lintResult.error.length === 0;

		return lintResult;
	}
}

module.exports = SwiftFormatOfficial;
