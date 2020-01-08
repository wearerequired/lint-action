/**
 * Returns an object for storing linting results
 * @returns {{isSuccess: boolean, warning: [], error: []}}: Default object
 */
function initLintResult() {
	return {
		isSuccess: true, // Usually determined by the exit code of the linting command
		warning: [],
		error: [],
	};
}

module.exports = {
	initLintResult,
};
