const { mkdtempSync, realpathSync } = require("fs");
const { join } = require("path");

const DATE_REGEX = /\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}.\d+ [+-]\d{4}/g;
const TEST_DATE = "2019-01-01 00:00:00.000000 +0000";

/**
 * Creates a temporary directory.
 * @returns {string} - File path
 */
function createTmpDir() {
	return mkdtempSync(join(__dirname, "tmp-"));
}

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
 * Some tools output real paths for files. This function corrects these paths to use the provided
 * path.
 * @param {string} str - String in which paths should be replaced
 * @param {string} path - Which path should be replaced
 * @returns {string} - Normalized paths
 */
function normalizePaths(str, path) {
	const pathToSearch = realpathSync(path);
	const pathToSearchEscaped = pathToSearch.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
	return str.replace(new RegExp(pathToSearchEscaped, "g"), path);
}

/**
 * Find dates in the provided string and replace them with {@link TEST_DATE}
 * @param {string} str - String in which dates should be replaced
 * @returns {string} - Normalized date
 */
function normalizeDates(str) {
	return str.replace(DATE_REGEX, TEST_DATE);
}

module.exports = { TEST_DATE, joinDoubleBackslash, normalizeDates, normalizePaths, createTmpDir };
