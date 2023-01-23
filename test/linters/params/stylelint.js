const Stylelint = require("../../../src/linters/stylelint");
const { joinDoubleBackslash } = require("../../test-utils");

const testName = "stylelint";
const linter = Stylelint;
const args = "";
const commandPrefix = "";
const extensions = ["css", "sass", "scss"];

// Linting without auto-fixing
function getLintParams(dir) {
	const stdoutFile1 = `{"source":"${joinDoubleBackslash(
		dir,
		"file1.css",
	)}","deprecations":[],"invalidOptionWarnings":[],"parseErrors":[],"errored":false,"warnings":[{"line":2,"column":14,"endLine":2,"endColumn":15,"rule":"no-extra-semicolons","severity":"warning","text":"Unexpected extra semicolon (no-extra-semicolons)"}]}`;
	const stdoutFile2 = `{"source":"${joinDoubleBackslash(
		dir,
		"file2.scss",
	)}","deprecations":[],"invalidOptionWarnings":[],"parseErrors":[],"errored":true,"warnings":[{"line":1,"column":6,"endLine":1,"endColumn":8,"rule":"block-no-empty","severity":"error","text":"Unexpected empty block (block-no-empty)"}]}`;
	return {
		// Expected output of the linting function
		cmdOutput: {
			status: 2, // stylelint exits with the highest severity index found (warning = 1, error = 2)
			stdoutParts: [stdoutFile1, stdoutFile2],
			stdout: `[${stdoutFile1},${stdoutFile2}]`,
		},
		// Expected output of the parsing function
		lintResult: {
			isSuccess: false,
			warning: [
				{
					path: "file1.css",
					firstLine: 2,
					lastLine: 2,
					message: "Unexpected extra semicolon (no-extra-semicolons)",
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
	const stdoutFile1 = `{"source":"${joinDoubleBackslash(
		dir,
		"file1.css",
	)}","deprecations":[],"invalidOptionWarnings":[],"parseErrors":[],"errored":false,"warnings":[]}`;
	const stdoutFile2 = `{"source":"${joinDoubleBackslash(
		dir,
		"file2.scss",
	)}","deprecations":[],"invalidOptionWarnings":[],"parseErrors":[],"errored":true,"warnings":[{"line":1,"column":6,"endLine":1,"endColumn":8,"rule":"block-no-empty","severity":"error","text":"Unexpected empty block (block-no-empty)"}]}`;
	return {
		// Expected output of the linting function
		cmdOutput: {
			status: 2, // stylelint exits with the highest severity index found (warning = 1, error = 2)
			stdoutParts: [stdoutFile1, stdoutFile2],
			stdout: `[${stdoutFile1},${stdoutFile2}]`,
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
