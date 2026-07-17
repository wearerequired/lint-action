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
	// Black 23.10+ reports absolute paths in the diff headers
	const file1 = join(dir, "file1.py");
	const file2 = join(dir, "file2.py");
	const stdoutFile1 = `--- ${file1}	${TEST_DATE}\n+++ ${file1}	${TEST_DATE}\n@@ -1,10 +1,10 @@\n var_1 = "hello"\n var_2 = "world"\n \n \n-def main ():  # Whitespace error\n+def main():  # Whitespace error\n     print("hello " + var_2)\n \n \n def add(num_1, num_2):\n     return num_1 + num_2\n@@ -19,8 +19,9 @@\n \n \n def divide(num_1, num_2):\n     return num_1 / num_2\n \n+\n # Blank lines error\n \n main()`;
	const stdoutFile2 = `--- ${file2}	${TEST_DATE}\n+++ ${file2}	${TEST_DATE}\n@@ -1,2 +1,2 @@\n def add(num_1, num_2):\n-  return num_1 + num_2  # Indentation error\n+    return num_1 + num_2  # Indentation error`;
	return {
		// Expected output of the linting function
		cmdOutput: {
			status: 1,
			stdoutParts: [stdoutFile1, stdoutFile2],
			stdout: `${stdoutFile1}\n${stdoutFile2}`,
		},
		// Expected output of the parsing function
		lintResult: {
			isSuccess: false,
			warning: [],
			error: [
				{
					path: "file1.py",
					firstLine: 1,
					lastLine: 11,
					message: ` var_1 = "hello"\n var_2 = "world"\n \n \n-def main ():  # Whitespace error\n+def main():  # Whitespace error\n     print("hello " + var_2)\n \n \n def add(num_1, num_2):\n     return num_1 + num_2`,
				},
				{
					path: "file1.py",
					firstLine: 19,
					lastLine: 27,
					message: ` \n \n def divide(num_1, num_2):\n     return num_1 / num_2\n \n+\n # Blank lines error\n \n main()`,
				},
				{
					path: "file2.py",
					firstLine: 1,
					lastLine: 3,
					message: ` def add(num_1, num_2):\n-  return num_1 + num_2  # Indentation error\n+    return num_1 + num_2  # Indentation error`,
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
