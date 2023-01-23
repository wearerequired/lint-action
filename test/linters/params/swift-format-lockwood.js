const { join } = require("path");

const SwiftFormatLockwood = require("../../../src/linters/swift-format-lockwood");

const testName = "swift-format-lockwood";
const linter = SwiftFormatLockwood;
const args = "";
const commandPrefix = "";
const extensions = ["swift"];

// Linting without auto-fixing
function getLintParams(dir) {
	const warning1 = `${join(
		dir,
		"file1.swift",
	)}:5:1: warning: (consecutiveBlankLines) Replace consecutive blank lines with a single blank line.`;
	const warning2 = `${join(
		dir,
		"file1.swift",
	)}:7:1: warning: (indent) Indent code in accordance with the scope level.`;
	const warning3 = `${join(dir, "file2.swift")}:2:1: warning: (semicolons) Remove semicolons.`;
	return {
		// Expected output of the linting function
		cmdOutput: {
			status: 1,
			stderrParts: [warning1, warning2, warning3],
			stderr: `Running SwiftFormat...\n(lint mode - no files will be changed.)\n${warning1}\n${warning2}\n${warning3}\nwarning: No swift version was specified, so some formatting features were disabled. Specify the version of swift you are using with the --swiftversion command line option, or by adding a .swift-version file to your project.\nSwiftFormat completed in 0.01s.\nSource input did not pass lint check.\n2/2 files require formatting.`,
		},
		// Expected output of the parsing function
		lintResult: {
			isSuccess: false,
			warning: [],
			error: [
				{
					path: "file1.swift",
					firstLine: 5,
					lastLine: 5,
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
		},
	};
}

// Linting with auto-fixing
function getFixParams(dir) {
	return {
		// Expected output of the linting function
		cmdOutput: {
			status: 0,
			stderr: "",
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
