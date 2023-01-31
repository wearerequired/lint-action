const { EOL } = require("os");
const { join } = require("path");

const DotnetFormat = require("../../../src/linters/dotnet-format");

const testName = "dotnet-format";
const linter = DotnetFormat;
const args = "";
const commandPrefix = "";
const extensions = ["cs"];

// Linting without auto-fixing
function getLintParams(dir) {
	const stderrPart1 = `${join(
		dir,
		"file2.cs",
	)}(20,31): error WHITESPACE: Fix whitespace formatting. Delete 1 characters. [${join(
		dir,
		"dotnet-format.csproj",
	)}`;
	const stderrPart2 = `${join(dir, "file2.cs")}(1,1): error IMPORTS: Fix imports ordering. [${join(
		dir,
		"dotnet-format.csproj",
	)}`;
	const stderrPart3 = `${join(
		dir,
		"file1.cs",
	)}(1,1): warning IDE0073: A source file is missing a required header. [${join(
		dir,
		"dotnet-format.csproj",
	)}`;
	return {
		// Expected output of the linting function
		cmdOutput: {
			status: 2,
			stderrParts: [stderrPart1, stderrPart2, stderrPart3],
			stderr: `${stderrPart1}${EOL}${stderrPart2}${EOL}${stderrPart3}`,
		},
		// Expected output of the parsing function
		lintResult: {
			isSuccess: false,
			warning: [
				{
					path: "file1.cs",
					firstLine: 1,
					lastLine: 1,
					message: `IDE0073: A source file is missing a required header.`,
				},
			],
			error: [
				{
					path: "file2.cs",
					firstLine: 20,
					lastLine: 20,
					message: `WHITESPACE: Fix whitespace formatting. Delete 1 characters.`,
				},
				{
					path: "file2.cs",
					firstLine: 1,
					lastLine: 1,
					message: `IMPORTS: Fix imports ordering.`,
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
			stderr: ``,
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
