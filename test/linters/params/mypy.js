const { EOL } = require("os");

const Mypy = require("../../../src/linters/mypy");

const testName = "mypy";
const linter = Mypy;
const args = "";
const commandPrefix = "";
const extensions = ["py"];

// Linting without auto-fixing
function getLintParams(dir) {
	const stdoutPart1 = `file1.py:7: error: Dict entry 0 has incompatible type "str": "int"; expected "str": "str"`;
	const stdoutPart2 = `file1.py:11: error: Argument 1 to "main" has incompatible type "List[str]"; expected "str"`;
	return {
		// Expected output of the linting function
		cmdOutput: {
			status: 1,
			stdoutParts: [stdoutPart1, stdoutPart2],
			stdout: `${stdoutPart1}${EOL}${stdoutPart2}`,
		},
		// Expected output of the parsing function
		lintResult: {
			isSuccess: false,
			warning: [],
			error: [
				{
					path: "file1.py",
					firstLine: 7,
					lastLine: 7,
					message: `Dict entry 0 has incompatible type "str": "int"; expected "str": "str"`,
				},
				{
					path: "file1.py",
					firstLine: 11,
					lastLine: 11,
					message: `Argument 1 to "main" has incompatible type "List[str]"; expected "str"`,
				},
			],
		},
	};
}

// Linting with auto-fixing
const getFixParams = getLintParams; // Does not support auto-fixing -> option has no effect

module.exports = [testName, linter, commandPrefix, extensions, args, getLintParams, getFixParams];
