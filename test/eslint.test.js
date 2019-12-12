const { join } = require("path");
const ESLint = require("../src/linters/eslint");

// Path to ESLint test project
const eslintProject = join(__dirname, "projects", "eslint");

// Expected linting results from test project
const testResults = `[{"filePath":"${eslintProject}/index.js","messages":[{"ruleId":"no-unused-vars","severity":2,"message":"'var1' is defined but never used.","line":1,"column":5,"nodeType":"Identifier","endLine":1,"endColumn":9},{"ruleId":"no-console","severity":2,"message":"Unexpected console statement.","line":5,"column":2,"nodeType":"MemberExpression","messageId":"unexpected","endLine":5,"endColumn":13}],"errorCount":2,"warningCount":0,"fixableErrorCount":0,"fixableWarningCount":0,"source":"let var1; // \\"no-unused-vars\\" error\\nlet var2 = \\"world\\"; // \\"prefer-const\\" warning\\n\\nfunction main() {\\n\\tconsole.log(\\"hello \\" + var2); // \\"no-console\\" error\\n}\\n\\nmain();\\n"}]\n`;
const testResultsParsed = [
	{
		path: "index.js",
		firstLine: 1,
		lastLine: 1,
		message: "'var1' is defined but never used. (no-unused-vars)",
	},
	{
		path: "index.js",
		firstLine: 5,
		lastLine: 5,
		message: "Unexpected console statement. (no-console)",
	},
];

test("should return correct linting results", () => {
	const results = ESLint.lint(eslintProject, ["js"]);
	expect(results.hasErrors).toBeTruthy();
	expect(results.output).toEqual(testResults);
});

test("should parse linting results correctly", () => {
	const resultsParsed = ESLint.parseResults(eslintProject, testResults);
	expect(resultsParsed).toEqual(testResultsParsed);
});
