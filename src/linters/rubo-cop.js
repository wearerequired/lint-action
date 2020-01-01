const commandExists = require("../../vendor/command-exists");
const { run } = require("../utils/action");

/**
 * https://rubocop.readthedocs.io
 */
class RuboCop {
	static get name() {
		return "RuboCop";
	}

	/**
	 * Verifies that all required programs are installed. Exits the GitHub action if one of the
	 * programs is missing
	 *
	 * @param {string} dir: Directory to run the linting program in
	 */
	static async verifySetup(dir) {
		// Verify that Ruby is installed (required to execute RuboCop)
		if (!(await commandExists("ruby"))) {
			throw new Error("Ruby is not installed");
		}

		// Verify that RuboCop is installed
		if (!(await commandExists("rubocop"))) {
			throw new Error(`${this.name} is not installed`);
		}
	}

	/**
	 * Runs the linting program and returns the command output
	 *
	 * @param {string} dir: Directory to run the linting program in
	 * @param {string[]} extensions: Array of file extensions which should be linted
	 * @param {boolean} fix: Whether the linter should attempt to fix code style issues automatically
	 * @returns {string}: Results of the linting process
	 */
	static lint(dir, extensions, fix = false) {
		const output = JSON.parse(
			run(`rubocop --format json ${fix ? "--auto-correct" : ""} ${dir}`, {
				dir,
				ignoreErrors: true,
			}).stdout,
		);

		return JSON.stringify(
			output.files.flatMap(f =>
				f.offenses.map(o => ({
					path: f.path,
					firstLine: o.location.start_line,
					lastLine: o.location.last_line,
					message: o.message,
				})),
			),
		);
	}

	/**
	 * Parses the results of the linting process and returns it as a processable array
	 *
	 * @param {string} dir: Directory in which the linting program has been run
	 * @param {string} results: Results of the linting process
	 * @returns {object[]}: Parsed results
	 */
	static parseResults(dir, results) {
		return JSON.parse(results);
	}
}

module.exports = RuboCop;
