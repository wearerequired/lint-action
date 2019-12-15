const { join } = require("path");
const SwiftLint = require("../src/linters/swiftlint");

// Path to SwiftLint test project
const swiftlintProject = join(__dirname, "projects", "swiftlint");

// Expected linting results from test project
const testResults = `${swiftlintProject}/main.swift:9:24: error: Trailing Semicolon Violation: Lines should not have trailing semicolons. (trailing_semicolon)\n${swiftlintProject}/main.swift:6:1: warning: Vertical Whitespace Violation: Limit vertical whitespace to a single empty line. Currently 2. (vertical_whitespace)\n`;
const testResultsParsed = [
	[],
	[
		{
			path: "main.swift",
			firstLine: 6,
			lastLine: 6,
			message:
				"Vertical Whitespace Violation: Limit vertical whitespace to a single empty line. Currently 2. (vertical_whitespace)",
		},
	],
	[
		{
			path: "main.swift",
			firstLine: 9,
			lastLine: 9,
			message:
				"Trailing Semicolon Violation: Lines should not have trailing semicolons. (trailing_semicolon)",
		},
	],
];

test("should return correct linting results", () => {
	const results = SwiftLint.lint(swiftlintProject, ["swift"]);
	expect(results).toEqual(testResults);
});

test("should parse linting results correctly", () => {
	const resultsParsed = SwiftLint.parseResults(swiftlintProject, testResults);
	expect(resultsParsed).toEqual(testResultsParsed);
});
