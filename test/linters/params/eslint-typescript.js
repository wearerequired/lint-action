const ESLint = require("../../../src/linters/eslint");
const { joinDoubleBackslash } = require("../../test-utils");

const testName = "eslint-typescript";
const linter = ESLint;
const extensions = ["js", "ts"];

// Linting without auto-fixing
function getLintParams(dir) {
	const stdoutFile1 = `{"filePath":"${joinDoubleBackslash(
		dir,
		"file1.ts",
	)}","messages":[{"ruleId":"prefer-const","severity":1,"message":"'str' is never reassigned. Use 'const' instead.","line":1,"column":5,"nodeType":"Identifier","messageId":"useConst","endLine":1,"endColumn":8,"fix":{"range":[0,3],"text":"const"}},{"ruleId":"no-console","severity":2,"message":"Unexpected console statement.","line":4,"column":2,"nodeType":"MemberExpression","messageId":"unexpected","endLine":4,"endColumn":13}],"errorCount":1,"warningCount":1,"fixableErrorCount":0,"fixableWarningCount":1,"source":"let str = \\"world\\"; // \\"prefer-const\\" warning\\n\\nfunction main(): void {\\n\\tconsole.log(\\"hello \\" + str); // \\"no-console\\" error\\n}\\n\\nmain();\\n"}`;
	const stdoutFile2 = `{"filePath":"${joinDoubleBackslash(
		dir,
		"file2.js",
	)}","messages":[{"ruleId":"no-unused-vars","severity":2,"message":"'str' is assigned a value but never used.","line":1,"column":7,"nodeType":"Identifier","endLine":1,"endColumn":10}],"errorCount":1,"warningCount":0,"fixableErrorCount":0,"fixableWarningCount":0,"source":"const str = \\"Hello world\\"; // \\"no-unused-vars\\" error\\n"}`;
	return {
		// Expected output of the linting function
		cmdOutput: {
			status: 1,
			stdoutParts: [stdoutFile1, stdoutFile2],
			stdout: `[${stdoutFile1},${stdoutFile2}]`,
		},
		// Expected output of the parsing function
		lintResult: {
			isSuccess: false,
			warning: [
				{
					path: "file1.ts",
					firstLine: 1,
					lastLine: 1,
					message: "'str' is never reassigned. Use 'const' instead (prefer-const)",
				},
			],
			error: [
				{
					path: "file1.ts",
					firstLine: 4,
					lastLine: 4,
					message: "Unexpected console statement (no-console)",
				},
				{
					path: "file2.js",
					firstLine: 1,
					lastLine: 1,
					message: "'str' is assigned a value but never used (no-unused-vars)",
				},
			],
		},
	};
}

// Linting with auto-fixing
function getFixParams(dir) {
	const stdoutFile1 = `{"filePath":"${joinDoubleBackslash(
		dir,
		"file1.ts",
	)}","messages":[{"ruleId":"no-console","severity":2,"message":"Unexpected console statement.","line":4,"column":2,"nodeType":"MemberExpression","messageId":"unexpected","endLine":4,"endColumn":13}],"errorCount":1,"warningCount":0,"fixableErrorCount":0,"fixableWarningCount":0,"output":"const str = \\"world\\"; // \\"prefer-const\\" warning\\n\\nfunction main(): void {\\n\\tconsole.log(\\"hello \\" + str); // \\"no-console\\" error\\n}\\n\\nmain();\\n"}`;
	const stdoutFile2 = `{"filePath":"${joinDoubleBackslash(
		dir,
		"file2.js",
	)}","messages":[{"ruleId":"no-unused-vars","severity":2,"message":"'str' is assigned a value but never used.","line":1,"column":7,"nodeType":"Identifier","endLine":1,"endColumn":10}],"errorCount":1,"warningCount":0,"fixableErrorCount":0,"fixableWarningCount":0,"source":"const str = \\"Hello world\\"; // \\"no-unused-vars\\" error\\n"}`;
	return {
		// Expected output of the linting function
		cmdOutput: {
			status: 1,
			stdoutParts: [stdoutFile1, stdoutFile2],
			stdout: `[${stdoutFile1},${stdoutFile2}]`,
		},
		// Expected output of the parsing function
		lintResult: {
			isSuccess: false,
			warning: [],
			error: [
				{
					path: "file1.ts",
					firstLine: 4,
					lastLine: 4,
					message: "Unexpected console statement (no-console)",
				},
				{
					path: "file2.js",
					firstLine: 1,
					lastLine: 1,
					message: "'str' is assigned a value but never used (no-unused-vars)",
				},
			],
		},
	};
}

module.exports = [testName, linter, extensions, getLintParams, getFixParams];
