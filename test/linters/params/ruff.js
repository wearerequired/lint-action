const { EOL } = require("os");

const Ruff = require("../../../src/linters/ruff");

const testName = "ruff";
const linter = Ruff;
const args = "";
const commandPrefix = "";
const extensions = ["py"];

// Linting without auto-fixing
function getLintParams(dir) {
	const stdoutFile1 = `file1.py:3:8: F401 [*] \`os\` imported but unused`;
	const stdoutFile2 = `file2.py:1:4: F821 Undefined name \`a\`${EOL}file2.py:1:5: E701 Multiple statements on one line (colon)`;
	return {
		// Expected output of the linting function
		cmdOutput: {
			status: 1,
			stdoutParts: [stdoutFile1, stdoutFile2],
			stdout: `${stdoutFile1}${EOL}${stdoutFile2}`,
		},
		// Expected output of the parsing function
		lintResult: {
			isSuccess: false,
			warning: [],
			error: [
				{
					path: "file1.py",
					firstLine: 3,
					lastLine: 3,
					message: "[*] `os` imported but unused (F401)",
				},
				{
					path: "file2.py",
					firstLine: 1,
					lastLine: 1,
					message: "Undefined name `a` (F821)",
				},
				{
					path: "file2.py",
					firstLine: 1,
					lastLine: 1,
					message: "Multiple statements on one line (colon) (E701)",
				},
			],
		},
	};
}

// Linting with auto-fixing
function getFixParams(dir) {
	return {
		// Expected output of the linting function
		cmdOutput: {
			status: 1,
			stdout: "",
		},
		// Expected output of the parsing function
		lintResult: {
			isSuccess: false,
			warning: [],
			error: [],
		},
	};
}

module.exports = [testName, linter, commandPrefix, extensions, args, getLintParams, getFixParams];
