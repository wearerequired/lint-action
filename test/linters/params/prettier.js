const Prettier = require("../../../src/linters/prettier");

const testName = "prettier";
const linter = Prettier;
const extensions = [
	"css",
	"html",
	"js",
	"json",
	"jsx",
	"md",
	"sass",
	"scss",
	"ts",
	"tsx",
	"vue",
	"yaml",
	"yml",
];

const getLintResults = () => {
	const resultsFile1 = `file1.js`;
	const resultsFile2 = `file2.css`;
	return [`${resultsFile1}\n${resultsFile2}`, `${resultsFile2}\n${resultsFile1}`];
};

const parsedLintResults = [
	[],
	[],
	[
		{
			path: "file1.js",
			firstLine: 1,
			lastLine: 1,
			message:
				"There are issues with this file's formatting, please run Prettier to fix the errors",
		},
		{
			path: "file2.css",
			firstLine: 1,
			lastLine: 1,
			message:
				"There are issues with this file's formatting, please run Prettier to fix the errors",
		},
	],
];

const getFixResults = () => "";

const parsedFixResults = [[], [], []];

module.exports = [
	testName,
	linter,
	extensions,
	getLintResults,
	getFixResults,
	parsedLintResults,
	parsedFixResults,
];
