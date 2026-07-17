const Prettier = require("../../../src/linters/prettier");

const testName = "prettier-invalid";
const linter = Prettier;
const args = "";
const commandPrefix = "";
const extensions = ["ts", "css"];

// Prettier fails to parse the files in this project. It then exits without listing anything on
// stdout and prints the parse errors to stderr instead. This used to produce an annotation with an
// empty path (rejected by the GitHub API with a 422 error); see #718.
function getLintParams(dir) {
	const stderrFile1 = `[error] file1.ts: SyntaxError: '}' expected. (2:1)`;
	const stderrFile2 = `[error] file2.css: SyntaxError: CssSyntaxError: Unclosed block (1:5)`;
	// Full stderr including the code frames Prettier prints below each error summary
	const stderr = `${stderrFile1}\n[error]   1 | const x = {\n[error] > 2 |\n[error]     | ^\n${stderrFile2}\n[error] > 1 | a {{{ color: red\n[error]     |     ^\n[error]   2 |`;
	return {
		// Expected output of the linting function
		cmdOutput: {
			status: 2,
			stdout: "",
			stderrParts: [stderrFile1, stderrFile2],
			stderr,
		},
		// Expected output of the parsing function
		lintResult: {
			isSuccess: false,
			warning: [],
			error: [
				{
					path: "file1.ts",
					firstLine: 2,
					lastLine: 2,
					message: "SyntaxError: '}' expected.",
				},
				{
					path: "file2.css",
					firstLine: 1,
					lastLine: 1,
					message: "SyntaxError: CssSyntaxError: Unclosed block",
				},
			],
		},
	};
}

// Prettier behaves identically with `--write`: it cannot parse the files, so nothing is fixed
const getFixParams = getLintParams;

module.exports = [testName, linter, commandPrefix, extensions, args, getLintParams, getFixParams];
