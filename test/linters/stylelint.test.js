const { join } = require("path");
const Stylelint = require("../../src/linters/stylelint");
const { joinDoubleBackslash } = require("../utils");

// Path to stylelint test project
const stylelintProject = join(__dirname, "projects", "stylelint");

// Expected linting results from test project
const testResults = `[{"source":"${joinDoubleBackslash(
	stylelintProject,
	"styles.css",
)}","deprecations":[],"invalidOptionWarnings":[],"parseErrors":[],"errored":true,"warnings":[{"line":5,"column":6,"rule":"block-no-empty","severity":"error","text":"Unexpected empty block (block-no-empty)"},{"line":2,"column":9,"rule":"color-named","severity":"warning","text":"Unexpected named color \\"red\\" (color-named)"}]}]`;
const testResultsParsed = [
	[],
	[
		{
			path: "styles.css",
			firstLine: 2,
			lastLine: 2,
			message: 'Unexpected named color "red" (color-named)',
		},
	],
	[
		{
			path: "styles.css",
			firstLine: 5,
			lastLine: 5,
			message: "Unexpected empty block (block-no-empty)",
		},
	],
];

test("should return correct linting results", () => {
	const results = Stylelint.lint(stylelintProject, ["css"]);
	expect(results).toEqual(testResults);
});

test("should parse linting results correctly", () => {
	const resultsParsed = Stylelint.parseResults(stylelintProject, testResults);
	expect(resultsParsed).toEqual(testResultsParsed);
});
