const RuboCop = require("../../../src/linters/rubo-cop");

const testName = "rubo-cop";
const linter = RuboCop;
const extensions = ["rb"];

const perm = a =>
	a.length
		? a.reduce(
				(r, v, i) => [...r, ...perm([...a.slice(0, i), ...a.slice(i + 1)]).map(x => [v, ...x])],
				[],
		  )
		: [[]];

const lintResults = JSON.parse(
	'[{"path":"file1.rb","firstLine":4,"lastLine":4,"message":"Use 2 (not 8) spaces for indentation."},{"path":"file1.rb","firstLine":5,"lastLine":7,"message":"Use snake_case for method names."},{"path":"file2.rb","firstLine":4,"lastLine":4,"message":"Redundant `return` detected."},{"path":"file2.rb","firstLine":4,"lastLine":5,"message":"`end` at 5, 4 is not aligned with `def` at 3, 0."}]',
);

const getLintResults = dir => perm(lintResults).map(a => JSON.stringify(a));

const parsedLintResults = [
	{
		path: "file1.rb",
		firstLine: 4,
		lastLine: 4,
		message: "Use 2 (not 8) spaces for indentation.",
	},
	{
		path: "file1.rb",
		firstLine: 5,
		lastLine: 7,
		message: "Use snake_case for method names.",
	},
	{
		path: "file2.rb",
		firstLine: 4,
		lastLine: 4,
		message: "Redundant `return` detected.",
	},
	{
		path: "file2.rb",
		firstLine: 4,
		lastLine: 5,
		message: "`end` at 5, 4 is not aligned with `def` at 3, 0.",
	},
];

const fixResults = JSON.parse(
	'[{"path":"file1.rb","firstLine":4,"lastLine":4,"message":"Use 2 (not 8) spaces for indentation."},{"path":"file1.rb","firstLine":7,"lastLine":7,"message":"Use snake_case for method names."},{"path":"file2.rb","firstLine":4,"lastLine":4,"message":"Redundant `return` detected."},{"path":"file2.rb","firstLine":5,"lastLine":5,"message":"`end` at 5, 4 is not aligned with `def` at 3, 0."}]',
);

const getFixResults = dir => perm(fixResults).map(a => JSON.stringify(a));

const parsedFixResults = [
	{
		path: "file1.rb",
		firstLine: 4,
		lastLine: 4,
		message: "Use 2 (not 8) spaces for indentation.",
	},
	{
		path: "file1.rb",
		firstLine: 7,
		lastLine: 7,
		message: "Use snake_case for method names.",
	},
	{
		path: "file2.rb",
		firstLine: 4,
		lastLine: 4,
		message: "Redundant `return` detected.",
	},
	{
		path: "file2.rb",
		firstLine: 5,
		lastLine: 5,
		message: "`end` at 5, 4 is not aligned with `def` at 3, 0.",
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
