const commandExists = require("../../vendor/command-exists");
const { run } = require("../utils/action");

const severityIndices = {
	convention: 1,
	refactor: 1,
	warning: 1,
	error: 2,
	fatal: 2,
};

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
		return run(`rubocop --format json ${fix ? "--auto-correct" : ""} ${dir}`, {
			dir,
			ignoreErrors: true,
		}).stdout;
	}

	/**
	 * Parses the results of the linting process and returns it as a processable array
	 *
	 * @param {string} dir: Directory in which the linting program has been run
	 * @param {string} results: Results of the linting process
	 * @returns {object[]}: Parsed results
	 */
	static parseResults(dir, results) {
		const resultsJson = JSON.parse(results);

		// Parsed results: [notices, warnings, failures]
		const resultsParsed = [[], [], []];

		for (const file of resultsJson.files) {
			const { path, offenses } = file;
			for (const offense of offenses) {
				const { severity, message, cop_name: rule, corrected, location } = offense;
				if (!corrected) {
					const severityIdx = severityIndices[severity] || 2;
					resultsParsed[severityIdx].push({
						path,
						firstLine: location.start_line,
						lastLine: location.last_line,
						// Message: Remove trailing period, write rule ID parentheses
						message: `${message.substring(0, message.length - 1)} (${rule})`,
					});
				}
			}
		}

		return resultsParsed;
	}
}

module.exports = RuboCop;
