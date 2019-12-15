const { join } = require("path");
const Prettier = require("../src/linters/prettier");

// Path to Prettier test project
const prettierProject = join(__dirname, "projects", "prettier");

// Expected linting results from test project
const testResults = `styles.css\nindex.js\n`;
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
	expect(results).toEqual(testResults);
});

test("should parse linting results correctly", () => {
	const resultsParsed = Prettier.parseResults(prettierProject, testResults);
	expect(resultsParsed).toEqual(testResultsParsed);
});
