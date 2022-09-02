const PHPStan = require("../../../src/linters/php-stan");

const testName = "php-stan";
const linter = PHPStan;
const commandPrefix = "";
const extensions = ["php"];

// Linting without auto-fixing
function getLintParams(dir) {
	const stdoutFile1 = `"file1.php":{"errors":0,"warnings":1,"messages":[{"message":"A file should declare new symbols (classes, functions, constants, etc.) and cause no other side effects, or it should execute logic with side effects, but should not do both. The first symbol is defined on line 3 and the first side effect is on line 8.","source":"PSR1.Files.SideEffects.FoundWithSymbols","severity":5,"fixable":false,"type":"WARNING","line":1,"column":1}]}`;
	const stdoutFile2 = `"file2.php":{"errors":2,"warnings":0,"messages":[{"message":"Opening brace of a class must be on the line after the definition","source":"PSR2.Classes.ClassDeclaration.OpenBraceNewLine","severity":5,"fixable":true,"type":"ERROR","line":5,"column":17},{"message":"A closing tag is not permitted at the end of a PHP file","source":"PSR2.Files.ClosingTag.NotAllowed","severity":5,"fixable":true,"type":"ERROR","line":10,"column":1}]}`;
	// Files on macOS are not sorted.
	const stdout =
		process.platform === "darwin"
			? `{"totals":{"errors":2,"warnings":1,"fixable":2},"files":{${stdoutFile2},${stdoutFile1}}}`
			: `{"totals":{"errors":2,"warnings":1,"fixable":2},"files":{${stdoutFile1},${stdoutFile2}}}`;
	return {
		// Expected output of the linting function
		cmdOutput: {
			// PHP_CodeSniffer exit codes:
			// - 0: No errors found.
			// - 1: Errors found, but none of them can be fixed by PHPCBF.
			// - 2: Errors found, and some can be fixed by PHPCBF.
			status: 2,
			stdoutParts: [stdoutFile1, stdoutFile2],
			stdout,
		},
		// Expected output of the parsing function
		lintResult: {
			isSuccess: false,
			warning: [
				{
					path: "file1.php",
					firstLine: 1,
					lastLine: 1,
					message:
						"A file should declare new symbols (classes, functions, constants, etc.) and cause no other side effects, or it should execute logic with side effects, but should not do both. The first symbol is defined on line 3 and the first side effect is on line 8 (PSR1.Files.SideEffects.FoundWithSymbols)",
				},
			],
			error: [
				{
					path: "file2.php",
					firstLine: 5,
					lastLine: 5,
					message:
						"Opening brace of a class must be on the line after the definition (PSR2.Classes.ClassDeclaration.OpenBraceNewLine)",
				},
				{
					path: "file2.php",
					firstLine: 10,
					lastLine: 10,
					message:
						"A closing tag is not permitted at the end of a PHP file (PSR2.Files.ClosingTag.NotAllowed)",
				},
			],
		},
	};
}

// Linting with auto-fixing
const getFixParams = getLintParams; // Does not support auto-fixing -> option has no effect

module.exports = [testName, linter, commandPrefix, extensions, getLintParams, getFixParams];
