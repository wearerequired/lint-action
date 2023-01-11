const TSC = require("../../../src/linters/tsc");
// const { joinDoubleBackslash } = require("../../test-utils");

const testName = "tsc";
const linter = TSC;
const commandPrefix = "";
const extensions = ["js"];

// Linting without auto-fixing
function getLintParams(dir) {
	const stdoutFile1 = `file1.ts(1,5): error TS7034: Variable 'str' implicitly has type 'any' in some locations where its type cannot be determined.\nfile1.ts(4,25): error TS7005: Variable 'str' implicitly has an 'any' type.`;
	const stdoutFile2 = `file2.ts(3,1): error TS2322: Type 'string' is not assignable to type 'number'.`;
	return {
		// Expected output of the linting function
		cmdOutput: {
			status: 2,
			stdoutParts: [stdoutFile1, stdoutFile2],
			stdout: `${stdoutFile1}\n${stdoutFile2}`,
		},
		// Expected output of the parsing function
		lintResult: {
			isSuccess: false,
			warning: [
				// {
				// 	path: "file1.js",
				// 	firstLine: 5,
				// 	lastLine: 5,
				// 	message: "Unexpected 'todo' comment: 'TODO: Change something' (no-warning-comments)",
				// },
			],
			error: [
				{
					path: "file1.ts",
					firstLine: 1,
					lastLine: 1,
					message: "TS7034: Variable 'str' implicitly has type 'any' in some locations where its type cannot be determined",
				},
				{
					path: "file1.ts",
					firstLine: 4,
					lastLine: 4,
					message: "TS7005: Variable 'str' implicitly has an 'any' type",
				},
				{
					path: "file2.ts",
					firstLine: 3,
					lastLine: 3,
					message: "TS2322: Type 'string' is not assignable to type 'number'",
				},
			],
		},
	};
}

const getFixParams = getLintParams;

// // Linting with auto-fixing
// function getFixParams(dir) {
// 	const stdoutFile1 = `{"filePath":"${joinDoubleBackslash(
// 		dir,
// 		"file1.js",
// 	)}","messages":[{"ruleId":"no-warning-comments","severity":1,"message":"Unexpected 'todo' comment: 'TODO: Change something'.","line":5,"column":31,"nodeType":"Line","messageId":"unexpectedComment","endLine":5,"endColumn":56}],"suppressedMessages":[],"errorCount":0,"fatalErrorCount":0,"warningCount":1,"fixableErrorCount":0,"fixableWarningCount":0,"output":"const str = 'world'; // \\"prefer-const\\" warning\\n\\nfunction main() {\\n\\t// \\"no-warning-comments\\" error\\n\\tconsole.log('hello ' + str); // TODO: Change something\\n}\\n\\nmain();\\n","usedDeprecatedRules":[]}`;
// 	const stdoutFile2 = `{"filePath":"${joinDoubleBackslash(
// 		dir,
// 		"file2.js",
// 	)}","messages":[{"ruleId":"no-unused-vars","severity":2,"message":"'str' is assigned a value but never used.","line":1,"column":7,"nodeType":"Identifier","messageId":"unusedVar","endLine":1,"endColumn":10}],"suppressedMessages":[],"errorCount":1,"fatalErrorCount":0,"warningCount":0,"fixableErrorCount":0,"fixableWarningCount":0,"source":"const str = 'Hello world'; // \\"no-unused-vars\\" error\\n","usedDeprecatedRules":[]}`;
// 	return {
// 		// Expected output of the linting function
// 		cmdOutput: {
// 			status: 1,
// 			stdoutParts: [stdoutFile1, stdoutFile2],
// 			stdout: `[${stdoutFile1},${stdoutFile2}]`,
// 		},
// 		// Expected output of the parsing function
// 		lintResult: {
// 			isSuccess: false,
// 			warning: [
// 				{
// 					path: "file1.js",
// 					firstLine: 5,
// 					lastLine: 5,
// 					message: "Unexpected 'todo' comment: 'TODO: Change something' (no-warning-comments)",
// 				},
// 			],
// 			error: [
// 				{
// 					path: "file2.js",
// 					firstLine: 1,
// 					lastLine: 1,
// 					message: "'str' is assigned a value but never used (no-unused-vars)",
// 				},
// 			],
// 		},
// 	};
// }

module.exports = [testName, linter, commandPrefix, extensions, getLintParams, getFixParams];
