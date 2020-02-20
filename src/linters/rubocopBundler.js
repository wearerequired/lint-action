const Rubocop = require("./rubocop");
const commandExists = require("../../vendor/command-exists");
const { run } = require("../utils/action");

class RubocopBundler extends Rubocop {

	/**
	 * Verifies that all required programs are installed. Throws an error if programs are missing
	 * @param {string} dir - Directory to run the linting program in
	 */
	static async verifySetup(dir) {
		// Verify that Ruby is installed (required to execute RuboCop)
		if (!(await commandExists("ruby"))) {
			throw new Error("Ruby is not installed");
		}
	}

	/**
	 * Runs the linting program and returns the command output
	 * @param {string} dir - Directory to run the linter in
	 * @param {string[]} extensions - File extensions which should be linted
	 * @param {string} args - Additional arguments to pass to the linter
	 * @param {boolean} fix - Whether the linter should attempt to fix code style issues automatically
	 * @returns {{status: number, stdout: string, stderr: string}} - Output of the lint command
	 */
	static lint(dir, extensions, args = "", fix = false) {
		if (extensions.length !== 1 || extensions[0] !== "rb") {
			throw new Error(`${this.name} error: File extensions are not configurable`);
		}

		const fixArg = fix ? "--auto-correct" : "";
		return run(`bundle exec rubocop --format json ${fixArg} ${args}`, {
			dir,
			ignoreErrors: true,
		});
	}
}

module.exports = RubocopBundler;
