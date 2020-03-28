const { useYarn } = require("./use-yarn");

/**
 * Returns the NPM or Yarn command ({@see useYarn()}) for executing an NPM binary
 * @param {string} [pkgRoot] - Package directory (directory where Yarn lockfile would exist)
 * @returns {string} - NPM/Yarn command for executing the NPM binary. The binary name should be
 * appended to this command
 */
function getNpmBinCommand(pkgRoot) {
	return useYarn(pkgRoot) ? "yarn run --silent" : "npx --no-install";
}

module.exports = { getNpmBinCommand };
