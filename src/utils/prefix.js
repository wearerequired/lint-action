const { getInput } = require("./action");
const { useYarn } = require("./npm/use-yarn");

/**
 * Returns the prefix to use based on settings.
 * @param {string} linter - the name of the linter.
 * @returns {string} - the prefix to add to the command.
 */
function getCommandPrefix(linter) {
	return getInput(`${linter}_command_prefix`, true);
}

function npmPrefix(linter, dir) {
	const commandPrefix = getCommandPrefix(linter);
	if (commandPrefix) {
		return commandPrefix;
	}
	return useYarn(dir) ? "yarn run --silent " : "npx --no-install ";
}

module.exports = { getCommandPrefix, npmPrefix };
