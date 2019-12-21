const { join } = require("path");

/**
 * Some tools require paths to contain single forward slashes on macOS/Linux and double backslashes
 * on Windows. This is an extended `path.join` function that corrects these path separators
 *
 * @param paths {...string}: Paths to join
 */
function joinDoubleBackslash(...paths) {
	let filePath = join(...paths);
	if (process.platform === "win32") {
		filePath = filePath.replace(/\\/g, "\\\\");
	}
	return filePath;
}

module.exports = { joinDoubleBackslash };
