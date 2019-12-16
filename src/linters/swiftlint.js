const { exit, run } = require("../utils/action");

const PARSE_REGEX = /^(.*):([0-9]+):([0-9]+): (warning|error): (.*)$/gm;
const LEVELS = ["", "warning", "error"];

/**
 * https://github.com/realm/SwiftLint
 */
class SwiftLint {
	/**
	 * Verifies that all required programs are installed. Exits the GitHub action if one of the
	 * programs is missing
	 */
	static verifySetup() {
		// Verify that SwiftLint is installed
		try {
			run("command -v swiftlint");
		} catch (err) {
			exit("SwiftLint is not installed");
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
		if (extensions.length !== 1 || extensions[0] !== "swift") {
			exit(`SwiftLint error: File extensions are not configurable`);
		}

		return run("swiftlint", {
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
			const [_str, pathFull, line, _column, level, message] = match;
			const path = pathFull.substring(dir.length + 1);
			const lineNr = parseInt(line, 10);
			const levelIdx = LEVELS.indexOf(level);
			resultsParsed[levelIdx].push({
				path,
				firstLine: lineNr,
				lastLine: lineNr,
				message,
			});
		}

		return resultsParsed;
	}
}

module.exports = SwiftLint;
