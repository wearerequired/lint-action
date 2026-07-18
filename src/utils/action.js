const { execSync, spawnSync } = require("child_process");

const core = require("@actions/core");

const RUN_OPTIONS_DEFAULTS = { dir: null, ignoreErrors: false, prefix: "", captureStderr: false };

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
 * @param {object} [options] - Command options, see {@link RUN_OPTIONS_DEFAULTS}
 * @returns {{status: number, stdout: string, stderr: string}} - Output of the shell command
 */
function run(cmd, options) {
	const optionsWithDefaults = {
		...RUN_OPTIONS_DEFAULTS,
		...options,
	};

	core.debug(cmd);

	if (optionsWithDefaults.captureStderr) {
		// `execSync` only exposes stderr when the command exits with a non-zero code. Some linters
		// (e.g. swift-format) print their findings to stderr yet exit with 0, so `spawnSync` is used to
		// capture stderr regardless of the exit code
		const result = spawnSync(cmd, {
			shell: true,
			encoding: "utf8",
			cwd: optionsWithDefaults.dir,
			maxBuffer: 20 * 1024 * 1024,
		});
		if (result.error) {
			throw result.error;
		}
		const output = {
			status: result.status,
			stdout: (result.stdout || "").trim(),
			stderr: (result.stderr || "").trim(),
		};
		if (output.status !== 0 && !optionsWithDefaults.ignoreErrors) {
			throw new Error(output.stderr || `Command failed with exit code ${output.status}`);
		}
		core.debug(`Exit code: ${output.status}`);
		core.debug(`Stdout: ${output.stdout}`);
		core.debug(`Stderr: ${output.stderr}`);
		return output;
	}

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

module.exports = {
	getEnv,
	run,
};
