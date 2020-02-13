const { name: actionName } = require("../../package");
const { log } = require("../utils/action");
const request = require("../utils/request");
const { capitalizeFirstLetter } = require("../utils/string");

/**
 * Creates a new check on GitHub which annotates the relevant commit with linting errors
 * @param {string} linterName - Name of the linter for which a check should be created
 * @param {string} sha - SHA of the commit which should be annotated
 * @param {import('./context').GithubContext} context - Information about the GitHub repository and
 * action trigger event
 * @param {{isSuccess: boolean, warning: [], error: []}} lintResult - Parsed lint result
 * @param {string} summary - Summary for the GitHub check
 */
async function createCheck(linterName, sha, context, lintResult, summary) {
	let annotations = [];
	for (const level of ["warning", "error"]) {
		annotations = [
			...annotations,
			...lintResult[level].map(result => ({
				path: result.path,
				start_line: result.firstLine,
				end_line: result.lastLine,
				annotation_level: level === "warning" ? "warning" : "failure",
				message: result.message,
			})),
		];
	}

	// Only use the first 50 annotations (limit for a single API request)
	if (annotations.length > 50) {
		log(
			`There are more than 50 errors/warnings from ${linterName}. Annotations are created for the first 50 issues only.`,
		);
		annotations = annotations.slice(0, 50);
	}

	const body = {
		name: linterName,
		head_sha: sha,
		conclusion: lintResult.isSuccess ? "success" : "failure",
		output: {
			title: capitalizeFirstLetter(summary),
			summary: `${linterName} found ${summary}`,
			annotations,
		},
	};
	try {
		log(`Creating GitHub check with ${annotations.length} annotations for ${linterName}…`);
		await request(`https://api.github.com/repos/${context.repository.repoName}/check-runs`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				// "Accept" header is required to access Checks API during preview period
				Accept: "application/vnd.github.antiope-preview+json",
				Authorization: `Bearer ${context.token}`,
				"User-Agent": actionName,
			},
			body,
		});
		log(`${linterName} check created successfully`);
	} catch (err) {
		log(err, "error");
		throw new Error(`Error trying to create GitHub check for ${linterName}: ${err.message}`);
	}
}

module.exports = { createCheck };
