const core = require("@actions/core");

const { run } = require("../utils/action");
const commandExists = require("../utils/command-exists");
const { initLintResult } = require("../utils/lint-result");
const { removeTrailingPeriod } = require("../utils/string");

/** @typedef {import('../utils/lint-result').LintResult} LintResult */

/**
 * https://github.com/squizlabs/PHP_CodeSniffer
 */
class PHPCodeSniffer {
	static get name() {
		return "PHP_CodeSniffer";
	}

	/**
	 * Verifies that all required programs are installed. Throws an error if programs are missing
	 * @param {string} dir - Directory to run the linting program in
	 * @param {string} prefix - Prefix to the lint command
	 */
	static async verifySetup(dir, prefix = "") {
		// Verify that PHP is installed (required to execute phpcs)
		if (!(await commandExists("php"))) {
			throw new Error("PHP is not installed");
		}

		// Verify that phpcs is installed
		try {
			run(`${prefix} phpcs --version`, { dir });
		} catch (err) {
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
		const extensionsArg = extensions.join(",");
		if (fix) {
			core.warning(`${this.name} does not support auto-fixing`);
		}

		return run(`${prefix} phpcs --extensions=${extensionsArg} --report=json -q ${args} "."`, {
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

		let outputJson;
		try {
			outputJson = JSON.parse(output.stdout);
		} catch (err) {
			throw Error(
				`Error parsing ${this.name} JSON output: ${err.message}. Output: "${output.stdout}"`,
			);
		}

		for (const [file, violations] of Object.entries(outputJson.files)) {
			const path = file.indexOf(dir) === 0 ? file.substring(dir.length + 1) : file;

			for (const msg of violations.messages) {
				const { line, message, source, type } = msg;

				const entry = {
					path,
					firstLine: line,
					lastLine: line,
					message: `${removeTrailingPeriod(message)} (${source})`,
				};
				if (type === "WARNING") {
					lintResult.warning.push(entry);
				} else if (type === "ERROR") {
					lintResult.error.push(entry);
				}
			}
		}

		return lintResult;
	}
}

module.exports = PHPCodeSniffer;
