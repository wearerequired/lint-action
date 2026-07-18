const StandardRB = require("../../../src/linters/standardrb");

const testName = "standardrb";
const linter = StandardRB;
const args = "";
const commandPrefix = "bundle exec";
const extensions = ["rb"];

// Linting without auto-fixing
function getLintParams(dir) {
	const stdoutFile1 = `{"path":"file1.rb","offenses":[{"severity":"convention","message":"Redundant \`return\` detected.","cop_name":"Style/RedundantReturn","corrected":false,"correctable":true,"location":{"start_line":5,"start_column":3,"last_line":5,"last_column":8,"length":6,"line":5,"column":3}}]}`;
	const stdoutFile2 = `{"path":"file2.rb","offenses":[{"severity":"warning","message":"Useless assignment to variable - \`x\`.","cop_name":"Lint/UselessAssignment","corrected":false,"correctable":true,"location":{"start_line":4,"start_column":1,"last_line":4,"last_column":1,"length":1,"line":4,"column":1}}]}`;
	return {
		// Expected output of the linting function
		cmdOutput: {
			status: 1,
			stdoutParts: [stdoutFile1, stdoutFile2],
			stdout: `{"metadata":{"rubocop_version":"1.88.2","ruby_engine":"ruby","ruby_version":"3.4.0","ruby_patchlevel":"0","ruby_platform":"x86_64-linux"},"files":[{"path":"Gemfile","offenses":[]},${stdoutFile1},${stdoutFile2}],"summary":{"offense_count":2,"target_file_count":3,"inspected_file_count":3}}`,
		},
		// Expected output of the parsing function
		lintResult: {
			isSuccess: false,
			warning: [
				{
					path: "file1.rb",
					firstLine: 5,
					lastLine: 5,
					message: "Redundant `return` detected (Style/RedundantReturn)",
				},
				{
					path: "file2.rb",
					firstLine: 4,
					lastLine: 4,
					message: "Useless assignment to variable - `x` (Lint/UselessAssignment)",
				},
			],
			error: [],
		},
	};
}

// Linting with auto-fixing. standardrb can correct both offenses of the test project
function getFixParams(dir) {
	const stdoutFile1 = `{"path":"file1.rb","offenses":[{"severity":"convention","message":"Redundant \`return\` detected.","cop_name":"Style/RedundantReturn","corrected":true,"correctable":true,"location":{"start_line":5,"start_column":3,"last_line":5,"last_column":8,"length":6,"line":5,"column":3}}]}`;
	const stdoutFile2 = `{"path":"file2.rb","offenses":[{"severity":"warning","message":"Useless assignment to variable - \`x\`.","cop_name":"Lint/UselessAssignment","corrected":true,"correctable":true,"location":{"start_line":4,"start_column":1,"last_line":4,"last_column":1,"length":1,"line":4,"column":1}}]}`;
	return {
		// Expected output of the linting function
		cmdOutput: {
			status: 0,
			stdoutParts: [stdoutFile1, stdoutFile2],
			stdout: `{"metadata":{"rubocop_version":"1.88.2","ruby_engine":"ruby","ruby_version":"3.4.0","ruby_patchlevel":"0","ruby_platform":"x86_64-linux"},"files":[{"path":"Gemfile","offenses":[]},${stdoutFile1},${stdoutFile2}],"summary":{"offense_count":2,"target_file_count":3,"inspected_file_count":3}}`,
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
