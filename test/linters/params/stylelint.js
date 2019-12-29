const Stylelint = require("../../../src/linters/stylelint");
const { joinDoubleBackslash } = require("../../utils");

const testName = "stylelint";
const linter = Stylelint;
const extensions = ["css", "sass", "scss"];

const getLintResults = dir => {
	const resultsFile1 = `{"source":"${joinDoubleBackslash(
		dir,
		"file1.css",
	)}","deprecations":[],"invalidOptionWarnings":[],"parseErrors":[],"errored":false,"warnings":[{"line":2,"column":13,"rule":"no-extra-semicolons","severity":"warning","text":"Unexpected extra semicolon (no-extra-semicolons)"}]}`;
	const resultsFile2 = `{"source":"${joinDoubleBackslash(
		dir,
		"file2.scss",
	)}","deprecations":[],"invalidOptionWarnings":[],"parseErrors":[],"errored":true,"warnings":[{"line":1,"column":6,"rule":"block-no-empty","severity":"error","text":"Unexpected empty block (block-no-empty)"}]}`;
	return [`[${resultsFile1},${resultsFile2}]`, `[${resultsFile2},${resultsFile1}]`];
};

const parsedLintResults = [
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
];

const getFixResults = dir => {
	const resultsFile1 = `{"source":"${joinDoubleBackslash(
		dir,
		"file1.css",
	)}","deprecations":[],"invalidOptionWarnings":[],"parseErrors":[],"errored":false,"warnings":[]}`;
	const resultsFile2 = `{"source":"${joinDoubleBackslash(
		dir,
		"file2.scss",
	)}","deprecations":[],"invalidOptionWarnings":[],"parseErrors":[],"errored":true,"warnings":[{"line":1,"column":6,"rule":"block-no-empty","severity":"error","text":"Unexpected empty block (block-no-empty)"}]}`;
	return [`[${resultsFile1},${resultsFile2}]`, `[${resultsFile2},${resultsFile1}]`];
};

const parsedFixResults = [
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
];

module.exports = [
	testName,
	linter,
	extensions,
	getLintResults,
	getFixResults,
	parsedLintResults,
	parsedFixResults,
];
