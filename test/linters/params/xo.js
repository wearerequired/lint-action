const XO = require("../../../src/linters/xo");
const { joinDoubleBackslash } = require("../../test-utils");

const testName = "xo";
const linter = XO;
const commandPrefix = "";
const args = "";
const extensions = ["js"];

// Linting without auto-fixing
function getLintParams(dir) {
	const stdoutFile1 = `{"filePath":"${joinDoubleBackslash(
		dir,
		"file1.js",
	)}","messages":[{"ruleId":"unicorn/prevent-abbreviations","severity":2,"message":"The variable \`str\` should be named \`string_\`. A more descriptive name will do too.","line":1,"column":5,"nodeType":"Identifier","messageId":"replace","endLine":1,"endColumn":8,"fix":{"range":[4,123],"text":"string_ = 'world'; // \\"prefer-const\\" warning\\n\\nfunction main() {\\n\\t// \\"no-warning-comments\\" error\\n\\tconsole.log('hello ' + string_"}},{"ruleId":"prefer-const","severity":2,"message":"'str' is never reassigned. Use 'const' instead.","line":1,"column":5,"nodeType":"Identifier","messageId":"useConst","endLine":1,"endColumn":8,"fix":{"range":[0,18],"text":"const str = 'world';"}},{"ruleId":"no-warning-comments","severity":1,"message":"Unexpected 'todo' comment: 'TODO: Change something'.","line":5,"column":31,"nodeType":"Line","messageId":"unexpectedComment","endLine":5,"endColumn":56}],"suppressedMessages":[],"errorCount":2,"fatalErrorCount":0,"warningCount":1,"fixableErrorCount":2,"fixableWarningCount":0,"source":"let str = 'world'; // \\"prefer-const\\" warning\\n\\nfunction main() {\\n\\t// \\"no-warning-comments\\" error\\n\\tconsole.log('hello ' + str); // TODO: Change something\\n}\\n\\nmain();\\n","usedDeprecatedRules":[{"ruleId":"no-buffer-constructor","replacedBy":[]}]}`;
	const stdoutFile2 = `{"filePath":"${joinDoubleBackslash(
		dir,
		"file2.js",
	)}","messages":[{"ruleId":"unicorn/prevent-abbreviations","severity":2,"message":"The variable \`str\` should be named \`string_\`. A more descriptive name will do too.","line":1,"column":7,"nodeType":"Identifier","messageId":"replace","endLine":1,"endColumn":10,"fix":{"range":[6,9],"text":"string_"}},{"ruleId":"no-unused-vars","severity":2,"message":"'str' is assigned a value but never used.","line":1,"column":7,"nodeType":"Identifier","messageId":"unusedVar","endLine":1,"endColumn":10}],"suppressedMessages":[],"errorCount":2,"fatalErrorCount":0,"warningCount":0,"fixableErrorCount":1,"fixableWarningCount":0,"source":"const str = 'Hello world'; // \\"no-unused-vars\\" error\\n","usedDeprecatedRules":[{"ruleId":"no-buffer-constructor","replacedBy":[]}]}`;
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
					path: "file1.js",
					firstLine: 5,
					lastLine: 5,
					message: "Unexpected 'todo' comment: 'TODO: Change something' (no-warning-comments)",
				},
			],
			error: [
				{
					path: "file1.js",
					firstLine: 1,
					lastLine: 1,
					message:
						"The variable `str` should be named `string_`. A more descriptive name will do too (unicorn/prevent-abbreviations)",
				},
				{
					path: "file1.js",
					firstLine: 1,
					lastLine: 1,
					message: "'str' is never reassigned. Use 'const' instead (prefer-const)",
				},
				{
					path: "file2.js",
					firstLine: 1,
					lastLine: 1,
					message:
						"The variable `str` should be named `string_`. A more descriptive name will do too (unicorn/prevent-abbreviations)",
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
		"file1.js",
	)}","messages":[{"ruleId":"no-warning-comments","severity":1,"message":"Unexpected 'todo' comment: 'TODO: Change something'.","line":5,"column":35,"nodeType":"Line","messageId":"unexpectedComment","endLine":5,"endColumn":60}],"suppressedMessages":[],"errorCount":0,"fatalErrorCount":0,"warningCount":1,"fixableErrorCount":0,"fixableWarningCount":0,"output":"const string_ = 'world'; // \\"prefer-const\\" warning\\n\\nfunction main() {\\n\\t// \\"no-warning-comments\\" error\\n\\tconsole.log('hello ' + string_); // TODO: Change something\\n}\\n\\nmain();\\n","usedDeprecatedRules":[{"ruleId":"no-buffer-constructor","replacedBy":[]}]}`;
	const stdoutFile2 = `{"filePath":"${joinDoubleBackslash(
		dir,
		"file2.js",
	)}","messages":[{"ruleId":"no-unused-vars","severity":2,"message":"'string_' is assigned a value but never used.","line":1,"column":7,"nodeType":"Identifier","messageId":"unusedVar","endLine":1,"endColumn":14}],"suppressedMessages":[],"errorCount":1,"fatalErrorCount":0,"warningCount":0,"fixableErrorCount":0,"fixableWarningCount":0,"output":"const string_ = 'Hello world'; // \\"no-unused-vars\\" error\\n","usedDeprecatedRules":[{"ruleId":"no-buffer-constructor","replacedBy":[]}]}`;
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
					path: "file1.js",
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
					message: "'string_' is assigned a value but never used (no-unused-vars)",
				},
			],
		},
	};
}

module.exports = [testName, linter, commandPrefix, extensions, args, getLintParams, getFixParams];
