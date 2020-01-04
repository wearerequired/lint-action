const { join } = require("path");
const SwiftFormat = require("../../../src/linters/swiftformat");

const testName = "swiftformat";
const linter = SwiftFormat;
const extensions = ["swift"];

// Testing input/output for the Linter.lint function, with auto-fixing disabled
function getLintParams(dir) {
	const warning1 = `${join(
		dir,
		"file1.swift",
	)}:3:1: warning: (consecutiveBlankLines) Replace consecutive blank lines with a single blank line.`;
	const warning2 = `${join(
		dir,
		"file1.swift",
	)}:7:1: warning: (indent) Indent code in accordance with the scope level.`;
	const warning3 = `${join(dir, "file2.swift")}:2:1: warning: (semicolons) Remove semicolons.`;
	return {
		// Strings that must be contained in the stdout of the lint command
		stdoutParts: [warning1, warning2, warning3],
		// Example output of the lint command, used to test the parsing function
		parseInput: `Running SwiftFormat...\n(lint mode - no files will be changed.)\n${warning1}\n${warning2}\n${warning3}\nwarning: No swift version was specified, so some formatting features were disabled. Specify the version of swift you are using with the --swiftversion command line option, or by adding a .swift-version file to your project.\nSwiftFormat completed in 0.01s.\nSource input did not pass lint check.\n2/2 files require formatting.`,
		// Expected output of the parsing function
		parseResult: [
			[],
			[],
			[
				{
					path: "file1.swift",
					firstLine: 3,
					lastLine: 3,
					message:
						"Replace consecutive blank lines with a single blank line (consecutiveBlankLines)",
				},
				{
					path: "file1.swift",
					firstLine: 7,
					lastLine: 7,
					message: "Indent code in accordance with the scope level (indent)",
				},
				{
					path: "file2.swift",
					firstLine: 2,
					lastLine: 2,
					message: "Remove semicolons (semicolons)",
				},
			],
		],
	};
}

// Testing input/output for the Linter.lint function, with auto-fixing enabled
function getFixParams(dir) {
	return {
		// stdout of the lint command
		stdout: "",
		// Example output of the lint command, used to test the parsing function
		parseInput: "",
		// Expected output of the parsing function
		parseResult: [[], [], []],
	};
}

module.exports = [testName, linter, extensions, getLintParams, getFixParams];
