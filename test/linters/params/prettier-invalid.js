const Prettier = require("../../../src/linters/prettier");

const testName = "prettier-invalid";
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
	const stdoutFile2 = `file2.css`;
	return {
		// Expected output of the linting function
		cmdOutput: {
			status: 2,
			stdoutParts: [stdoutFile2],
			stdout: `${stdoutFile2}`,
			stderr:
				"[error] file1.ts: SyntaxError: ')' expected. (8:38)\n[error]    6 |\n[error]    7 | let userName: string = 'John';\n[error] >  8 | let greeting: string = greet(userName; // Syntax error\n[error]      |                                      ^\n[error]    9 |\n[error]   10 | console.log(greeting);\n[error]   11 |",
		},
		// Expected output of the parsing function
		lintResult: {
			isSuccess: false,
			warning: [],
			error: [
				{
					path: "file2.css",
					firstLine: 1,
					lastLine: 1,
					message:
						"There are issues with this file's formatting, please run Prettier to fix the errors",
				},
				{
					path: "file1.ts",
					firstLine: 8,
					lastLine: 8,
					message: "SyntaxError: ')' expected.",
				},
			],
		},
	};
}

// Linting with auto-fixing
function getFixParams(dir) {
	return getLintParams(dir);
}

module.exports = [testName, linter, commandPrefix, extensions, args, getLintParams, getFixParams];
