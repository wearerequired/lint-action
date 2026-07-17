const core = require("@actions/core");

const { name: actionName } = require("../../package.json");
const request = require("../utils/request");
const { capitalizeFirstLetter } = require("../utils/string");

/** @typedef {import('./context').GithubContext} GithubContext */
/** @typedef {import('../utils/lint-result').LintResult} LintResult */

/**
 * Creates a new check on GitHub which annotates the relevant commit with linting errors
 * @param {string} linterName - Name of the linter for which a check should be created
 * @param {string} sha - SHA of the commit which should be annotated
 * @param {GithubContext} context - Information about the GitHub repository and
 * action trigger event
 * @param {LintResult} lintResult - Parsed lint result
 * @param {boolean} neutralCheckOnWarning - Whether the check run should conclude as neutral if
 * there are only warnings
 * @param {string} summary - Summary for the GitHub check
 */
async function createCheck(linterName, sha, context, lintResult, neutralCheckOnWarning, summary) {
	let annotations = [];
	for (const level of ["error", "warning"]) {
		annotations = [
			...annotations,
			...lintResult[level].map((result) => ({
				path: result.path,
				start_line: result.firstLine,
				end_line: result.lastLine,
				annotation_level: level === "warning" ? "warning" : "failure",
				message: result.message,
			})),
		];
	}

	let conclusion;
	if (lintResult.isSuccess) {
		if (annotations.length > 0 && neutralCheckOnWarning) {
			conclusion = "neutral";
		} else {
			conclusion = "success";
		}
	} else {
		conclusion = "failure";
	}

	const headers = {
		"Content-Type": "application/json",
		// "Accept" header is required to access Checks API during preview period
		Accept: "application/vnd.github.antiope-preview+json",
		Authorization: `Bearer ${context.token}`,
		"User-Agent": actionName,
	};
	const checkRunsUrl = `${process.env.GITHUB_API_URL}/repos/${context.repository.repoName}/check-runs`;

	// The Checks API accepts at most 50 annotations per request. Split the annotations into batches
	// of 50: the first batch is sent when the check run is created, the remaining batches are added
	// by updating the same run (annotations are appended on update). The empty batch makes sure the
	// check run is always created, even when there are no annotations
	const maxAnnotationsPerRequest = 50;
	const batches = [];
	for (let i = 0; i < annotations.length; i += maxAnnotationsPerRequest) {
		batches.push(annotations.slice(i, i + maxAnnotationsPerRequest));
	}
	if (batches.length === 0) {
		batches.push([]);
	}

	const buildOutput = (batchAnnotations) => ({
		title: capitalizeFirstLetter(summary),
		summary: `${linterName} found ${summary}`,
		annotations: batchAnnotations,
	});

	try {
		core.info(
			`Creating GitHub check with ${conclusion} conclusion and ${annotations.length} annotations for ${linterName}…`,
		);

		// Create the check run with the first batch of annotations
		const { data: checkRun } = await request(checkRunsUrl, {
			method: "POST",
			headers,
			body: {
				name: linterName,
				head_sha: sha,
				conclusion,
				output: buildOutput(batches[0]),
			},
		});

		// Add the remaining annotations by updating the same check run
		for (const batch of batches.slice(1)) {
			core.info(`Adding ${batch.length} more annotations to the ${linterName} check…`);
			await request(`${checkRunsUrl}/${checkRun.id}`, {
				method: "PATCH",
				headers,
				body: {
					name: linterName,
					conclusion,
					output: buildOutput(batch),
				},
			});
		}

		core.info(`${linterName} check created successfully`);
	} catch (err) {
		let errorMessage = err.message;
		if (err.data) {
			try {
				const errorData = JSON.parse(err.data);
				if (errorData.message) {
					errorMessage += `. ${errorData.message}`;
				}
				if (errorData.documentation_url) {
					errorMessage += ` ${errorData.documentation_url}`;
				}
			} catch (e) {
				// Ignore
			}
		}
		core.error(errorMessage);

		throw new Error(`Error trying to create GitHub check for ${linterName}: ${errorMessage}`);
	}
}

module.exports = { createCheck };
