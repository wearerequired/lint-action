const { EOL } = require("os");
const { sep } = require("path");

const Flake8 = require("../../../src/linters/flake8");

const testName = "flake8";
const linter = Flake8;
const args = "";
const commandPrefix = "";
const extensions = ["py"];

// Linting without auto-fixing
function getLintParams(dir) {
	const stdoutFile1 = `.${sep}file1.py:5:9: E211 whitespace before '('${EOL}.${sep}file1.py:26:1: E305 expected 2 blank lines after class or function definition, found 1`;
	const stdoutFile2 = `.${sep}file2.py:2:3: E111 indentation is not a multiple of four`;
	return {
		// Expected output of the linting function
		cmdOutput: {
			status: 1,
			stdoutParts: [stdoutFile1, stdoutFile2],
			stdout: `${stdoutFile1}${EOL}${stdoutFile2}`,
		},
		// Expected output of the parsing function
		lintResult: {
			isSuccess: false,
			warning: [],
			error: [
				{
					path: "file1.py",
					firstLine: 5,
					lastLine: 5,
					message: "Whitespace before '(' (E211)",
				},
				{
					path: "file1.py",
					firstLine: 26,
					lastLine: 26,
					message: "Expected 2 blank lines after class or function definition, found 1 (E305)",
				},
				{
					path: "file2.py",
					firstLine: 2,
					lastLine: 2,
					message: "Indentation is not a multiple of four (E111)",
				},
			],
		},
	};
}

// Linting with auto-fixing
const getFixParams = getLintParams; // Does not support auto-fixing -> option has no effect

module.exports = [testName, linter, commandPrefix, extensions, args, getLintParams, getFixParams];
