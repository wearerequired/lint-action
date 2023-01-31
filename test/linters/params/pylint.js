const { EOL } = require("os");

const Pylint = require("../../../src/linters/pylint");

const testName = "pylint";
const linter = Pylint;
const args = "";
const commandPrefix = "";
const extensions = ["py"];

// Linting without auto-fixing
function getLintParams(dir) {
	const stdoutFile1 = `file1.py:1:0: C0114: Missing module docstring (missing-module-docstring)${EOL}file1.py:1:0: C0115: Missing class docstring (missing-class-docstring)${EOL}file1.py:1:0: C0103: Class name "animal" doesn't conform to PascalCase naming style (invalid-name)${EOL}file1.py:1:0: R0903: Too few public methods (0/2) (too-few-public-methods)`;
	const stdoutFile2 = `file2.py:1:0: C0114: Missing module docstring (missing-module-docstring)${EOL}file2.py:1:0: C0103: Constant name "a" doesn't conform to UPPER_CASE naming style (invalid-name)${EOL}file2.py:2:0: C0103: Constant name "b" doesn't conform to UPPER_CASE naming style (invalid-name)${EOL}file2.py:3:0: C0103: Constant name "c" doesn't conform to UPPER_CASE naming style (invalid-name)`;
	return {
		// Expected output of the linting function
		cmdOutput: {
			status: 24, // 1 refactor message (exit code 8) and 7 convention messages (exit code 16)
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
					firstLine: 1,
					lastLine: 1,
					message: "Missing module docstring (missing-module-docstring, C0114)",
				},
				{
					path: "file1.py",
					firstLine: 1,
					lastLine: 1,
					message: "Missing class docstring (missing-class-docstring, C0115)",
				},
				{
					path: "file1.py",
					firstLine: 1,
					lastLine: 1,
					message:
						'Class name "animal" doesn\'t conform to PascalCase naming style (invalid-name, C0103)',
				},
				{
					path: "file1.py",
					firstLine: 1,
					lastLine: 1,
					message: "Too few public methods (0/2) (too-few-public-methods, R0903)",
				},
				{
					path: "file2.py",
					firstLine: 1,
					lastLine: 1,
					message: "Missing module docstring (missing-module-docstring, C0114)",
				},
				{
					path: "file2.py",
					firstLine: 1,
					lastLine: 1,
					message:
						'Constant name "a" doesn\'t conform to UPPER_CASE naming style (invalid-name, C0103)',
				},
				{
					path: "file2.py",
					firstLine: 2,
					lastLine: 2,
					message:
						'Constant name "b" doesn\'t conform to UPPER_CASE naming style (invalid-name, C0103)',
				},
				{
					path: "file2.py",
					firstLine: 3,
					lastLine: 3,
					message:
						'Constant name "c" doesn\'t conform to UPPER_CASE naming style (invalid-name, C0103)',
				},
			],
		},
	};
}

// Linting with auto-fixing
const getFixParams = getLintParams; // Does not support auto-fixing -> option has no effect

module.exports = [testName, linter, commandPrefix, extensions, args, getLintParams, getFixParams];
