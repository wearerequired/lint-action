const { execSync, spawnSync } = require("child_process");

const core = require("@actions/core");

const RUN_OPTIONS_DEFAULTS = { dir: null, ignoreErrors: false, prefix: "" };
const EXECUTE_OPTIONS_DEFAULTS = { dir: null, ignoreErrors: false };

/**
 * Returns the value for an environment variable. If the variable is required but doesn't have a
 * value, an error is thrown
 * @param {string} name - Name of the environment variable
 * @param {boolean} required - Whether an error should be thrown if the variable doesn't have a
 * value
 * @returns {string | null} - Value of the environment variable
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
 * Executes the provided shell command
 * @param {string} cmd - Shell command to execute
 * @param {{dir: string, ignoreErrors: boolean}} [options] - {@see RUN_OPTIONS_DEFAULTS}
 * @returns {{status: number, stdout: string, stderr: string}} - Output of the shell command
 */
function run(cmd, options) {
	const optionsWithDefaults = {
		...RUN_OPTIONS_DEFAULTS,
		...options,
	};

	core.debug(cmd);

	try {
		const stdout = execSync(cmd, {
			encoding: "utf8",
			cwd: optionsWithDefaults.dir,
			maxBuffer: 20 * 1024 * 1024,
		});
		const output = {
			status: 0,
			stdout: stdout.trim(),
			stderr: "",
		};

		core.debug(`Stdout: ${output.stdout}`);

		return output;
	} catch (err) {
		if (optionsWithDefaults.ignoreErrors) {
			const output = {
				status: err.status,
				stdout: err.stdout.trim(),
				stderr: err.stderr.trim(),
			};

			core.debug(`Exit code: ${output.status}`);
			core.debug(`Stdout: ${output.stdout}`);
			core.debug(`Stderr: ${output.stderr}`);

			return output;
		}
		throw err;
	}
}

/**
 * Executes the provided binary with the given arguments.
 * @param {string} command - binary to execute
 * @param {{dir: string, ignoreErrors: boolean}} [options] - {@see EXECUTE_OPTIONS_DEFAULTS}
 * @returns {{status: number, stdout: string, stderr: string}} - Output of the command
 */
function execute(command, args, options) {
	const optionsWithDefaults = {
		...EXECUTE_OPTIONS_DEFAULTS,
		...options,
	};

	core.debug(`${command} ${args.filter(e => e).join(" ")}`);

	const process = spawnSync(command, args.filter(e => e), {
		cwd: optionsWithDefaults.dir,
		encoding: "utf-8",
		maxBuffer: 20 * 1024 * 1024,
	});

	const output = {
		status: process.status,
		stdout: process.stdout.trim(),
		stderr: process.stderr.trim(),
	};

	core.debug(`Exit code: ${output.status}`);
	core.debug(`Stdout: ${output.stdout}`);
	core.debug(`Stderr: ${output.stderr}`);

	if (!optionsWithDefaults.ignoreErrors && child.status != 0) {
		throw child.error;
	}
	return output;
}

module.exports = {
	execute,
	getEnv,
	run,
};
