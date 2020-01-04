const ESLint = require("../../../src/linters/eslint");
const { joinDoubleBackslash } = require("../../utils");

const testName = "eslint";
const linter = ESLint;
const extensions = ["js"];

// Testing input/output for the Linter.lint function, with auto-fixing disabled
function getLintParams(dir) {
	const resultsFile1 = `{"filePath":"${joinDoubleBackslash(
		dir,
		"file1.js",
	)}","messages":[{"ruleId":"prefer-const","severity":1,"message":"'str' is never reassigned. Use 'const' instead.","line":1,"column":5,"nodeType":"Identifier","messageId":"useConst","endLine":1,"endColumn":8,"fix":{"range":[0,3],"text":"const"}},{"ruleId":"no-console","severity":2,"message":"Unexpected console statement.","line":4,"column":2,"nodeType":"MemberExpression","messageId":"unexpected","endLine":4,"endColumn":13}],"errorCount":1,"warningCount":1,"fixableErrorCount":0,"fixableWarningCount":1,"source":"let str = \\"world\\"; // \\"prefer-const\\" warning\\n\\nfunction main() {\\n\\tconsole.log(\\"hello \\" + str); // \\"no-console\\" error\\n}\\n\\nmain();\\n"}`;
	const resultsFile2 = `{"filePath":"${joinDoubleBackslash(
		dir,
		"file2.js",
	)}","messages":[{"ruleId":"no-unused-vars","severity":2,"message":"'str' is assigned a value but never used.","line":1,"column":7,"nodeType":"Identifier","endLine":1,"endColumn":10}],"errorCount":1,"warningCount":0,"fixableErrorCount":0,"fixableWarningCount":0,"source":"const str = \\"Hello world\\"; // \\"no-unused-vars\\" error\\n"}`;
	return {
		// Strings that must be contained in the stdout of the lint command
		stdoutParts: [resultsFile1, resultsFile2],
		// Example output of the lint command, used to test the parsing function
		parseInput: `[${resultsFile1},${resultsFile2}]`,
		// Expected output of the parsing function
		parseResult: [
			[],
			[
				{
					path: "file1.js",
					firstLine: 1,
					lastLine: 1,
					message: "'str' is never reassigned. Use 'const' instead (prefer-const)",
				},
			],
			[
				{
					path: "file1.js",
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
		],
	};
}

// Testing input/output for the Linter.lint function, with auto-fixing enabled
function getFixParams(dir) {
	const resultsFile1 = `{"filePath":"${joinDoubleBackslash(
		dir,
		"file1.js",
	)}","messages":[{"ruleId":"no-console","severity":2,"message":"Unexpected console statement.","line":4,"column":2,"nodeType":"MemberExpression","messageId":"unexpected","endLine":4,"endColumn":13}],"errorCount":1,"warningCount":0,"fixableErrorCount":0,"fixableWarningCount":0,"output":"const str = \\"world\\"; // \\"prefer-const\\" warning\\n\\nfunction main() {\\n\\tconsole.log(\\"hello \\" + str); // \\"no-console\\" error\\n}\\n\\nmain();\\n"}`;
	const resultsFile2 = `{"filePath":"${joinDoubleBackslash(
		dir,
		"file2.js",
	)}","messages":[{"ruleId":"no-unused-vars","severity":2,"message":"'str' is assigned a value but never used.","line":1,"column":7,"nodeType":"Identifier","endLine":1,"endColumn":10}],"errorCount":1,"warningCount":0,"fixableErrorCount":0,"fixableWarningCount":0,"source":"const str = \\"Hello world\\"; // \\"no-unused-vars\\" error\\n"}`;
	return {
		// Strings that must be contained in the stdout of the lint command
		stdoutParts: [resultsFile1, resultsFile2],
		// Example output of the lint command, used to test the parsing function
		parseInput: `[${resultsFile1},${resultsFile2}]`,
		// Expected output of the parsing function
		parseResult: [
			[],
			[],
			[
				{
					path: "file1.js",
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
		],
	};
}

module.exports = [testName, linter, extensions, getLintParams, getFixParams];
