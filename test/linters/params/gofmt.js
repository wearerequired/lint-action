const Gofmt = require("../../../src/linters/gofmt");
const { TEST_DATE } = require("../../utils");

const testName = "gofmt";
const linter = Gofmt;
const extensions = ["go"];

// Testing input/output for the Linter.lint function, with auto-fixing disabled
function getLintParams(dir) {
	const resultsFile1 = `diff -u file1.go.orig file1.go\n--- file1.go.orig	${TEST_DATE}\n+++ file1.go	${TEST_DATE}\n@@ -4,7 +4,7 @@\n \n var str = "world"\n \n-func main () { // Whitespace error\n+func main() { // Whitespace error\n 	fmt.Println("hello " + str)\n }\n \n@@ -17,5 +17,5 @@\n }\n \n func multiply(num1 int, num2 int) int {\n-  return num1 * num2 // Indentation error\n+	return num1 * num2 // Indentation error\n }`;
	const resultsFile2 = `diff -u file2.go.orig file2.go\n--- file2.go.orig	${TEST_DATE}\n+++ file2.go	${TEST_DATE}\n@@ -1,5 +1,5 @@\n package main\n \n func divide(num1 int, num2 int) int {\n-	return num1 /  num2 // Whitespace error\n+	return num1 / num2 // Whitespace error\n }`;
	return {
		// Strings that must be contained in the stdout of the lint command
		stdoutParts: [resultsFile1, resultsFile2],
		// Example output of the lint command, used to test the parsing function
		parseInput: `${resultsFile1}\n${resultsFile2}`,
		// Expected output of the parsing function
		parseResult: [
			[],
			[],
			[
				{
					path: "file1.go",
					firstLine: 4,
					lastLine: 11,
					message: ` \n var str = "world"\n \n-func main () { // Whitespace error\n+func main() { // Whitespace error\n \tfmt.Println("hello " + str)\n }\n `,
				},
				{
					path: "file1.go",
					firstLine: 17,
					lastLine: 22,
					message: ` }\n \n func multiply(num1 int, num2 int) int {\n-  return num1 * num2 // Indentation error\n+\treturn num1 * num2 // Indentation error\n }`,
				},
				{
					path: "file2.go",
					firstLine: 1,
					lastLine: 6,
					message: ` package main\n \n func divide(num1 int, num2 int) int {\n-\treturn num1 /  num2 // Whitespace error\n+\treturn num1 / num2 // Whitespace error\n }`,
				},
			],
		],
	};
}

// Testing input/output for the Linter.lint function, with auto-fixing enabled
function getFixParams(dir) {
	return {
		// stdout of the lint command
		stdout: "",
		// Example output of the lint command, used to test the parsing function
		parseInput: "",
		// Expected output of the parsing function
		parseResult: [[], [], []],
	};
}

module.exports = [testName, linter, extensions, getLintParams, getFixParams];
