const { exit, run } = require("../utils");

/**
 * https://eslint.org
 */
class ESLint {
	/**
	 * Verifies that all required programs are installed. Exits the GitHub action if one of the
	 * programs is missing
	 */
	static verifySetup() {
		// Verify that NPM is installed (required to execute ESLint)
		try {
			run("command -v npm");
		} catch (err) {
			exit("NPM is not installed");
		}

		// Verify that ESLint is installed
		try {
			run("npx --no-install eslint -v");
		} catch (err) {
			exit("ESLint is not installed");
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
		return run(
			`npx --no-install eslint --ext ${extensions
				.map(ext => `.${ext}`)
				.join(",")} --no-color --format json .`,
			{
				dir,
				ignoreErrors: true,
			},
		).stdout;
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

		for (const result of resultsJson) {
			const { filePath, messages } = result;
			const path = filePath.substring(dir.length + 1);
			for (const msg of messages) {
				const { line, message, ruleId, severity } = msg;
				resultsParsed[severity].push({
					path,
					firstLine: line,
					lastLine: line,
					message: `${message} (${ruleId})`,
				});
			}
		}

		return resultsParsed;
	}
}

module.exports = ESLint;
