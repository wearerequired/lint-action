const { join } = require("path");
const Black = require("../../src/linters/black");

// Path to Black test project
const blackProject = join(__dirname, "projects", "black");

// Expected linting results from test project
const testDate = "2019-01-01 00:00:00.000000 +0000";
const testResultsMain = `--- main.py	${testDate}\n+++ main.py	${testDate}\n@@ -1,10 +1,10 @@\n var_1 = "hello"\n var_2 = "world"\n \n \n-def main ():  # Whitespace error\n+def main():  # Whitespace error\n     print("hello " + var_2)\n \n \n def add(num_1, num_2):\n     return num_1 + num_2\n@@ -19,9 +19,10 @@\n \n \n def divide(num_1, num_2):\n     return num_1 / num_2\n \n+\n # Blank lines error\n \n main()`;
const testResultsUtils = `--- utils.py	${testDate}\n+++ utils.py	${testDate}\n@@ -1,3 +1,3 @@\n def add(num_1, num_2):\n-  return num_1 + num_2  # Indentation error\n+    return num_1 + num_2  # Indentation error`;
const testResultsOrder1 = `${testResultsMain}\n \n${testResultsUtils}`;
const testResultsOrder2 = `${testResultsUtils}\n \n${testResultsMain}`;
const testResultsParsed = [
	[],
	[],
	[
		{
			path: "main.py",
			firstLine: 1,
			lastLine: 11,
			message: ` var_1 = "hello"\n var_2 = "world"\n \n \n-def main ():  # Whitespace error\n+def main():  # Whitespace error\n     print("hello " + var_2)\n \n \n def add(num_1, num_2):\n     return num_1 + num_2`,
		},
		{
			path: "main.py",
			firstLine: 19,
			lastLine: 28,
			message: ` \n \n def divide(num_1, num_2):\n     return num_1 / num_2\n \n+\n # Blank lines error\n \n main()\n `,
		},
		{
			path: "utils.py",
			firstLine: 1,
			lastLine: 4,
			message: ` def add(num_1, num_2):\n-  return num_1 + num_2  # Indentation error\n+    return num_1 + num_2  # Indentation error`,
		},
	],
];

test("should return correct linting results", () => {
	const results = Black.lint(blackProject, ["py"]);
	const resultsNormalized = results.replace(
		/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}.\d{6} \+\d{4}/g,
		testDate,
	);
	expect([testResultsOrder1, testResultsOrder2]).toContain(resultsNormalized);
});

test("should parse linting results correctly", () => {
	const resultsParsed = Black.parseResults(blackProject, testResultsOrder1);
	expect(resultsParsed).toEqual(testResultsParsed);
});
