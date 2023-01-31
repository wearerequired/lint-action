const Prettier = require("../../../src/linters/prettier");

const testName = "prettier";
const linter = Prettier;
const args = "";
const commandPrefix = "";
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

// Linting without auto-fixing
function getLintParams(dir) {
	const stdoutFile1 = `file1.js`;
	const stdoutFile2 = `file2.css`;
	return {
		// Expected output of the linting function
		cmdOutput: {
			status: 1,
			stdoutParts: [stdoutFile1, stdoutFile2],
			stdout: `${stdoutFile1}\n${stdoutFile2}`,
		},
		// Expected output of the parsing function
		lintResult: {
			isSuccess: false,
			warning: [],
			error: [
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
		},
	};
}

// Linting with auto-fixing
function getFixParams(dir) {
	const stdoutFile1 = `file1.js`;
	const stdoutFile2 = `file2.css`;
	return {
		// Expected output of the linting function
		cmdOutput: {
			status: 0,
			stdoutParts: [stdoutFile1, stdoutFile2],
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
