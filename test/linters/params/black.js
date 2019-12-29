const Black = require("../../../src/linters/black");
const { TEST_DATE } = require("../../utils");

const testName = "black";
const linter = Black;
const extensions = ["py"];

const getLintResults = dir => {
	const resultsFile1 = `--- file1.py	${TEST_DATE}\n+++ file1.py	${TEST_DATE}\n@@ -1,10 +1,10 @@\n var_1 = "hello"\n var_2 = "world"\n \n \n-def main ():  # Whitespace error\n+def main():  # Whitespace error\n     print("hello " + var_2)\n \n \n def add(num_1, num_2):\n     return num_1 + num_2\n@@ -19,9 +19,10 @@\n \n \n def divide(num_1, num_2):\n     return num_1 / num_2\n \n+\n # Blank lines error\n \n main()`;
	const resultsFile2 = `--- file2.py	${TEST_DATE}\n+++ file2.py	${TEST_DATE}\n@@ -1,3 +1,3 @@\n def add(num_1, num_2):\n-  return num_1 + num_2  # Indentation error\n+    return num_1 + num_2  # Indentation error`;
	return [`${resultsFile1}\n \n${resultsFile2}`, `${resultsFile2}\n \n${resultsFile1}`];
};

const parsedLintResults = [
	[],
	[],
	[
		{
			path: "file1.py",
			firstLine: 1,
			lastLine: 11,
			message: ` var_1 = "hello"\n var_2 = "world"\n \n \n-def main ():  # Whitespace error\n+def main():  # Whitespace error\n     print("hello " + var_2)\n \n \n def add(num_1, num_2):\n     return num_1 + num_2`,
		},
		{
			path: "file1.py",
			firstLine: 19,
			lastLine: 28,
			message: ` \n \n def divide(num_1, num_2):\n     return num_1 / num_2\n \n+\n # Blank lines error\n \n main()\n `,
		},
		{
			path: "file2.py",
			firstLine: 1,
			lastLine: 4,
			message: ` def add(num_1, num_2):\n-  return num_1 + num_2  # Indentation error\n+    return num_1 + num_2  # Indentation error`,
		},
	],
];

const getFixResults = dir => "";

const parsedFixResults = [[], [], []];

module.exports = [
	testName,
	linter,
	extensions,
	getLintResults,
	getFixResults,
	parsedLintResults,
	parsedFixResults,
];
