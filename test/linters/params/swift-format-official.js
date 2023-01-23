const { join } = require("path");

const SwiftFormatOfficial = require("../../../src/linters/swift-format-official");

const testName = "swift-format-official";
const linter = SwiftFormatOfficial;
const args = "";
const commandPrefix = "";
const extensions = ["swift"];

function getLintParams(dir) {
	const warning1 = `${join(dir, "file2.swift")}:2:22: warning: [DoNotUseSemicolons]: remove ';'`;
	const warning2 = `${join(dir, "file1.swift")}:3:35: warning: [RemoveLine]: remove line break`;
	const warning3 = `${join(
		dir,
		"file1.swift",
	)}:7:1: warning: [Indentation] replace leading whitespace with 2 spaces`;
	const warning4 = `${join(dir, "file1.swift")}:7:23: warning: [Spacing]: add 1 space`;
	// Files on macOS are not sorted.
	const stderr =
		process.platform === "darwin"
			? `${warning2}\n${warning3}\n${warning4}\n${warning1}`
			: `${warning1}\n${warning2}\n${warning3}\n${warning4}`;
	return {
		// Expected output of the linting function.
		cmdOutput: {
			status: 0,
			stderrParts: [warning1, warning2, warning3, warning4],
			stderr,
		},
		// Expected output of the parsing function.
		lintResult: {
			isSuccess: false,
			error: [
				{
					path: "file2.swift",
					firstLine: 2,
					lastLine: 2,
					message: "[DoNotUseSemicolons]: remove ';'",
				},
				{
					path: "file1.swift",
					firstLine: 3,
					lastLine: 3,
					message: "[RemoveLine]: remove line break",
				},
				{
					path: "file1.swift",
					firstLine: 7,
					lastLine: 7,
					message: "[Indentation] replace leading whitespace with 2 spaces",
				},
				{
					path: "file1.swift",
					firstLine: 7,
					lastLine: 7,
					message: "[Spacing]: add 1 space",
				},
			],
			warning: [],
		},
	};
}

function getFixParams(dir) {
	return {
		// Expected output of the linting function.
		cmdOutput: {
			status: 0,
			stderr: "",
		},
		// Expected output of the parsing function.
		lintResult: {
			isSuccess: true,
			warning: [],
			error: [],
		},
	};
}

module.exports = [testName, linter, commandPrefix, extensions, args, getLintParams, getFixParams];
