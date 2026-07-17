const Stylelint = require("../../../src/linters/stylelint");
const { joinDoubleBackslash } = require("../../test-utils");

const testName = "stylelint";
const linter = Stylelint;
const args = "";
const commandPrefix = "";
const extensions = ["css", "sass", "scss"];

// Linting without auto-fixing
function getLintParams(dir) {
	// stylelint v16 and later prints the report to stderr, stdout stays empty
	const stderrFile1 = `{"source":"${joinDoubleBackslash(
		dir,
		"file1.css",
	)}","deprecations":[],"invalidOptionWarnings":[],"parseErrors":[],"errored":false,"warnings":[{"line":2,"column":10,"endLine":2,"endColumn":17,"rule":"color-hex-length","severity":"warning","text":"Expected \\"#ffffff\\" to be \\"#fff\\" (color-hex-length)"}]}`;
	const stderrFile2 = `{"source":"${joinDoubleBackslash(
		dir,
		"file2.scss",
	)}","deprecations":[],"invalidOptionWarnings":[],"parseErrors":[],"errored":true,"warnings":[{"line":1,"column":6,"endLine":1,"endColumn":8,"rule":"block-no-empty","severity":"error","text":"Unexpected empty block (block-no-empty)"}]}`;
	return {
		// Expected output of the linting function
		cmdOutput: {
			status: 2, // stylelint exits with the highest severity index found (warning = 1, error = 2)
			stdout: "",
			stderrParts: [stderrFile1, stderrFile2],
			stderr: `[${stderrFile1},${stderrFile2}]`,
		},
		// Expected output of the parsing function
		lintResult: {
			isSuccess: false,
			warning: [
				{
					path: "file1.css",
					firstLine: 2,
					lastLine: 2,
					message: 'Expected "#ffffff" to be "#fff" (color-hex-length)',
				},
			],
			error: [
				{
					path: "file2.scss",
					firstLine: 1,
					lastLine: 1,
					message: "Unexpected empty block (block-no-empty)",
				},
			],
		},
	};
}

// Linting with auto-fixing
function getFixParams(dir) {
	// stylelint v16 and later prints the report to stderr, stdout stays empty
	const stderrFile1 = `{"source":"${joinDoubleBackslash(
		dir,
		"file1.css",
	)}","deprecations":[],"invalidOptionWarnings":[],"parseErrors":[],"errored":false,"warnings":[]}`;
	const stderrFile2 = `{"source":"${joinDoubleBackslash(
		dir,
		"file2.scss",
	)}","deprecations":[],"invalidOptionWarnings":[],"parseErrors":[],"errored":true,"warnings":[{"line":1,"column":6,"endLine":1,"endColumn":8,"rule":"block-no-empty","severity":"error","text":"Unexpected empty block (block-no-empty)"}]}`;
	return {
		// Expected output of the linting function
		cmdOutput: {
			status: 2, // stylelint exits with the highest severity index found (warning = 1, error = 2)
			stdout: "",
			stderrParts: [stderrFile1, stderrFile2],
			stderr: `[${stderrFile1},${stderrFile2}]`,
		},
		// Expected output of the parsing function
		lintResult: {
			isSuccess: false,
			warning: [],
			error: [
				{
					path: "file2.scss",
					firstLine: 1,
					lastLine: 1,
					message: "Unexpected empty block (block-no-empty)",
				},
			],
		},
	};
}

module.exports = [testName, linter, commandPrefix, extensions, args, getLintParams, getFixParams];
