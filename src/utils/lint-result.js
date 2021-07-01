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

module.exports = {
	getSummary,
	initLintResult,
};
