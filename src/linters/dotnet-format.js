const { run } = require("../utils/action");
const commandExists = require("../utils/command-exists");
const { parseErrorsFromDiff } = require("../utils/diff");
const { initLintResult } = require("../utils/lint-result");

class DotNetFormat {
    static get name() {
		return "dotnet-format";
	}

    /**
	 * Verifies that all required programs are installed. Throws an error if programs are missing
	 * @param {string} dir - Directory to run the linting program in
	 * @param {string} prefix - Prefix to the lint command
	 */
	static async verifySetup(dir, prefix = "") {
		// Verify that dotnet-format is installed
		if (!(await commandExists("dotnet format"))) {
			throw new Error(`${this.name} is not installed`);
		}
	}
}