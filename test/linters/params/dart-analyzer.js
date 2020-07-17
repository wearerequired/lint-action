const DartAnalyzer = require("../../../src/linters/dart-analyzer");
const { getViolationSeparator } = require("../../../src/utils/dart-analyzer");

const testName = "dart-analyzer";
const linter = DartAnalyzer;
const extensions = ["dart"];

// Linting without auto-fixing
function getLintParams(dir) {
	const sep = getViolationSeparator();
	const stdoutFile1 = `Analyzing dart-analyzer...
Loaded analysis options from ${dir}/analysis_options.yaml
  error ${sep} Undefined name '_count'. ${sep} ignore_analyzer.dart:5:3 ${sep} undefined_identifier
       Try correcting the name to one that is defined, or defining the name.
       https://dart.dev/tools/diagnostic-messages#undefined_identifier
  error ${sep} Undefined name '_count'. ${sep} main.dart:11:3 ${sep} undefined_identifier
       Try correcting the name to one that is defined, or defining the name.
       https://dart.dev/tools/diagnostic-messages#undefined_identifier
  lint ${sep} Avoid \`print\` calls in production code. ${sep} ignore_analyzer.dart:10:3 ${sep} avoid_print
      https://dart-lang.github.io/linter/lints/avoid_print.html
  lint ${sep} Avoid \`print\` calls in production code. ${sep} main.dart:16:3 ${sep} avoid_print
      https://dart-lang.github.io/linter/lints/avoid_print.html
  hint ${sep} Unused import: 'dart:io'. ${sep} ignore_analyzer.dart:1:8 ${sep} unused_import
      Try removing the import directive.
      https://dart.dev/tools/diagnostic-messages#unused_import
  hint ${sep} Unused import: 'ignore_analyzer.dart'. ${sep} main.dart:1:8 ${sep} unused_import
      Try removing the import directive.
      https://dart.dev/tools/diagnostic-messages#unused_import
  hint ${sep} The value of the local variable 'unused_var' isn't used. ${sep} main.dart:5:7 ${sep} unused_local_variable
      Try removing the variable, or using it.
      https://dart.dev/tools/diagnostic-messages#unused_local_variable
  hint ${sep} 'decrement' is deprecated and shouldn't be used. dont use it. ${sep} main.dart:6:3 ${sep} deprecated_member_use_from_same_package
      Try replacing the use of the deprecated member with the replacement.
      https://dart.dev/tools/diagnostic-messages#deprecated_member_use_from_same_package
2 errors, 2 lints and 4 hints found.`;
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
					firstLine: 16,
					lastLine: 16,
					message:
						"Avoid `print` calls in production code. ([avoid_print](https://dart-lang.github.io/linter/lints/avoid_print))",
				},
				{
					path: "main.dart",
					firstLine: 1,
					lastLine: 1,
					message:
						"Unused import: 'ignore_analyzer.dart'. ([unused_import](https://dart.dev/tools/diagnostic-messages#unused_import))",
				},
				{
					path: "main.dart",
					firstLine: 5,
					lastLine: 5,
					message:
						"The value of the local variable 'unused_var' isn't used. ([unused_local_variable](https://dart.dev/tools/diagnostic-messages#unused_local_variable))",
				},
				{
					path: "main.dart",
					firstLine: 6,
					lastLine: 6,
					message:
						"'decrement' is deprecated and shouldn't be used. dont use it. ([deprecated_member_use_from_same_package](https://dart.dev/tools/diagnostic-messages#deprecated_member_use_from_same_package))",
				},
			],
			error: [
				{
					path: "main.dart",
					firstLine: 11,
					lastLine: 11,
					message:
						"Undefined name '_count'. ([undefined_identifier](https://dart.dev/tools/diagnostic-messages#undefined_identifier))",
				},
			],
		},
	};
}

// Linting with auto-fixing
const getFixParams = getLintParams; // Does not support auto-fixing -> option has no effect

module.exports = [testName, linter, extensions, getLintParams, getFixParams];
