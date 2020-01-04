const { EOL } = require("os");
const { sep } = require("path");
const Flake8 = require("../../../src/linters/flake8");

const testName = "flake8";
const linter = Flake8;
const extensions = ["py"];

// Testing input/output for the Linter.lint function, with auto-fixing disabled
function getLintParams(dir) {
	const resultsFile1 = `.${sep}file1.py:5:9: E211 whitespace before '('${EOL}.${sep}file1.py:26:1: E305 expected 2 blank lines after class or function definition, found 1`;
	const resultsFile2 = `.${sep}file2.py:2:3: E111 indentation is not a multiple of four`;
	return {
		// Strings that must be contained in the stdout of the lint command
		stdoutParts: [resultsFile1, resultsFile2],
		// Example output of the lint command, used to test the parsing function
		parseInput: `${resultsFile1}${EOL}${resultsFile2}`,
		// Expected output of the parsing function
		parseResult: [
			[],
			[],
			[
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
		],
	};
}

// Testing input/output for the Linter.lint function, with auto-fixing enabled
const getFixParams = getLintParams; // Does not support auto-fixing -> option has no effect

module.exports = [testName, linter, extensions, getLintParams, getFixParams];
