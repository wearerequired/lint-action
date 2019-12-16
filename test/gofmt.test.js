const { join } = require("path");
const Gofmt = require("../src/linters/gofmt");

// Path to gofmt test project
const gofmtProject = join(__dirname, "projects", "gofmt");

// Expected linting results from test project
const testDate = "2019-01-01 00:00:00.000000000 +0000";
const testResultsMain = `diff -u main.go.orig main.go\n--- main.go.orig	${testDate}\n+++ main.go	${testDate}\n@@ -4,7 +4,7 @@\n \n var str = "world"\n \n-func main () { // Whitespace error\n+func main() { // Whitespace error\n 	fmt.Println("hello " + str)\n }\n \n@@ -17,5 +17,5 @@\n }\n \n func multiply(num1 int, num2 int) int {\n-  return num1 * num2 // Indentation error\n+	return num1 * num2 // Indentation error\n }`;
const testResultsUtils = `diff -u utils.go.orig utils.go\n--- utils.go.orig	${testDate}\n+++ utils.go	${testDate}\n@@ -1,5 +1,5 @@\n package main\n \n func divide(num1 int, num2 int) int {\n-	return num1 /  num2 // Whitespace error\n+	return num1 / num2 // Whitespace error\n }`;
const testResultsOrder1 = `${testResultsMain}\n${testResultsUtils}`;
const testResultsOrder2 = `${testResultsUtils}\n${testResultsMain}`;
const testResultsParsed = [
	[],
	[],
	[
		{
			path: "main.go",
			firstLine: 4,
			lastLine: 11,
			message: ` \n var str = "world"\n \n-func main () { // Whitespace error\n+func main() { // Whitespace error\n \tfmt.Println("hello " + str)\n }\n `,
		},
		{
			path: "main.go",
			firstLine: 17,
			lastLine: 22,
			message: ` }\n \n func multiply(num1 int, num2 int) int {\n-  return num1 * num2 // Indentation error\n+\treturn num1 * num2 // Indentation error\n }`,
		},
		{
			path: "utils.go",
			firstLine: 1,
			lastLine: 6,
			message: ` package main\n \n func divide(num1 int, num2 int) int {\n-\treturn num1 /  num2 // Whitespace error\n+\treturn num1 / num2 // Whitespace error\n }`,
		},
	],
];

test("should return correct linting results", () => {
	const results = Gofmt.lint(gofmtProject, ["go"]);
	const resultsNormalized = results.replace(
		/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}.\d{9} \+\d{4}/g,
		testDate,
	);
	expect([testResultsOrder1, testResultsOrder2]).toContain(resultsNormalized);
});

test("should parse linting results correctly", () => {
	const resultsParsed = Gofmt.parseResults(gofmtProject, testResultsOrder1);
	expect(resultsParsed).toEqual(testResultsParsed);
});
