const { join } = require("path");
const Swiftlint = require("../../../src/linters/swiftlint");

const testName = "swiftlint";
const linter = Swiftlint;
const extensions = ["swift"];

const getLintResults = dir => {
	const resultsFile1 = `${join(
		dir,
		"file1.swift",
	)}:5:1: warning: Vertical Whitespace Violation: Limit vertical whitespace to a single empty line. Currently 2. (vertical_whitespace)`;
	const resultsFile2 = `${join(
		dir,
		"file2.swift",
	)}:2:22: error: Trailing Semicolon Violation: Lines should not have trailing semicolons. (trailing_semicolon)`;
	return [`${resultsFile1}\n${resultsFile2}`, `${resultsFile2}\n${resultsFile1}`];
};

const parsedLintResults = [
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
];

const getFixResults = dir => {
	const resultsFile1 = `${join(dir, "file1.swift")}:4:1 Corrected Vertical Whitespace`;
	const resultsFile2 = `${join(dir, "file2.swift")}:2:22 Corrected Trailing Semicolon`;
	return [`${resultsFile1}\n${resultsFile2}`, `${resultsFile2}\n${resultsFile1}`];
};

const parsedFixResults = [[], [], []];

module.exports = [
	testName,
	linter,
	extensions,
	getLintResults,
	getFixResults,
	parsedLintResults,
	parsedFixResults,
];
