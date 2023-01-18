const ESLint = require("../../../src/linters/eslint");
const { joinDoubleBackslash } = require("../../test-utils");

const testName = "eslint-typescript";
const linter = ESLint;
const args = "";
const commandPrefix = "";
const extensions = ["js", "ts"];

// Linting without auto-fixing
function getLintParams(dir) {
	const stdoutFile1 = `{"filePath":"${joinDoubleBackslash(
		dir,
		"file1.ts",
	)}","messages":[{"ruleId":"prefer-const","severity":2,"message":"'str' is never reassigned. Use 'const' instead.","line":1,"column":5,"nodeType":"Identifier","messageId":"useConst","endLine":1,"endColumn":8,"fix":{"range":[0,18],"text":"const str = 'world';"}},{"ruleId":"no-warning-comments","severity":1,"message":"Unexpected 'todo' comment: 'TODO: Change something'.","line":5,"column":31,"nodeType":"Line","messageId":"unexpectedComment","endLine":5,"endColumn":56}],"suppressedMessages":[],"errorCount":1,"fatalErrorCount":0,"warningCount":1,"fixableErrorCount":1,"fixableWarningCount":0,"source":"let str = 'world'; // \\"prefer-const\\" warning\\n\\nfunction main(): void {\\n\\t// \\"no-warning-comments\\" error\\n\\tconsole.log('hello ' + str); // TODO: Change something\\n}\\n\\nmain();\\n","usedDeprecatedRules":[]}`;
	const stdoutFile2 = `{"filePath":"${joinDoubleBackslash(
		dir,
		"file2.js",
	)}","messages":[{"ruleId":"no-unused-vars","severity":2,"message":"'str' is assigned a value but never used.","line":1,"column":7,"nodeType":"Identifier","messageId":"unusedVar","endLine":1,"endColumn":10}],"suppressedMessages":[],"errorCount":1,"fatalErrorCount":0,"warningCount":0,"fixableErrorCount":0,"fixableWarningCount":0,"source":"const str = 'Hello world'; // \\"no-unused-vars\\" error\\n","usedDeprecatedRules":[]}`;
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
					firstLine: 5,
					lastLine: 5,
					message: "Unexpected 'todo' comment: 'TODO: Change something' (no-warning-comments)",
				},
			],
			error: [
				{
					path: "file1.ts",
					firstLine: 1,
					lastLine: 1,
					message: "'str' is never reassigned. Use 'const' instead (prefer-const)",
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
	)}","messages":[{"ruleId":"no-warning-comments","severity":1,"message":"Unexpected 'todo' comment: 'TODO: Change something'.","line":5,"column":31,"nodeType":"Line","messageId":"unexpectedComment","endLine":5,"endColumn":56}],"suppressedMessages":[],"errorCount":0,"fatalErrorCount":0,"warningCount":1,"fixableErrorCount":0,"fixableWarningCount":0,"output":"const str = 'world'; // \\"prefer-const\\" warning\\n\\nfunction main(): void {\\n\\t// \\"no-warning-comments\\" error\\n\\tconsole.log('hello ' + str); // TODO: Change something\\n}\\n\\nmain();\\n","usedDeprecatedRules":[]}`;
	const stdoutFile2 = `{"filePath":"${joinDoubleBackslash(
		dir,
		"file2.js",
	)}","messages":[{"ruleId":"no-unused-vars","severity":2,"message":"'str' is assigned a value but never used.","line":1,"column":7,"nodeType":"Identifier","messageId":"unusedVar","endLine":1,"endColumn":10}],"suppressedMessages":[],"errorCount":1,"fatalErrorCount":0,"warningCount":0,"fixableErrorCount":0,"fixableWarningCount":0,"source":"const str = 'Hello world'; // \\"no-unused-vars\\" error\\n","usedDeprecatedRules":[]}`;
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
					firstLine: 5,
					lastLine: 5,
					message: "Unexpected 'todo' comment: 'TODO: Change something' (no-warning-comments)",
				},
			],
			error: [
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

module.exports = [testName, linter, commandPrefix, extensions, args, getLintParams, getFixParams];
