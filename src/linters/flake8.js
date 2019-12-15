const { capitalizeFirstLetter, exit, run } = require("../utils");

const PARSE_REGEX = /^(.*):([0-9]+):([0-9]+): (\w*) (.*)$/gm;

/**
 * http://flake8.pycqa.org
 */
class Flake8 {
	/**
	 * Verifies that all required programs are installed. Exits the GitHub action if one of the
	 * programs is missing
	 */
	static verifySetup() {
		// Verify that Python is installed (required to execute flake8)
		try {
			run("command -v python");
		} catch (err) {
			exit("Python is not installed");
		}

		// Verify that flake8 is installed
		try {
			run("command -v flake8");
		} catch (err) {
			exit("flake8 is not installed");
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
		return run(`flake8 --filename ${extensions.map(ext => `'**/*.${ext}'`).join(",")}`, {
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
			const path = pathFull.substring(2); // Remove "./" from start of path
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
