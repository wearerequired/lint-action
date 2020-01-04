const { join } = require("path");
const Swiftlint = require("../../../src/linters/swiftlint");

const testName = "swiftlint";
const linter = Swiftlint;
const extensions = ["swift"];

// Testing input/output for the Linter.lint function, with auto-fixing disabled
function getLintParams(dir) {
	const resultsFile1 = `${join(
		dir,
		"file1.swift",
	)}:5:1: warning: Vertical Whitespace Violation: Limit vertical whitespace to a single empty line. Currently 2. (vertical_whitespace)`;
	const resultsFile2 = `${join(
		dir,
		"file2.swift",
	)}:2:22: error: Trailing Semicolon Violation: Lines should not have trailing semicolons. (trailing_semicolon)`;
	return {
		// Strings that must be contained in the stdout of the lint command
		stdoutParts: [resultsFile1, resultsFile2],
		// Example output of the lint command, used to test the parsing function
		parseInput: `${resultsFile1}\n${resultsFile2}`,
		// Expected output of the parsing function
		parseResult: [
			[],
			[
				{
					path: "file1.swift",
					firstLine: 5,
					lastLine: 5,
					message:
						"Vertical Whitespace Violation: Limit vertical whitespace to a single empty line. Currently 2. (vertical_whitespace)",
				},
			],
			[
				{
					path: "file2.swift",
					firstLine: 2,
					lastLine: 2,
					message:
						"Trailing Semicolon Violation: Lines should not have trailing semicolons. (trailing_semicolon)",
				},
			],
		],
	};
}

// Testing input/output for the Linter.lint function, with auto-fixing enabled
function getFixParams(dir) {
	const resultsFile1 = `${join(dir, "file1.swift")}:4:1 Corrected Vertical Whitespace`;
	const resultsFile2 = `${join(dir, "file2.swift")}:2:22 Corrected Trailing Semicolon`;
	return {
		// Strings that must be contained in the stdout of the lint command
		stdoutParts: [resultsFile1, resultsFile2],
		// Example output of the lint command, used to test the parsing function
		parseInput: `${resultsFile1}\n${resultsFile2}`,
		// Expected output of the parsing function
		parseResult: [[], [], []],
	};
}

module.exports = [testName, linter, extensions, getLintParams, getFixParams];
