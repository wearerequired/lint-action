const { exit, run } = require("../utils/action");
const { diffToParsedResults } = require("../utils/diff");

/**
 * https://golang.org/cmd/gofmt
 */
class Gofmt {
	/**
	 * Verifies that all required programs are installed. Exits the GitHub action if one of the
	 * programs is missing
	 */
	static verifySetup() {
		// Verify that gofmt is installed
		try {
			run("command -v gofmt");
		} catch (err) {
			exit("gofmt is not installed");
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
		if (extensions.length !== 1 || extensions[0] !== "go") {
			exit(`gofmt error: File extensions are not configurable`);
		}

		// -d: Display diffs instead of rewriting files
		// -e: Report all errors (not just the first 10 on different lines)
		return run("gofmt -d -e .", {
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
		// The gofmt output lines starting with "diff" differ from the ones of tools like Git:
		//
		//   - gofmt: "diff -u file-old.txt file-new.txt"
		//   - Git: "diff --git a/file-old.txt b/file-new.txt"
		//
		// The diff parser relies on the "a/" and "b/" strings to be able to tell where file names
		// start. Without these strings, this would not be possible, because file names may include
		// spaces, which are not escaped in unified diffs. As a workaround, these lines are filtered out
		// from the gofmt diff so the diff parser can read the diff without errors
		const resultsFiltered = results
			.split(/\r?\n/)
			.filter(line => !line.startsWith("diff -u"))
			.join("\n");
		return diffToParsedResults(resultsFiltered);
	}
}

module.exports = Gofmt;
