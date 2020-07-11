/**
 * Returns the symbol used to separate the items of a Dart Analyzer violation
 * @returns {string} - The separator for the current platform
 */
function getViolationSeparator() {
	return process.platform === "win32" ? "-" : "•";
}

module.exports = { getViolationSeparator };
