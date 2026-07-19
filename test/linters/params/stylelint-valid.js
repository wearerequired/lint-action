const Stylelint = require("../../../src/linters/stylelint");
const { joinDoubleBackslash } = require("../../test-utils");

const testName = "stylelint-valid";
const linter = Stylelint;
const args = "";
const commandPrefix = "";
const extensions = ["css", "sass", "scss"];

// Linting a project without any issues. stylelint v16 and later exits with 0 and still prints
// its report to stderr, so the runner has to capture stderr even on success (`captureStderr`).
function getLintParams(dir) {
	const stderrFile1 = `{"source":"${joinDoubleBackslash(
		dir,
		"file1.css",
	)}","deprecations":[],"invalidOptionWarnings":[],"parseErrors":[],"errored":false,"warnings":[]}`;
	return {
		// Expected output of the linting function
		cmdOutput: {
			status: 0,
			stdout: "",
			stderrParts: [stderrFile1],
			stderr: `[${stderrFile1}]`,
		},
		// Expected output of the parsing function
		lintResult: {
			isSuccess: true,
			warning: [],
			error: [],
		},
	};
}

// Auto-fixing a project without any issues behaves the same as linting it
function getFixParams(dir) {
	return getLintParams(dir);
}

module.exports = [testName, linter, commandPrefix, extensions, args, getLintParams, getFixParams];
