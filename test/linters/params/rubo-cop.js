const RuboCop = require("../../../src/linters/rubo-cop");

const testName = "rubo-cop";
const linter = RuboCop;
const extensions = ["rb"];

const formatResults = results => JSON.parse(results).files;

const getLintResults = dir =>
	'{"metadata":{"rubocop_version":"0.71.0","ruby_engine":"ruby","ruby_version":"2.5.3","ruby_patchlevel":"105","ruby_platform":"x86_64-darwin18"},"files":[{"path":"file1.rb","offenses":[{"severity":"convention","message":"Redundant `return` detected.","cop_name":"Style/RedundantReturn","corrected":false,"location":{"start_line":4,"start_column":3,"last_line":4,"last_column":8,"length":6,"line":4,"column":3}}]},{"path":"file2.rb","offenses":[{"severity":"warning","message":"Useless assignment to variable - `x`.","cop_name":"Lint/UselessAssignment","corrected":false,"location":{"start_line":3,"start_column":1,"last_line":3,"last_column":1,"length":1,"line":3,"column":1}}]}],"summary":{"offense_count":2,"target_file_count":2,"inspected_file_count":2}}';

const getFixResults = dir =>
	'{"metadata":{"rubocop_version":"0.71.0","ruby_engine":"ruby","ruby_version":"2.5.3","ruby_patchlevel":"105","ruby_platform":"x86_64-darwin18"},"files":[{"path":"file1.rb","offenses":[{"severity":"convention","message":"Redundant `return` detected.","cop_name":"Style/RedundantReturn","corrected":true,"location":{"start_line":4,"start_column":3,"last_line":4,"last_column":8,"length":6,"line":4,"column":3}}]},{"path":"file2.rb","offenses":[{"severity":"warning","message":"Useless assignment to variable - `x`.","cop_name":"Lint/UselessAssignment","corrected":false,"location":{"start_line":3,"start_column":1,"last_line":3,"last_column":1,"length":1,"line":3,"column":1}}]}],"summary":{"offense_count":2,"target_file_count":2,"inspected_file_count":2}}';

const parsedLintResults = [
	{
		firstLine: 4,
		lastLine: 4,
		message: "Redundant `return` detected.",
		path: "file1.rb",
	},
	{
		firstLine: 3,
		lastLine: 3,
		message: "Useless assignment to variable - `x`.",
		path: "file2.rb",
	},
];

const parsedFixResults = parsedLintResults;

module.exports = [
	testName,
	linter,
	extensions,
	getLintResults,
	getFixResults,
	parsedLintResults,
	parsedFixResults,
	formatResults,
];
