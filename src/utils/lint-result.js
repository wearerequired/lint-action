/**
 * Lint result object.
 * @typedef LintResult
 * @property {boolean} isSuccess Whether the result is success.
 * @property {object[]} warning Warnings.
 * @property {object[]} error Errors.
 */

/**
 * Returns an object for storing linting results
 * @returns {LintResult} - Default object
 */
function initLintResult() {
	return {
		isSuccess: true, // Usually determined by the exit code of the linting command
		warning: [],
		error: [],
	};
}

/**
 * Returns a text summary of the number of issues found when linting
 * @param {LintResult} lintResult - Parsed linter
 * output
 * @returns {string} - Text summary
 */
function getSummary(lintResult) {
	const nrErrors = lintResult.error.length;
	const nrWarnings = lintResult.warning.length;
	// Build and log a summary of linting errors/warnings
	if (nrWarnings > 0 && nrErrors > 0) {
		return `${nrErrors} error${nrErrors > 1 ? "s" : ""} and ${nrWarnings} warning${
			nrWarnings > 1 ? "s" : ""
		}`;
	}
	if (nrErrors > 0) {
		return `${nrErrors} error${nrErrors > 1 ? "s" : ""}`;
	}
	if (nrWarnings > 0) {
		return `${nrWarnings} warning${nrWarnings > 1 ? "s" : ""}`;
	}
	return `no issues`;
}

/**
 * Rewrites the paths of a lint result so GitHub can link the annotations to the files of a pull
 * request: the paths are made relative to the repository root (by prepending the directory the
 * linter ran in) and are converted to forward slashes. GitHub's Checks API only matches annotations
 * to the diff when the paths are repo-root-relative and use forward slashes (see #94 and #608)
 * @param {LintResult} lintResult - Lint result whose paths should be rewritten (mutated in place)
 * @param {string} dirRel - Directory the linter ran in, relative to the repository root
 * @returns {LintResult} - The same lint result, with rewritten paths
 */
function normalizeLintResultPaths(lintResult, dirRel) {
	// Strip a leading "./" and any trailing slash, and use forward slashes
	const dir =
		dirRel && dirRel !== "."
			? dirRel.replace(/\\/g, "/").replace(/^\.\//, "").replace(/\/+$/, "")
			: "";
	for (const level of ["error", "warning"]) {
		for (const entry of lintResult[level]) {
			const path = entry.path.replace(/\\/g, "/");
			entry.path = dir ? `${dir}/${path}` : path;
		}
	}
	return lintResult;
}

module.exports = {
	getSummary,
	initLintResult,
	normalizeLintResultPaths,
};
