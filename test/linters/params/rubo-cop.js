const RuboCop = require("../../../src/linters/rubo-cop");

const testName = "rubo-cop";
const linter = RuboCop;
const extensions = ["rb"];

const getLintResults = dir =>
	'[{"path":"file1.rb","offenses":[{"severity":"convention","message":"Missing magic comment `# frozen_string_literal: true`.","cop_name":"Style/FrozenStringLiteralComment","corrected":false,"location":{"start_line":1,"start_column":1,"last_line":1,"last_column":1,"length":1,"line":1,"column":1}},{"severity":"convention","message":"Freeze mutable objects assigned to constants.","cop_name":"Style/MutableConstant","corrected":false,"location":{"start_line":1,"start_column":16,"last_line":1,"last_column":26,"length":11,"line":1,"column":16}},{"severity":"convention","message":"Do not freeze immutable objects, as freezing them has no effect.","cop_name":"Style/RedundantFreeze","corrected":false,"location":{"start_line":4,"start_column":8,"last_line":6,"last_column":0,"length":18,"line":4,"column":8}},{"severity":"convention","message":"Use 2 (not 8) spaces for indentation.","cop_name":"Layout/IndentationWidth","corrected":false,"location":{"start_line":4,"start_column":1,"last_line":4,"last_column":8,"length":8,"line":4,"column":1}},{"severity":"convention","message":"Use snake_case for method names.","cop_name":"Naming/MethodName","corrected":false,"location":{"start_line":9,"start_column":3,"last_line":11,"last_column":4,"length":7,"line":9,"column":3}},{"severity":"warning","message":"`end` at 15, 2 is not aligned with `def` at 13, 0.","cop_name":"Layout/DefEndAlignment","corrected":false,"location":{"start_line":14,"start_column":22,"last_line":14,"last_column":24,"length":3,"line":14,"column":22}}]},{"path":"file2.rb","offenses":[{"severity":"warning","message":"`end` at 5, 2 is not aligned with `def` at 3, 0.","cop_name":"Layout/DefEndAlignment","corrected":false,"location":{"start_line":5,"start_column":3,"last_line":5,"last_column":5,"length":3,"line":5,"column":3}}]}]';

const parsedLintResults = [
	{
		path: "file1.rb",
		firstLine: 1,
		lastLine: 1,
		message: "Missing magic comment `# frozen_string_literal: true`.",
	},
	{
		path: "file1.rb",
		firstLine: 1,
		lastLine: 1,
		message: "Freeze mutable objects assigned to constants.",
	},
	{
		path: "file1.rb",
		firstLine: 4,
		lastLine: 6,
		message: "Do not freeze immutable objects, as freezing them has no effect.",
	},
	{
		path: "file1.rb",
		firstLine: 4,
		lastLine: 4,
		message: "Use 2 (not 8) spaces for indentation.",
	},
	{
		path: "file1.rb",
		firstLine: 9,
		lastLine: 11,
		message: "Use snake_case for method names.",
	},
	{
		path: "file1.rb",
		firstLine: 14,
		lastLine: 14,
		message: "`end` at 15, 2 is not aligned with `def` at 13, 0.",
	},
	{
		path: "file2.rb",
		firstLine: 5,
		lastLine: 5,
		message: "`end` at 5, 2 is not aligned with `def` at 3, 0.",
	},
];

const getFixResults = dir =>
	'[{"path":"file1.rb","offenses":[{"severity":"convention","message":"Missing magic comment `# frozen_string_literal: true`.","cop_name":"Style/FrozenStringLiteralComment","corrected":true,"location":{"start_line":1,"start_column":1,"last_line":1,"last_column":1,"length":1,"line":1,"column":1}},{"severity":"convention","message":"Freeze mutable objects assigned to constants.","cop_name":"Style/MutableConstant","corrected":true,"location":{"start_line":1,"start_column":16,"last_line":1,"last_column":26,"length":11,"line":1,"column":16}},{"severity":"convention","message":"Do not freeze immutable objects, as freezing them has no effect.","cop_name":"Style/RedundantFreeze","corrected":true,"location":{"start_line":3,"start_column":16,"last_line":3,"last_column":33,"length":18,"line":3,"column":16}},{"severity":"convention","message":"Use 2 (not 8) spaces for indentation.","cop_name":"Layout/IndentationWidth","corrected":true,"location":{"start_line":4,"start_column":1,"last_line":4,"last_column":8,"length":8,"line":4,"column":1}},{"severity":"convention","message":"Use snake_case for method names.","cop_name":"Naming/MethodName","corrected":false,"location":{"start_line":9,"start_column":5,"last_line":9,"last_column":11,"length":7,"line":9,"column":5}},{"severity":"warning","message":"`end` at 15, 2 is not aligned with `def` at 13, 0.","cop_name":"Layout/DefEndAlignment","corrected":false,"location":{"start_line":15,"start_column":3,"last_line":15,"last_column":5,"length":3,"line":15,"column":3}}]},{"path":"file2.rb","offenses":[{"severity":"warning","message":"`end` at 5, 2 is not aligned with `def` at 3, 0.","cop_name":"Layout/DefEndAlignment","corrected":false,"location":{"start_line":5,"start_column":3,"last_line":5,"last_column":5,"length":3,"line":5,"column":3}}]}]';

const parsedFixResults = [
	{
		path: "file1.rb",
		firstLine: 1,
		lastLine: 1,
		message: "Missing magic comment `# frozen_string_literal: true`.",
	},
	{
		path: "file1.rb",
		firstLine: 1,
		lastLine: 1,
		message: "Freeze mutable objects assigned to constants.",
	},
	{
		path: "file1.rb",
		firstLine: 3,
		lastLine: 3,
		message: "Do not freeze immutable objects, as freezing them has no effect.",
	},
	{
		path: "file1.rb",
		firstLine: 4,
		lastLine: 4,
		message: "Use 2 (not 8) spaces for indentation.",
	},
	{
		path: "file1.rb",
		firstLine: 9,
		lastLine: 9,
		message: "Use snake_case for method names.",
	},
	{
		path: "file1.rb",
		firstLine: 15,
		lastLine: 15,
		message: "`end` at 15, 2 is not aligned with `def` at 13, 0.",
	},
	{
		path: "file2.rb",
		firstLine: 5,
		lastLine: 5,
		message: "`end` at 5, 2 is not aligned with `def` at 3, 0.",
	},
];

module.exports = [
	testName,
	linter,
	extensions,
	getLintResults,
	getFixResults,
	parsedLintResults,
	parsedFixResults,
];
