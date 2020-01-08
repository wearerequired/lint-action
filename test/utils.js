const { join } = require("path");

const DATE_REGEX = /\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}.\d+ \+\d{4}/g;
const TEST_DATE = "2019-01-01 00:00:00.000000 +0000";

/**
 * Some tools require paths to contain single forward slashes on macOS/Linux and double backslashes
 * on Windows. This is an extended `path.join` function that corrects these path separators
 * @param {...string} paths - Paths to join
 * @returns {string} - File path
 */
function joinDoubleBackslash(...paths) {
	let filePath = join(...paths);
	if (process.platform === "win32") {
		filePath = filePath.replace(/\\/g, "\\\\");
	}
	return filePath;
}

/**
 * Find dates in the provided string and replace them with {@link TEST_DATE}
 * @param {string} str - String in which dates should be replaced
 * @returns {string} - Normalized date
 */
function normalizeDates(str) {
	return str.replace(DATE_REGEX, TEST_DATE);
}

module.exports = { joinDoubleBackslash, normalizeDates, TEST_DATE };
