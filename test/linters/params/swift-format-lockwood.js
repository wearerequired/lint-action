const { join } = require("path");

const SwiftFormatLockwood = require("../../../src/linters/swift-format-lockwood");

const testName = "swift-format-lockwood";
const linter = SwiftFormatLockwood;
const args = "";
const commandPrefix = "";
const extensions = ["swift"];

// Linting without auto-fixing
function getLintParams(dir) {
	const error1 = `${join(
		dir,
		"file1.swift",
	)}:5:1: error: (consecutiveBlankLines) Replace consecutive blank lines with a single blank line.`;
	const error2 = `${join(
		dir,
		"file1.swift",
	)}:7:1: error: (indent) Indent code in accordance with the scope level.`;
	const error3 = `${join(dir, "file2.swift")}:2:1: error: (semicolons) Remove semicolons.`;
	return {
		// Expected output of the linting function
		cmdOutput: {
			status: 1,
			stderrParts: [error1, error2, error3],
			stderr: `Running SwiftFormat...\n(lint mode - no files will be changed.)\n${error3}\n${error1}\n${error2}\nSwiftFormat completed in 0.01s.\nSource input did not pass lint check.\n2/2 files require formatting.`,
		},
		// Expected output of the parsing function
		lintResult: {
			isSuccess: false,
			warning: [],
			error: [
				{
					path: "file2.swift",
					firstLine: 2,
					lastLine: 2,
					message: "Remove semicolons (semicolons)",
				},
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
			],
		},
	};
}

// Linting with auto-fixing
function getFixParams(dir) {
	return {
		// Expected output of the linting function. `run` only captures stderr for non-zero exit
		// codes, so a successful fix run reports an empty string
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
