const parseDiff = require("parse-diff");

/**
 * Parses linting errors from a unified diff
 * @param {string} diff - Unified diff
 * @returns {{path: string, firstLine: number, lastLine: number, message: string}[]} - Array of
 * parsed errors
 */
function parseErrorsFromDiff(diff) {
	const errors = [];
	const files = parseDiff(diff);
	for (const file of files) {
		const { chunks, to: path } = file;
		for (const chunk of chunks) {
			const { oldStart, oldLines, changes } = chunk;
			const chunkDiff = changes.map((change) => change.content).join("\n");
			errors.push({
				path,
				firstLine: oldStart,
				lastLine: oldStart + oldLines,
				message: chunkDiff,
			});
		}
	}
	return errors;
}

module.exports = {
	parseErrorsFromDiff,
};
