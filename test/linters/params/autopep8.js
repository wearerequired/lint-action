const Autopep8 = require("../../../src/linters/autopep8");

const testName = "autopep8";
const linter = Autopep8;
const commandPrefix = "";
const args = "";
const extensions = ["py"];

// Linting without auto-fixing
function getLintParams(dir) {
	const stdoutFile1 = `--- file1.py\n+++ file1.py\n@@ -2,7 +2,7 @@\n var_2 = "world"\n \n \n-def main ():  # Whitespace error\n+def main():  # Whitespace error\n     print("hello " + var_2)\n \n \n@@ -23,4 +23,5 @@\n \n # Blank lines error\n \n+\n main()`;
	const stdoutFile2 = `--- file2.py\n+++ file2.py\n@@ -1,2 +1,2 @@\n def add(num_1, num_2):\n-  return num_1 + num_2  # Indentation error\n+    return num_1 + num_2  # Indentation error`;
	return {
		// Expected output of the linting function
		cmdOutput: {
			status: 2,
			stdoutParts: [stdoutFile1, stdoutFile2],
			stdout: `${stdoutFile1}\n \n${stdoutFile2}`,
		},
		// Expected output of the parsing function
		lintResult: {
			isSuccess: false,
			warning: [],
			error: [
				{
					path: "file1.py",
					firstLine: 2,
					lastLine: 9,
					message: ` var_2 = "world"\n \n \n-def main ():  # Whitespace error\n+def main():  # Whitespace error\n     print("hello " + var_2)\n \n `,
				},
				{
					path: "file1.py",
					firstLine: 23,
					lastLine: 27,
					message: ` \n # Blank lines error\n \n+\n main()`,
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
