const DenoLint = require("../../../src/linters/deno-lint");
const { joinDoubleBackslash } = require("../../test-utils");

const testName = "deno-lint";
const linter = DenoLint;
const args = "";
const commandPrefex = "";
const extensions = ["*"];

// Linting without auto-fixing
function getLintParams(dir) {
	const stdoutStr = `{
  "diagnostics": [
    {
      "range": {
        "start": {
          "line": 1,
          "col": 31,
          "bytePos": 31
        },
        "end": {
          "line": 1,
          "col": 35,
          "bytePos": 35
        }
      },
      "filename": "${joinDoubleBackslash(dir, "file.ts")}",
      "message": "\`arg1\` is never used",
      "code": "no-unused-vars",
      "hint": "If this is intentional, prefix it with an underscore like \`_arg1\`"
    }
  ],
  "errors": []
}`;
	return {
		// Expected output of the linting function
		cmdOutput: {
			status: 1,
			stdOutParts: stdoutStr,
			stdout: stdoutStr,
		},
		// Expected output of the parsing function
		lintResult: {
			isSuccess: false,
			warning: [
				{
					firstLine: 1,
					lastLine: 1,
					message:
						"`arg1` is never used (no-unused-vars, If this is intentional, prefix it with an underscore like `_arg1`)",
					path: "file.ts",
				},
			],
			error: [],
		},
	};
}

// Linting with auto-fixing
const getFixParams = getLintParams; // Does not support auto-fixing -> option has no effect

module.exports = [testName, linter, commandPrefex, extensions, args, getLintParams, getFixParams];
