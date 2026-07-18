const Ruff = require("../../../src/linters/ruff");

const testName = "ruff";
const linter = Ruff;
const commandPrefix = "";
const args = "";
const extensions = ["py"];

/**
 * Builds a Ruff JSON violation object
 * @param {string} dir - Directory the linter ran in
 * @param {string} file - File name (relative to `dir`)
 * @param {string} code - Rule code
 * @param {number} row - Line number
 * @param {number} column - Column number
 * @param {string} message - Violation message
 * @returns {string} - JSON string of the violation
 */
function violation(dir, file, code, row, column, message) {
	return JSON.stringify({
		code,
		filename: `${dir}/${file}`,
		location: { row, column },
		message,
	});
}

// Linting without auto-fixing
function getLintParams(dir) {
	const stdout = `[${violation(
		dir,
		"file1.py",
		"F401",
		3,
		8,
		"`os` imported but unused",
	)},${violation(dir, "file2.py", "F821", 1, 4, "Undefined name `a`")},${violation(
		dir,
		"file2.py",
		"E701",
		1,
		5,
		"Multiple statements on one line (colon)",
	)}]`;
	return {
		// Expected output of the linting function. The JSON contains the absolute file paths, so a few
		// stable, path-free substrings are matched instead of the whole stdout
		cmdOutput: {
			status: 1,
			stdoutParts: [`"code": "F401"`, `"code": "F821"`, `"code": "E701"`],
			stdout,
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
					message: "`os` imported but unused (F401)",
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

// Linting with auto-fixing. Ruff fixes the unused import (F401); the other two are not auto-fixable
function getFixParams(dir) {
	const stdout = `[${violation(dir, "file2.py", "F821", 1, 4, "Undefined name `a`")},${violation(
		dir,
		"file2.py",
		"E701",
		1,
		5,
		"Multiple statements on one line (colon)",
	)}]`;
	return {
		// Expected output of the linting function
		cmdOutput: {
			status: 1,
			stdoutParts: [`"code": "F821"`, `"code": "E701"`],
			stdout,
		},
		// Expected output of the parsing function
		lintResult: {
			isSuccess: false,
			warning: [],
			error: [
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

module.exports = [testName, linter, commandPrefix, extensions, args, getLintParams, getFixParams];
