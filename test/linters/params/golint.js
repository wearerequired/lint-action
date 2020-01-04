const Golint = require("../../../src/linters/golint");

const testName = "golint";
const linter = Golint;
const extensions = ["go"];

// Testing input/output for the Linter.lint function, with auto-fixing disabled
function getLintParams(dir) {
	const resultsFile1 =
		"file1.go:14:9: if block ends with a return statement, so drop this else and outdent its block";
	const resultsFile2 =
		'file2.go:3:1: comment on exported function Divide should be of the form "Divide ..."';
	return {
		// Strings that must be contained in the stdout of the lint command
		stdoutParts: [resultsFile1, resultsFile2],
		// Example output of the lint command, used to test the parsing function
		parseInput: `${resultsFile1}\n${resultsFile2}`,
		// Expected output of the parsing function
		parseResult: [
			[],
			[],
			[
				{
					path: "file1.go",
					firstLine: 14,
					lastLine: 14,
					message: `If block ends with a return statement, so drop this else and outdent its block`,
				},
				{
					path: "file2.go",
					firstLine: 3,
					lastLine: 3,
					message: `Comment on exported function Divide should be of the form "Divide ..."`,
				},
			],
		],
	};
}

// Testing input/output for the Linter.lint function, with auto-fixing enabled
const getFixParams = getLintParams; // Does not support auto-fixing -> option has no effect

module.exports = [testName, linter, extensions, getLintParams, getFixParams];
