const { join } = require("path");
const Stylelint = require("../src/linters/stylelint");

// Path to stylelint test project
const stylelintScssProject = join(__dirname, "projects", "stylelint-scss");

// Expected linting results from test project
const testResults = `[{"source":"${stylelintScssProject}/styles.scss","deprecations":[],"invalidOptionWarnings":[],"parseErrors":[],"errored":true,"warnings":[{"line":5,"column":6,"rule":"block-no-empty","severity":"error","text":"Unexpected empty block (block-no-empty)"},{"line":2,"column":9,"rule":"color-named","severity":"warning","text":"Unexpected named color \\"red\\" (color-named)"}]}]`;
const testResultsParsed = [
	[],
	[
		{
			path: "styles.scss",
			firstLine: 2,
			lastLine: 2,
			message: 'Unexpected named color "red" (color-named)',
		},
	],
	[
		{
			path: "styles.scss",
			firstLine: 5,
			lastLine: 5,
			message: "Unexpected empty block (block-no-empty)",
		},
	],
];

test("should return correct linting results", () => {
	const results = Stylelint.lint(stylelintScssProject, ["scss"]);
	expect(results).toEqual(testResults);
});

test("should parse linting results correctly", () => {
	const resultsParsed = Stylelint.parseResults(stylelintScssProject, testResults);
	expect(resultsParsed).toEqual(testResultsParsed);
});
