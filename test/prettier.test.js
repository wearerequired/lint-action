const { join } = require("path");
const Prettier = require("../src/linters/prettier");

// Path to Prettier test project
const prettierProject = join(__dirname, "projects", "prettier");

// Expected linting results from test project
const testResultsCss = `styles.css`;
const testResultsJs = `index.js`;
const testResultsOrder1 = `${testResultsCss}\n${testResultsJs}`;
const testResultsOrder2 = `${testResultsJs}\n${testResultsCss}`;
const testResultsParsed = [
	[],
	[],
	[
		{
			path: "styles.css",
			firstLine: 1,
			lastLine: 1,
			message:
				"There are issues with this file's formatting. Please run Prettier on the file to fix the errors.",
		},
		{
			path: "index.js",
			firstLine: 1,
			lastLine: 1,
			message:
				"There are issues with this file's formatting. Please run Prettier on the file to fix the errors.",
		},
	],
];

test("should return correct linting results", () => {
	const results = Prettier.lint(prettierProject, ["css", "js"]);
	expect([testResultsOrder1, testResultsOrder2]).toContain(results);
});

test("should parse linting results correctly", () => {
	const resultsParsed = Prettier.parseResults(prettierProject, testResultsOrder1);
	expect(resultsParsed).toEqual(testResultsParsed);
});
