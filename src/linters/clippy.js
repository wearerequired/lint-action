const { log, run } = require("../utils/action");
const commandExists = require("../utils/command-exists");
const { initLintResult } = require("../utils/lint-result");

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

		// auto-fix can be run with the following command:
		// cargo clippy --fix -Z unstable-options
		if (fix) {
			log(`${this.name} does only suport auto-fixing in nightly channel`, "warning");
		}

		return run(`${prefix} cargo clippy --message-format json ${args}`, {
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
		lintResult.isSuccess = false;

		const lines = output.stdout.split("\n").map((line) => {
			let parsedLine;
			try {
				parsedLine = JSON.parse(line);
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
					const { message, spans } = line.message;
					// don't add the message counting the warnings
					if (message.code !== null) {
						lintResult.warning.push({
							path: spans[0].file_name,
							firstLine: spans[0].line_start,
							lastLine: spans[0].line_end,
							message,
						});
					}
				} else if (line.message.level === "error") {
					const { message, spans } = line.message;
					// don't add the message counting the errors
					if (message.code !== null) {
						lintResult.warning.push({
							path: spans[0].file_name,
							firstLine: spans[0].line_start,
							lastLine: spans[0].line_end,
							message,
						});
					}
				}
			} else if (line.reason === "build-finished") {
				lintResult.isSuccess = line.success;
			}
		});

		return lintResult;
	}
}

module.exports = Clippy;
