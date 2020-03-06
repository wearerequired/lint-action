const { getInput } = require("./action");

/**
 * Returns the prefix to use based on settings.
 * @param {string} linter - the name of the linter.
 * @returns {string} - the prefix to add to the command.
 */
function prefix(linter) {
	const inputPrefix = getInput(`${linter}_command_prefix`) || "";
	return inputPrefix ? `${inputPrefix} ` : "";
}

module.exports = { prefix };
