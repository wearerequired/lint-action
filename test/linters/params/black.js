const { EOL } = require("os");
const { join } = require("path");

const Black = require("../../../src/linters/black");
const { TEST_DATE } = require("../../test-utils");

const testName = "black";
const linter = Black;
const args = "";
const commandPrefix = "";
const extensions = ["py"];

// Linting without auto-fixing
function getLintParams(dir) {
	const absolutePathFile1 = join(dir, "file1.py");
	const stdoutFile1 = `--- ${absolutePathFile1}	${TEST_DATE}\n+++ ${absolutePathFile1}	${TEST_DATE}\n@@ -1,10 +1,10 @@\n var_1 = "hello"\n var_2 = "world"\n \n \n-def main ():  # Whitespace error\n+def main():  # Whitespace error\n     print("hello " + var_2)\n \n \n def add(num_1, num_2):\n     return num_1 + num_2\n@@ -19,8 +19,9 @@\n \n \n def divide(num_1, num_2):\n     return num_1 / num_2\n \n+\n # Blank lines error\n \n main()`;
	const absolutePathFile2 = join(dir, "file2.py");
	const stdoutFile2 = `--- ${absolutePathFile2}	${TEST_DATE}\n+++ ${absolutePathFile2}	${TEST_DATE}\n@@ -1,2 +1,2 @@\n def add(num_1, num_2):\n-  return num_1 + num_2  # Indentation error\n+    return num_1 + num_2  # Indentation error`;
	return {
		// Expected output of the linting function
		cmdOutput: {
			status: 1,
			stdoutParts: [stdoutFile2, stdoutFile1],
			stdout: `${stdoutFile2}${EOL}${stdoutFile1}`,
		},
		// Expected output of the parsing function
		lintResult: {
			isSuccess: false,
			warning: [],
			error: [
				{
					path: absolutePathFile2,
					firstLine: 1,
					lastLine: 3,
					message: ` def add(num_1, num_2):\n-  return num_1 + num_2  # Indentation error\n+    return num_1 + num_2  # Indentation error`,
				},
				{
					path: absolutePathFile1,
					firstLine: 1,
					lastLine: 11,
					message: ` var_1 = "hello"\n var_2 = "world"\n \n \n-def main ():  # Whitespace error\n+def main():  # Whitespace error\n     print("hello " + var_2)\n \n \n def add(num_1, num_2):\n     return num_1 + num_2`,
				},
				{
					path: absolutePathFile1,
					firstLine: 19,
					lastLine: 27,
					message: ` \n \n def divide(num_1, num_2):\n     return num_1 / num_2\n \n+\n # Blank lines error\n \n main()`,
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
			stdout: "",
		},
		// Expected output of the parsing function
		lintResult: {
			isSuccess: true,
			warning: [],
			error: [],
		},
	};
}

module.exports = [testName, linter, commandPrefix, extensions, args, getLintParams, getFixParams];
