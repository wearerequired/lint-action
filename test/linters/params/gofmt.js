const Gofmt = require("../../../src/linters/gofmt");

const testName = "gofmt";
const linter = Gofmt;
const args = "";
const commandPrefix = "";
const extensions = ["go"];

// Linting without auto-fixing
function getLintParams(dir) {
	const stdoutFile1 = `diff file1.go.orig file1.go\n--- file1.go.orig\n+++ file1.go\n@@ -4,7 +4,7 @@\n \n var str = "world"\n \n-func main () { // Whitespace error\n+func main() { // Whitespace error\n 	fmt.Println("hello " + str)\n }\n \n@@ -17,5 +17,5 @@\n }\n \n func multiply(num1 int, num2 int) int {\n-  return num1 * num2 // Indentation error\n+	return num1 * num2 // Indentation error\n }`;
	const stdoutFile2 = `diff file2.go.orig file2.go\n--- file2.go.orig\n+++ file2.go\n@@ -1,5 +1,5 @@\n package main\n \n func divide(num1 int, num2 int) int {\n-	return num1 /  num2 // Whitespace error\n+	return num1 / num2 // Whitespace error\n }`;
	return {
		// Expected output of the linting function
		cmdOutput: {
			status: 0, // gofmt always uses exit code 0
			stdoutParts: [stdoutFile1, stdoutFile2],
			stdout: `${stdoutFile1}\n${stdoutFile2}`,
		},
		// Expected output of the parsing function
		lintResult: {
			isSuccess: false,
			warning: [],
			error: [
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
		},
	};
}

// Linting with auto-fixing
function getFixParams(dir) {
	return {
		// Expected output of the linting function
		cmdOutput: {
			status: 0, // gofmt always uses exit code 0
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
