const { sep } = require("path");

const Isort = require("../../../src/linters/isort");

const testName = "isort";
const linter = Isort;
const commandPrefix = "";
const args = "";
const extensions = ["py"];

// Linting without auto-fixing
function getLintParams(dir) {
	const message =
		"-from my_lib import Object\n" +
		"+from __future__ import absolute_import\n" +
		" \n" +
		" import os\n" +
		"-\n" +
		"-from my_lib import Object3\n" +
		"-\n" +
		"-from my_lib import Object2\n" +
		"-\n" +
		" import sys\n" +
		" \n" +
		"-from third_party import lib15, lib1, lib2, lib3, lib4, lib5, lib6, lib7, lib8, lib9, lib10, lib11, lib12, lib13, lib14\n" +
		"-\n" +
		"-import sys\n" +
		"-\n" +
		"-from __future__ import absolute_import\n" +
		"-\n" +
		"-from third_party import lib3\n" +
		"+from my_lib import Object, Object2, Object3\n" +
		"+from third_party import (lib1, lib2, lib3, lib4, lib5, lib6, lib7, lib8, lib9,\n" +
		"+                         lib10, lib11, lib12, lib13, lib14, lib15)\n" +
		" \n" +
		' print("Hey")\n' +
		' print("yo")';

	// isort prints a unified diff with `<path>:before`/`<path>:after` headers. The header timestamps
	// have no timezone (so they are not normalized) and contain the absolute path, so the exit code
	// and a few diff lines are matched instead of the whole stdout. The full diff is provided for the
	// parsing function
	const stdout = `--- ${dir}${sep}file1.py:before\t2019-01-01 00:00:00.000000\n+++ ${dir}${sep}file1.py:after\t2019-01-01 00:00:00.000000\n@@ -1,20 +1,11 @@\n${message}`;

	return {
		// Expected output of the linting function
		cmdOutput: {
			status: 1,
			stdoutParts: ["-from my_lib import Object", "+from my_lib import Object, Object2, Object3"],
			stdout,
		},
		// Expected output of the parsing function
		lintResult: {
			isSuccess: false,
			warning: [],
			error: [
				{
					path: "file1.py",
					firstLine: 1,
					lastLine: 21,
					message,
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
