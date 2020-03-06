const { prefix } = require("../prefix");
const { useYarn } = require("./use-yarn");

/**
 * Returns the prefix to use with NPM.
 * @param {string} linter - the name of the linter to use
 * @param {string} dir - the directory to use to check the Yarn lockfile.
 * @returns {string} - Prefix to use with NPM.
 */
function npmPrefix(linter, dir) {
	const commandPrefix = prefix(linter);
	if (commandPrefix) { return commandPrefix; }
	return useYarn(dir) ? "yarn run --silent " : "npx --no-install ";
}

module.exports = { npmPrefix };
