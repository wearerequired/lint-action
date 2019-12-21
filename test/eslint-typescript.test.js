const { join } = require("path");
const ESLint = require("../src/linters/eslint");
const { joinDoubleBackslash } = require("./utils");

// Path to ESLint test project
const eslintTsProject = join(__dirname, "projects", "eslint-typescript");

// Expected linting results from test project
const testResults = `[{"filePath":"${joinDoubleBackslash(
	eslintTsProject,
	"index.ts",
)}","messages":[{"ruleId":"no-unused-vars","severity":2,"message":"'var1' is defined but never used.","line":1,"column":5,"nodeType":"Identifier","endLine":1,"endColumn":9},{"ruleId":"prefer-const","severity":1,"message":"'var2' is never reassigned. Use 'const' instead.","line":2,"column":5,"nodeType":"Identifier","messageId":"useConst","endLine":2,"endColumn":9,"fix":{"range":[36,39],"text":"const"}},{"ruleId":"no-console","severity":2,"message":"Unexpected console statement.","line":5,"column":2,"nodeType":"MemberExpression","messageId":"unexpected","endLine":5,"endColumn":13}],"errorCount":2,"warningCount":1,"fixableErrorCount":0,"fixableWarningCount":1,"source":"let var1; // \\"no-unused-vars\\" error\\nlet var2 = \\"world\\"; // \\"prefer-const\\" warning\\n\\nfunction main(param: string) {\\n\\tconsole.log(\\"hello \\" + param); // \\"no-console\\" error\\n}\\n\\nmain(var2);\\n"}]`;
const testResultsParsed = [
	[],
	[
		{
			path: "index.ts",
			firstLine: 2,
			lastLine: 2,
			message: "'var2' is never reassigned. Use 'const' instead. (prefer-const)",
		},
	],
	[
		{
			path: "index.ts",
			firstLine: 1,
			lastLine: 1,
			message: "'var1' is defined but never used. (no-unused-vars)",
		},
		{
			path: "index.ts",
			firstLine: 5,
			lastLine: 5,
			message: "Unexpected console statement. (no-console)",
		},
	],
];

test("should return correct linting results", () => {
	const results = ESLint.lint(eslintTsProject, ["ts"]);
	expect(results).toEqual(testResults);
});

test("should parse linting results correctly", () => {
	const resultsParsed = ESLint.parseResults(eslintTsProject, testResults);
	expect(resultsParsed).toEqual(testResultsParsed);
});
