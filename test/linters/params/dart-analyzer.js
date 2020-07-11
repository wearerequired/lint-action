const DartAnalyzer = require("../../../src/linters/dart-analyzer");
const { getViolationSeparator } = require("../../../src/utils/dart-analyzer");

const testName = "dart-analyzer";
const linter = DartAnalyzer;
const extensions = ["dart"];

// Linting without auto-fixing
function getLintParams(dir) {
	const sep = getViolationSeparator();
	const stdoutFile1 = `Analyzing dart-analyzer...
  error ${sep} Undefined name '_count'. ${sep} main.dart:10:3 ${sep} undefined_identifier
  lint ${sep} Avoid \`print\` calls in production code. ${sep} main.dart:15:3 ${sep} avoid_print
  hint ${sep} Unused import: 'dart:io'. ${sep} main.dart:1:8 ${sep} unused_import
  hint ${sep} The value of the local variable 'unused_var' isn't used. ${sep} main.dart:4:7 ${sep} unused_local_variable
  hint ${sep} 'decrement' is deprecated and shouldn't be used. dont use it. ${sep} main.dart:5:3 ${sep} deprecated_member_use_from_same_package
1 error, 1 lint and 3 hints found.`;
	return {
		// Expected output of the linting function
		cmdOutput: {
			status: 3,
			stdoutParts: [stdoutFile1],
			stdout: `${stdoutFile1}`,
		},
		// Expected output of the parsing function
		lintResult: {
			isSuccess: false,
			warning: [
				{
					path: "main.dart",
					firstLine: 15,
					lastLine: 15,
					message:
						"Avoid `print` calls in production code. ([avoid_print](https://dart-lang.github.io/linter/lints/avoid_print))",
				},
				{
					path: "main.dart",
					firstLine: 1,
					lastLine: 1,
					message: "Unused import: 'dart:io'. (unused_import)",
				},
				{
					path: "main.dart",
					firstLine: 4,
					lastLine: 4,
					message:
						"The value of the local variable 'unused_var' isn't used. (unused_local_variable)",
				},
				{
					path: "main.dart",
					firstLine: 5,
					lastLine: 5,
					message:
						"'decrement' is deprecated and shouldn't be used. dont use it. (deprecated_member_use_from_same_package)",
				},
			],
			error: [
				{
					path: "main.dart",
					firstLine: 10,
					lastLine: 10,
					message: "Undefined name '_count'. (undefined_identifier)",
				},
			],
		},
	};
}

// Linting with auto-fixing
const getFixParams = getLintParams; // Does not support auto-fixing -> option has no effect

module.exports = [testName, linter, extensions, getLintParams, getFixParams];
