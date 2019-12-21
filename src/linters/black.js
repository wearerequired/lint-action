const { exit, run } = require("../utils/action");
const { diffToParsedResults } = require("../utils/diff");

/**
 * https://black.readthedocs.io
 */
class Black {
	/**
	 * Verifies that all required programs are installed. Exits the GitHub action if one of the
	 * programs is missing
	 *
	 * @param {string} dir: Directory to run the linting program in
	 */
	static verifySetup(dir) {
		// Verify that Python is installed (required to execute Black)
		try {
			run("command -v python", { dir });
		} catch (err) {
			exit("Python is not installed");
		}

		// Verify that Black is installed
		try {
			run("command -v black", { dir });
		} catch (err) {
			exit("Black is not installed");
		}
	}

	/**
	 * Runs the linting program and returns the command output
	 *
	 * @param {string} dir: Directory to run the linting program in
	 * @param {string[]} extensions: Array of file extensions which should be linted
	 * @returns {string}: Results of the linting process
	 */
	static lint(dir, extensions) {
		return run(`black --diff --include "^.*\\.(${extensions.join("|")})$" "."`, {
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
		return diffToParsedResults(results);
	}
}

module.exports = Black;
