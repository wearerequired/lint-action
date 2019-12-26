const { sep } = require("path");
const { run } = require("../utils/action");
const { capitalizeFirstLetter } = require("../utils/string");

const PARSE_REGEX = /^(.*):([0-9]+):([0-9]+): (\w*) (.*)$/gm;

/**
 * http://flake8.pycqa.org
 */
class Flake8 {
	/**
	 * Verifies that all required programs are installed. Exits the GitHub action if one of the
	 * programs is missing
	 *
	 * @param {string} dir: Directory to run the linting program in
	 */
	static verifySetup(dir) {
		// Verify that Python is installed (required to execute Flake8)
		try {
			run("command -v python", { dir });
		} catch (err) {
			throw new Error("Python is not installed");
		}

		// Verify that Flake8 is installed
		try {
			run("command -v flake8", { dir });
		} catch (err) {
			throw new Error("Flake8 is not installed");
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
		return run(`flake8 --filename ${extensions.map(ext => `"**${sep}*.${ext}"`).join(",")}`, {
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
		const matches = results.matchAll(PARSE_REGEX);

		// Parsed results: [notices, warnings, failures]
		const resultsParsed = [[], [], []];

		for (const match of matches) {
			const [_str, pathFull, line, _column, rule, text] = match;
			const path = pathFull.substring(2); // Remove "./" or ".\" from start of path
			const lineNr = parseInt(line, 10);
			resultsParsed[2].push({
				path,
				firstLine: lineNr,
				lastLine: lineNr,
				message: `${capitalizeFirstLetter(text)} (${rule})`,
			});
		}

		return resultsParsed;
	}
}

module.exports = Flake8;
