const { join } = require("path");

const Swiftlint = require("../../../src/linters/swiftlint");

const testName = "swiftlint";
const linter = Swiftlint;
const args = "";
const commandPrefix = "";
const extensions = ["swift"];

// Linting without auto-fixing
function getLintParams(dir) {
	const stdoutFile1 = `${join(
		dir,
		"file1.swift",
	)}:5:1: warning: Vertical Whitespace Violation: Limit vertical whitespace to a single empty line. Currently 2. (vertical_whitespace)`;
	const stdoutFile2 = `${join(
		dir,
		"file2.swift",
	)}:2:22: error: Trailing Semicolon Violation: Lines should not have trailing semicolons. (trailing_semicolon)`;
	return {
		// Expected output of the linting function
		cmdOutput: {
			// SwiftLint exit codes:
			// - 0: No errors
			// - 1: Usage or system error
			// - 2: Style violations of severity "Error"
			// - 3: No style violations of severity "Error", but severity "Warning" with --strict
			status: 2,
			stdoutParts: [stdoutFile1, stdoutFile2],
			stdout: `${stdoutFile1}\n${stdoutFile2}`,
		},
		// Expected output of the parsing function
		lintResult: {
			isSuccess: false,
			warning: [
				{
					path: "file1.swift",
					firstLine: 5,
					lastLine: 5,
					message:
						"Vertical Whitespace Violation: Limit vertical whitespace to a single empty line. Currently 2. (vertical_whitespace)",
				},
			],
			error: [
				{
					path: "file2.swift",
					firstLine: 2,
					lastLine: 2,
					message:
						"Trailing Semicolon Violation: Lines should not have trailing semicolons. (trailing_semicolon)",
				},
			],
		},
	};
}

// Linting with auto-fixing
function getFixParams(dir) {
	const stdoutFile1 = `${join(dir, "file1.swift")}:4:1 Corrected Vertical Whitespace`;
	const stdoutFile2 = `${join(dir, "file2.swift")}:2:22 Corrected Trailing Semicolon`;
	return {
		// Expected output of the linting function
		cmdOutput: {
			// SwiftLint exit codes:
			// - 0: No errors
			// - 1: Usage or system error
			// - 2: Style violations of severity "Error"
			// - 3: No style violations of severity "Error", but severity "Warning" with --strict
			status: 0,
			stdoutParts: [stdoutFile1, stdoutFile2],
			stdout: `${stdoutFile1}\n${stdoutFile2}`,
		},
		// Expected output of the parsing function
		lintResult: {
			isSuccess: true,
			warning: [],
			error: [],
		},
	};
}

module.exports = [testName, linter, commandPrefix, extensions, args, getLintParams, getFixParams];
