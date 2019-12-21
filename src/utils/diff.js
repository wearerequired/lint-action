const parseDiff = require("../../vendor/parse-diff");

/**
 * Parses a unified diff and converts it to a results array
 *
 * @param diff {string}: Unified diff (output of a linting/formatting command)
 * @returns {[][]}: Array of parsed results ([notices, warnings, failures])
 */
function diffToParsedResults(diff) {
	// Parsed results: [notices, warnings, failures]
	const resultsParsed = [[], [], []];

	const files = parseDiff(diff);
	for (const file of files) {
		const { chunks, to: path } = file;
		for (const chunk of chunks) {
			const { oldStart, oldLines, changes } = chunk;
			const chunkDiff = changes.map(change => change.content).join("\n");
			resultsParsed[2].push({
				path,
				firstLine: oldStart,
				lastLine: oldStart + oldLines,
				message: chunkDiff,
			});
		}
	}

	return resultsParsed;
}

module.exports = {
	diffToParsedResults,
};
