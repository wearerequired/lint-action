const Golint = require("../../../src/linters/golint");

const testName = "golint";
const linter = Golint;
const commandPrefix = "";
const args = "";
const extensions = ["go"];

// Linting without auto-fixing
function getLintParams(dir) {
	const stdoutFile1 =
		"file1.go:14:9: if block ends with a return statement, so drop this else and outdent its block";
	const stdoutFile2 =
		'file2.go:3:1: comment on exported function Divide should be of the form "Divide ..."';
	return {
		// Expected output of the linting function
		cmdOutput: {
			status: 1,
			stdoutParts: [stdoutFile1, stdoutFile2],
			stdout: `${stdoutFile1}\n${stdoutFile2}`,
		},
		// Expected output of the parsing function
		lintResult: {
			isSuccess: false,
			warning: [],
			error: [
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
		},
	};
}

// Linting with auto-fixing
const getFixParams = getLintParams; // Does not support auto-fixing -> option has no effect

module.exports = [testName, linter, commandPrefix, extensions, args, getLintParams, getFixParams];
