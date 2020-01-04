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

// Testing input/output for the Linter.lint function, with auto-fixing disabled
function getLintParams(dir) {
	const resultsFile1 = `file1.js`;
	const resultsFile2 = `file2.css`;
	return {
		// Strings that must be contained in the stdout of the lint command
		stdoutParts: [resultsFile1, resultsFile2],
		// Example output of the lint command, used to test the parsing function
		parseInput: `${resultsFile1}\n${resultsFile2}`,
		// Expected output of the parsing function
		parseResult: [
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
		],
	};
}

// Testing input/output for the Linter.lint function, with auto-fixing enabled
function getFixParams(dir) {
	return {
		// stdout of the lint command
		stdout: "",
		// Example output of the lint command, used to test the parsing function
		parseInput: "",
		// Expected output of the parsing function
		parseResult: [[], [], []],
	};
}

module.exports = [testName, linter, extensions, getLintParams, getFixParams];
