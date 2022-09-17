const ClangFormat = require("../../../src/linters/clang-format");

const testName = "clang-format";
const linter = ClangFormat;
const commandPrefix = "";
const extensions = ["c", "mm"];

// Linting without auto-fixing
function getLintParams(dir) {
	const stderrFile1 = `file1.c:1:1: error: code should be clang-formatted [-Wclang-format-violations]
        #include <stdio.h>
^^^^^^^^`;
	const stderrFile2 = `file2.mm:1:26: error: code should be clang-formatted [-Wclang-format-violations]
@interface Foo : NSObject @end
                         ^`;
	return {
		// Expected output of the linting function
		cmdOutput: {
			status: 1,
			stderrParts: [stderrFile1, stderrFile2],
			stderr: `${stderrFile1}\n${stderrFile2}`,
		},
		// Expected output of the parsing function
		lintResult: {
			isSuccess: false,
			warning: [],
			error: [
				{
					path: "file1.c",
					firstLine: 1,
					lastLine: 1,
					message: "code should be clang-formatted [-Wclang-format-violations]",
				},
				{
					path: "file2.mm",
					firstLine: 1,
					lastLine: 1,
					message: "code should be clang-formatted [-Wclang-format-violations]",
				},
			],
		},
	};
}

// Linting with auto-fixing
function getFixParams(dir) {
	return {
		// Expected output of the linting function
		cmdOutput: {
			status: 0,
			stderrParts: [],
		},
		// Expected output of the parsing function
		lintResult: {
			isSuccess: true,
			warning: [],
			error: [],
		},
	};
}

module.exports = [testName, linter, commandPrefix, extensions, getLintParams, getFixParams];
