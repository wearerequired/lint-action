const { run } = require("../utils/action");
const commandExists = require("../utils/command-exists");
const { initLintResult } = require("../utils/lint-result");

/** @typedef {import('../utils/lint-result').LintResult} LintResult */

/**
 * https://rust-lang.github.io/rust-clippy/
 */
class Clippy {
	static get name() {
		return "clippy";
	}

	/**
	 * Verifies that all required programs are installed. Throws an error if programs are missing
	 * @param {string} dir - Directory to run the linting program in
	 * @param {string} prefix - Prefix to the lint command
	 */
	static async verifySetup(dir, prefix = "") {
		// Verify that cargo is installed (required to execute clippy)
		if (!(await commandExists("cargo"))) {
			throw new Error("cargo is not installed");
		}

		// Verify that clippy is installed
		try {
			run(`${prefix} cargo clippy --version`, { dir });
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
		if (extensions.length !== 1 || extensions[0] !== "rs") {
			throw new Error(`${this.name} error: File extensions are not configurable`);
		}

		// clippy will throw an error if `--allow-dirty` is used when `--fix` isn't.
		// in order to have tests run consistently and to help out users we remove `--allow-dirty`
		// when not in fix
		const localArgs = fix ? args : args.replace("--allow-dirty", "");

		const fixArg = fix ? "--fix" : "";
		return run(`${prefix} cargo clippy ${fixArg} --message-format json ${localArgs}`, {
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

		const lines = output.stdout.split("\n").map((line) => {
			let parsedLine;
			try {
				let normalizedLine = line;
				if (process.platform === "win32") {
					normalizedLine = line.replace(/\\/gi, "\\\\");
				}
				parsedLine = JSON.parse(normalizedLine);
			} catch (err) {
				throw Error(
					`Error parsing ${this.name} JSON output: ${err.message}. Output: "${output.stdout}"`,
				);
			}
			return parsedLine;
		});

		lines.forEach((line) => {
			if (line.reason === "compiler-message") {
				if (line.message.level === "warning") {
					const { code, message, spans } = line.message;
					// don't add the message counting the warnings
					if (code !== null) {
						lintResult.warning.push({
							path: spans[0].file_name,
							firstLine: spans[0].line_start,
							lastLine: spans[0].line_end,
							message,
						});
					}
				} else if (line.message.level === "error") {
					const { code, message, spans } = line.message;
					// don't add the message counting the errors
					if (code !== null) {
						lintResult.warning.push({
							path: spans[0].file_name,
							firstLine: spans[0].line_start,
							lastLine: spans[0].line_end,
							message,
						});
					}
				}
			}
		});

		lintResult.isSuccess =
			output.status === 0 && lintResult.warning.length === 0 && lintResult.error.length === 0;

		return lintResult;
	}
}

module.exports = Clippy;
