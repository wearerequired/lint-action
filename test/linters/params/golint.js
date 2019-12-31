const Golint = require("../../../src/linters/golint");

const testName = "golint";
const linter = Golint;
const extensions = ["go"];

const getLintResults = dir => {
	const resultsFile1 =
		"file1.go:14:9: if block ends with a return statement, so drop this else and outdent its block";
	const resultsFile2 =
		'file2.go:3:1: comment on exported function Divide should be of the form "Divide ..."';
	return [`${resultsFile1}\n${resultsFile2}`, `${resultsFile2}\n${resultsFile1}`];
};

const parsedLintResults = [
	[],
	[],
	[
		{
			path: "file1.go",
			firstLine: 14,
			lastLine: 14,
			message: `If block ends with a return statement, so drop this else and outdent its block`,
		},
		{
			path: "file2.go",
			firstLine: 3,
			lastLine: 3,
			message: `Comment on exported function Divide should be of the form "Divide ..."`,
		},
	],
];

const getFixResults = getLintResults;

const parsedFixResults = parsedLintResults;

module.exports = [
	testName,
	linter,
	extensions,
	getLintResults,
	getFixResults,
	parsedLintResults,
	parsedFixResults,
];
