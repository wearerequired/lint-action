const Stylelint = require("../../../src/linters/stylelint");
const { joinDoubleBackslash } = require("../../utils");

const testName = "stylelint";
const linter = Stylelint;
const extensions = ["css", "sass", "scss"];

// Testing input/output for the Linter.lint function, with auto-fixing disabled
function getLintParams(dir) {
	const resultsFile1 = `{"source":"${joinDoubleBackslash(
		dir,
		"file1.css",
	)}","deprecations":[],"invalidOptionWarnings":[],"parseErrors":[],"errored":false,"warnings":[{"line":2,"column":13,"rule":"no-extra-semicolons","severity":"warning","text":"Unexpected extra semicolon (no-extra-semicolons)"}]}`;
	const resultsFile2 = `{"source":"${joinDoubleBackslash(
		dir,
		"file2.scss",
	)}","deprecations":[],"invalidOptionWarnings":[],"parseErrors":[],"errored":true,"warnings":[{"line":1,"column":6,"rule":"block-no-empty","severity":"error","text":"Unexpected empty block (block-no-empty)"}]}`;
	return {
		// Strings that must be contained in the stdout of the lint command
		stdoutParts: [resultsFile1, resultsFile2],
		// Example output of the lint command, used to test the parsing function
		parseInput: `[${resultsFile1},${resultsFile2}]`,
		// Expected output of the parsing function
		parseResult: [
			[],
			[
				{
					path: "file1.css",
					firstLine: 2,
					lastLine: 2,
					message: "Unexpected extra semicolon (no-extra-semicolons)",
				},
			],
			[
				{
					path: "file2.scss",
					firstLine: 1,
					lastLine: 1,
					message: "Unexpected empty block (block-no-empty)",
				},
			],
		],
	};
}

// Testing input/output for the Linter.lint function, with auto-fixing enabled
function getFixParams(dir) {
	const resultsFile1 = `{"source":"${joinDoubleBackslash(
		dir,
		"file1.css",
	)}","deprecations":[],"invalidOptionWarnings":[],"parseErrors":[],"errored":false,"warnings":[]}`;
	const resultsFile2 = `{"source":"${joinDoubleBackslash(
		dir,
		"file2.scss",
	)}","deprecations":[],"invalidOptionWarnings":[],"parseErrors":[],"errored":true,"warnings":[{"line":1,"column":6,"rule":"block-no-empty","severity":"error","text":"Unexpected empty block (block-no-empty)"}]}`;
	return {
		// Strings that must be contained in the stdout of the lint command
		stdoutParts: [resultsFile1, resultsFile2],
		// Example output of the lint command, used to test the parsing function
		parseInput: `[${resultsFile1},${resultsFile2}]`,
		// Expected output of the parsing function
		parseResult: [
			[],
			[],
			[
				{
					path: "file2.scss",
					firstLine: 1,
					lastLine: 1,
					message: "Unexpected empty block (block-no-empty)",
				},
			],
		],
	};
}

module.exports = [testName, linter, extensions, getLintParams, getFixParams];
