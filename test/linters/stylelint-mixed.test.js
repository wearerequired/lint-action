const { join } = require("path");
const Stylelint = require("../../src/linters/stylelint");
const { joinDoubleBackslash } = require("../utils");

// Path to stylelint test project
const stylelintMixedProject = join(__dirname, "projects", "stylelint-mixed");

// Expected linting results from test project
// stylelint lints files in parallel, so the order may be different between two test runs
const resultsCss = `{"source":"${joinDoubleBackslash(
	stylelintMixedProject,
	"styles.css",
)}","deprecations":[],"invalidOptionWarnings":[],"parseErrors":[],"errored":true,"warnings":[{"line":5,"column":6,"rule":"block-no-empty","severity":"error","text":"Unexpected empty block (block-no-empty)"},{"line":2,"column":9,"rule":"color-named","severity":"warning","text":"Unexpected named color \\"red\\" (color-named)"}]}`;
const resultsScss = `{"source":"${joinDoubleBackslash(
	stylelintMixedProject,
	"styles.scss",
)}","deprecations":[],"invalidOptionWarnings":[],"parseErrors":[],"errored":true,"warnings":[{"line":5,"column":6,"rule":"block-no-empty","severity":"error","text":"Unexpected empty block (block-no-empty)"},{"line":2,"column":9,"rule":"color-named","severity":"warning","text":"Unexpected named color \\"red\\" (color-named)"}]}`;
const testResultsOrder1 = `[${resultsCss},${resultsScss}]`;
const testResultsOrder2 = `[${resultsScss},${resultsCss}]`;
const testResultsParsed = [
	[],
	[
		{
			path: "styles.css",
			firstLine: 2,
			lastLine: 2,
			message: 'Unexpected named color "red" (color-named)',
		},
		{
			path: "styles.scss",
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
		{
			path: "styles.scss",
			firstLine: 5,
			lastLine: 5,
			message: "Unexpected empty block (block-no-empty)",
		},
	],
];

test("should return correct linting results", () => {
	const results = Stylelint.lint(stylelintMixedProject, ["css", "less", "scss"]);
	expect([testResultsOrder1, testResultsOrder2]).toContain(results);
});

test("should parse linting results correctly", () => {
	const resultsParsed = Stylelint.parseResults(stylelintMixedProject, testResultsOrder1);
	expect(resultsParsed).toEqual(testResultsParsed);
});
