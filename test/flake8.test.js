const { join } = require("path");
const Flake8 = require("../src/linters/flake8");

// Path to flake8 test project
const flake8Project = join(__dirname, "projects", "flake8");

// Expected linting results from test project
const testResults = `./main.py:5:9: E211 whitespace before '('\n./main.py:10:1: E305 expected 2 blank lines after class or function definition, found 1\n`;
const testResultsParsed = [
	[],
	[],
	[
		{
			path: "main.py",
			firstLine: 5,
			lastLine: 5,
			message: "Whitespace before '(' (E211)",
		},
		{
			path: "main.py",
			firstLine: 10,
			lastLine: 10,
			message: "Expected 2 blank lines after class or function definition, found 1 (E305)",
		},
	],
];

test("should return correct linting results", () => {
	const results = Flake8.lint(flake8Project, ["py"]);
	expect(results).toEqual(testResults);
});

test("should parse linting results correctly", () => {
	const resultsParsed = Flake8.parseResults(flake8Project, testResults);
	expect(resultsParsed).toEqual(testResultsParsed);
});
