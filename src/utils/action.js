const { execSync } = require("child_process");

const RUN_OPTIONS_DEFAULTS = { dir: null, ignoreErrors: false };

/**
 * Logs to the console
 *
 * @param msg {string}: Text to log to the console
 * @param level {"info" | "warning" | "error"}: Log level
 */
function log(msg, level = "info") {
	switch (level) {
		case "error":
			console.error(msg);
			break;
		case "warning":
			console.warn(msg); // eslint-disable-line no-console
			break;
		default:
			console.log(msg); // eslint-disable-line no-console
	}
}

/**
 * Returns the value for an environment variable. If the variable is required but doesn't have a
 * value, an error is thrown
 *
 * @param name {string}: Name of the environment variable
 * @param required {boolean}: Whether an error should be thrown if the variable doesn't have a value
 * @returns {string | null}: Value of the environment variable
 */
function getEnv(name, required = false) {
	const nameUppercase = name.toUpperCase();
	const value = process.env[nameUppercase];
	if (value == null) {
		// Value is either not set (`undefined`) or set to `null`
		if (required) {
			throw new Error(`Environment variable "${nameUppercase}" is not defined`);
		}
		return null;
	}
	return value;
}

/**
 * Returns the value for an input variable. If the variable is required but doesn't have a value,
 * an error is thrown
 *
 * @param name {string}: Name of the input variable
 * @param required {boolean}: Whether an error should be thrown if the variable doesn't have a value
 * @returns {string | null}: Value of the input variable
 */
function getInput(name, required = false) {
	return getEnv(`INPUT_${name}`, required);
}

/**
 * Executes the provided shell command
 *
 * @param cmd {string}: Shell command to execute
 * @param [options] {{dir: string, ignoreErrors: boolean}}: {@see RUN_OPTIONS_DEFAULTS}
 * @returns {{status: number, stdout: string, stderr: string}}: Output of the shell command
 */
function run(cmd, options) {
	const optionsWithDefaults = {
		...RUN_OPTIONS_DEFAULTS,
		...options,
	};

	try {
		const output = execSync(cmd, { encoding: "utf8", cwd: optionsWithDefaults.dir });
		return {
			status: 0,
			stdout: output.trim(),
			stderr: "",
		};
	} catch (err) {
		if (optionsWithDefaults.ignoreErrors) {
			return {
				status: err.status,
				stdout: err.stdout.trim(),
				stderr: err.stderr.trim(),
			};
		}
		throw err;
	}
}

module.exports = {
	log,
	getEnv,
	getInput,
	run,
};
