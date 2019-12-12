const { execSync } = require("child_process");

const RUN_OPTIONS_DEFAULTS = { dir: null, ignoreErrors: false };

/**
 * Logs to the console
 */
function log(msg) {
	console.log(`\n${msg}`); // eslint-disable-line no-console
}

/**
 * Exits the current process with an error code and message
 */
function exit(msg) {
	console.error(msg);
	process.exit(1);
}

/**
 * Returns the value for an environment variable (or `null` if it's not defined)
 */
function getEnv(name) {
	return process.env[name.toUpperCase()] || null;
}

/**
 * Returns the value for an input variable (or `null` if it's not defined). If the variable is
 * required and doesn't have a value, abort the action
 */
function getInput(name, required) {
	const value = getEnv(`INPUT_${name}`);
	if (required && !value) {
		exit(`"${name}" input variable is not defined`);
	}
	return value;
}

/**
 * Executes the provided shell command
 */
function run(cmd, options = null) {
	const optionsWithDefaults = {
		...RUN_OPTIONS_DEFAULTS,
		...options,
	};

	try {
		const output = execSync(cmd, { encoding: "utf8", cwd: optionsWithDefaults.dir });
		return {
			status: 0,
			stdout: output,
			stderr: "",
		};
	} catch (err) {
		if (optionsWithDefaults.ignoreErrors) {
			return {
				status: err.status,
				stdout: err.stdout,
				stderr: err.stderr,
			};
		}
		throw err;
	}
}

module.exports = {
	log,
	exit,
	getEnv,
	getInput,
	run,
};
