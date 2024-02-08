const Staticcheck = require("../../../src/linters/staticcheck");

const testName = "staticcheck";
const linter = Staticcheck;
const commandPrefix = "";
const args = "";
const extensions = ["go"];

// Linting without auto-fixing
function getLintParams(dir) {
	const stdoutFile1 =
		"file1.go:20:2: this value of err is never used (SA4006)\nfile1.go:20:9: New doesn't have side effects and its return value is ignored (SA4017)\nfile1.go:31:6: func main1 is unused (U1000)";
	const stdoutFile2 = `file2.go:11:3: this linter directive didn't match anything; should it be removed? (staticcheck)\nfile2.go:12:19: calling regexp.MatchString in a loop has poor performance, consider using regexp.Compile (SA6000)\nfile2.go:25:6: func main2 is unused (U1000)`;
	return {
		// Expected output of the linting function
		cmdOutput: {
			status: 1,
			// stdoutParts: [stdoutFile1, stdoutFile2],
			stdout: `${stdoutFile1}\n${stdoutFile2}`,
		},
		// Expected output of the parsing function
		lintResult: {
			isSuccess: false,
			warning: [],
			error: [
				{
					path: "file1.go",
					firstLine: 20,
					lastLine: 20,
					message: "This value of err is never used (SA4006)",
				},
				{
					path: "file1.go",
					firstLine: 20,
					lastLine: 20,
					message: "New doesn't have side effects and its return value is ignored (SA4017)",
				},
				{
					path: "file1.go",
					firstLine: 31,
					lastLine: 31,
					message: "Func main1 is unused (U1000)",
				},
				{
					path: "file2.go",
					firstLine: 11,
					lastLine: 11,
					message:
						"This linter directive didn't match anything; should it be removed? (staticcheck)",
				},
				{
					path: "file2.go",
					firstLine: 12,
					lastLine: 12,
					message:
						"Calling regexp.MatchString in a loop has poor performance, consider using regexp.Compile (SA6000)",
				},
				{
					path: "file2.go",
					firstLine: 25,
					lastLine: 25,
					message: "Func main2 is unused (U1000)",
				},
			],
		},
	};
}

// Linting with auto-fixing
const getFixParams = getLintParams; // Does not support auto-fixing -> option has no effect

module.exports = [testName, linter, commandPrefix, extensions, args, getLintParams, getFixParams];
