const { EOL } = require("os");
const { sep } = require("path");
const Flake8 = require("../../../src/linters/flake8");

const testName = "flake8";
const linter = Flake8;
const extensions = ["py"];

const getLintResults = () => {
	const resultsFile1 = `.${sep}file1.py:5:9: E211 whitespace before '('${EOL}.${sep}file1.py:26:1: E305 expected 2 blank lines after class or function definition, found 1`;
	const resultsFile2 = `.${sep}file2.py:2:3: E111 indentation is not a multiple of four`;
	return [`${resultsFile1}${EOL}${resultsFile2}`, `${resultsFile2}${EOL}${resultsFile1}`];
};

const parsedLintResults = [
	[],
	[],
	[
		{
			path: "file1.py",
			firstLine: 5,
			lastLine: 5,
			message: "Whitespace before '(' (E211)",
		},
		{
			path: "file1.py",
			firstLine: 26,
			lastLine: 26,
			message: "Expected 2 blank lines after class or function definition, found 1 (E305)",
		},
		{
			path: "file2.py",
			firstLine: 2,
			lastLine: 2,
			message: "Indentation is not a multiple of four (E111)",
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
