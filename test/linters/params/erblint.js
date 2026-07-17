const Erblint = require("../../../src/linters/erblint");

const testName = "erblint";
const linter = Erblint;
const args = "";
const commandPrefix = "bundle exec";
const extensions = ["erb"];

// Linting without auto-fixing
function getLintParams(dir) {
	const stdout1 =
		'{"path":"file1.html.erb","offenses":[{"linter":"SpaceAroundErbTag","message":"Use 1 space before `%>` instead of 2 space.","location":{"start_line":3,"start_column":6,"last_line":3,"last_column":8,"length":2}}]}';
	const stdout2 =
		'{"path":"file2.html.erb","offenses":[{"linter":"SelfClosingTag","message":"Tag `br` is a void element, it must end with `>` and not `/>`.","location":{"start_line":2,"start_column":4,"last_line":2,"last_column":5,"length":1}}]}';
	return {
		// Expected output of the linting function
		cmdOutput: {
			status: 1,
			stdoutParts: [stdout1, stdout2],
			stdout: `{"metadata":{"erb_lint_version":"0.9.0","ruby_engine":"ruby","ruby_version":"3.4.0","ruby_patchlevel":"0","ruby_platform":"x86_64-linux"},"files":[${stdout1},${stdout2}],"summary":{"offenses":2,"inspected_files":2,"corrected":0}}`,
		},
		// Expected output of the parsing function
		lintResult: {
			isSuccess: false,
			error: [
				{
					path: "file1.html.erb",
					firstLine: 3,
					lastLine: 3,
					message: "Use 1 space before `%>` instead of 2 space (SpaceAroundErbTag)",
				},
				{
					path: "file2.html.erb",
					firstLine: 2,
					lastLine: 2,
					message: "Tag `br` is a void element, it must end with `>` and not `/>` (SelfClosingTag)",
				},
			],
			warning: [],
		},
	};
}

const getFixParams = getLintParams; // Does not support auto-fixing -> option has no effect

module.exports = [testName, linter, commandPrefix, extensions, args, getLintParams, getFixParams];
