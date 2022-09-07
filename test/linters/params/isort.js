const path = require("path");

const Isort = require("../../../src/linters/isort");
const { TEST_DATE } = require("../../test-utils");

const testName = "isort";
const linter = Isort;
const commandPrefix = "";
const extensions = ["py"];

// Linting without auto-fixing
function getLintParams(dir) {
	const stdoutFile1 = `--- ${path.join(dir, "file1.py")}:before\t${TEST_DATE}\n+++ ${path.join(
		dir,
		"file1.py",
	)}:after\t${TEST_DATE}\n@@ -1,5 +1,5 @@\n-from copy import deepcopy # Sort error\n-from argparse import ArgumentParser # Sort error\n+from argparse import ArgumentParser  # Sort error\n+from copy import deepcopy  # Sort error\n \n \n def main ():\n`;
	const stdoutFile2 = `--- ${path.join(dir, "file2.py")}:before\t${TEST_DATE}\n+++ ${path.join(
		dir,
		"file2.py",
	)}:after\t${TEST_DATE}\n@@ -1,6 +1,6 @@\n-from copy import deepcopy # Sort error\n-from math import pi # Sort error\n-from argparse import ArgumentParser # Sort error\n+from argparse import ArgumentParser  # Sort error\n+from copy import deepcopy  # Sort error\n+from math import pi  # Sort error\n \n \n def main ():\n`;
	return {
		// Expected output of the linting function
		cmdOutput: {
			status: 1,
			stdoutParts: [stdoutFile1, stdoutFile2],
			stdout: `${stdoutFile1}\n \n${stdoutFile2}`,
		},
		// Expected output of the parsing function
		lintResult: {
			isSuccess: false,
			warning: [],
			error: [
				{
					path: path.join(dir, "file1.py:after"),
					firstLine: 1,
					lastLine: 6,
					message:
						"-from copy import deepcopy # Sort error\n-from argparse import ArgumentParser # Sort error\n+from argparse import ArgumentParser  # Sort error\n+from copy import deepcopy  # Sort error\n \n \n def main ():",
				},
				{
					path: path.join(dir, "file2.py:after"),
					firstLine: 1,
					lastLine: 7,
					message:
						"-from copy import deepcopy # Sort error\n-from math import pi # Sort error\n-from argparse import ArgumentParser # Sort error\n+from argparse import ArgumentParser  # Sort error\n+from copy import deepcopy  # Sort error\n+from math import pi  # Sort error\n \n \n def main ():",
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
			stdout: `Fixing ${path.join(dir, "file2.py")}\nFixing ${path.join(
				dir,
				"file1.py",
			)}\nBroken 1 paths`,
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
