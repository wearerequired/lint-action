const RuboCop = require("../../../src/linters/rubocop");

const testName = "rubocop";
const linter = RuboCop;
const extensions = ["rb"];

// Testing input/output for the Linter.lint function, with auto-fixing disabled
function getLintParams(dir) {
	const resultsFile1 = `{"path":"file1.rb","offenses":[{"severity":"convention","message":"Redundant \`return\` detected.","cop_name":"Style/RedundantReturn","corrected":false,"location":{"start_line":4,"start_column":3,"last_line":4,"last_column":8,"length":6,"line":4,"column":3}}]}`;
	const resultsFile2 = `{"path":"file2.rb","offenses":[{"severity":"warning","message":"Useless assignment to variable - \`x\`.","cop_name":"Lint/UselessAssignment","corrected":false,"location":{"start_line":3,"start_column":1,"last_line":3,"last_column":1,"length":1,"line":3,"column":1}}]}`;
	return {
		// Strings that must be contained in the stdout of the lint command
		stdoutParts: [resultsFile1, resultsFile2],
		// Example output of the lint command, used to test the parsing function
		parseInput: `{"metadata":{"rubocop_version":"0.71.0","ruby_engine":"ruby","ruby_version":"2.5.3","ruby_patchlevel":"105","ruby_platform":"x86_64-darwin18"},"files":[${resultsFile1},${resultsFile2}],"summary":{"offense_count":2,"target_file_count":2,"inspected_file_count":2}}`,
		// Expected output of the parsing function
		parseResult: [
			[],
			[
				{
					path: "file1.rb",
					firstLine: 4,
					lastLine: 4,
					message: "Redundant `return` detected (Style/RedundantReturn)",
				},
				{
					path: "file2.rb",
					firstLine: 3,
					lastLine: 3,
					message: "Useless assignment to variable - `x` (Lint/UselessAssignment)",
				},
			],
			[],
		],
	};
}

// Testing input/output for the Linter.lint function, with auto-fixing enabled
function getFixParams(dir) {
	const resultsFile1 = `{"path":"file1.rb","offenses":[{"severity":"convention","message":"Redundant \`return\` detected.","cop_name":"Style/RedundantReturn","corrected":true,"location":{"start_line":4,"start_column":3,"last_line":4,"last_column":8,"length":6,"line":4,"column":3}}]}`;
	const resultsFile2 = `{"path":"file2.rb","offenses":[{"severity":"warning","message":"Useless assignment to variable - \`x\`.","cop_name":"Lint/UselessAssignment","corrected":false,"location":{"start_line":3,"start_column":1,"last_line":3,"last_column":1,"length":1,"line":3,"column":1}}]}`;
	return {
		// Strings that must be contained in the stdout of the lint command
		stdoutParts: [resultsFile1, resultsFile2],
		// Example output of the lint command, used to test the parsing function
		parseInput: `{"metadata":{"rubocop_version":"0.71.0","ruby_engine":"ruby","ruby_version":"2.5.3","ruby_patchlevel":"105","ruby_platform":"x86_64-darwin18"},"files":[${resultsFile1},${resultsFile2}],"summary":{"offense_count":2,"target_file_count":2,"inspected_file_count":2}}`,
		// Expected output of the parsing function
		parseResult: [
			[],
			[
				{
					path: "file2.rb",
					firstLine: 3,
					lastLine: 3,
					message: "Useless assignment to variable - `x` (Lint/UselessAssignment)",
				},
			],
			[],
		],
	};
}

module.exports = [testName, linter, extensions, getLintParams, getFixParams];
