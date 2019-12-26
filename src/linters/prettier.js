const { run } = require("../utils/action");

/**
 * https://prettier.io
 */
class Prettier {
	/**
	 * Verifies that all required programs are installed. Exits the GitHub action if one of the
	 * programs is missing
	 *
	 * @param {string} dir: Directory to run the linting program in
	 */
	static verifySetup(dir) {
		// Verify that NPM is installed (required to execute Prettier)
		try {
			run("command -v npm", { dir });
		} catch (err) {
			throw new Error("NPM is not installed");
		}

		// Verify that Prettier is installed
		try {
			run("npx --no-install prettier -v", { dir });
		} catch (err) {
			throw new Error("Prettier is not installed");
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
		const files =
			extensions.length === 1 ? `**/*.${extensions[0]}` : `**/*.{${extensions.join(",")}}`;
		const results = run(
			`npx --no-install prettier ${fix ? "--write" : "--list-different"} --no-color "${files}"`,
			{
				dir,
				ignoreErrors: true,
			},
		).stdout;
		return fix ? "" : results;
	}

	/**
	 * Parses the results of the linting process and returns it as a processable array
	 *
	 * @param {string} dir: Directory in which the linting program has been run
	 * @param {string} results: Results of the linting process
	 * @returns {object[]}: Parsed results
	 */
	static parseResults(dir, results) {
		// Parsed results: [notices, warnings, failures]
		const resultsParsed = [[], [], []];

		if (!results) {
			return resultsParsed;
		}

		const paths = results.split(/\r?\n/);
		resultsParsed[2] = paths.map(path => ({
			path,
			firstLine: 1,
			lastLine: 1,
			message:
				"There are issues with this file's formatting. Please run Prettier on the file to fix the errors.",
		}));

		return resultsParsed;
	}
}

module.exports = Prettier;
