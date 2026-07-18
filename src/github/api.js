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
	// of 50: the check run is created with the first batch and left "in_progress", the remaining
	// batches are appended by updating the same run, and only the final request sets the conclusion
	// (which completes the run). This way consumers never observe a completed run with a truncated
	// set of annotations, and a failed follow-up request leaves the run in_progress rather than
	// misleadingly completed. The empty batch makes sure the run is always created, even when there
	// are no annotations
	const maxAnnotationsPerRequest = 50;
	const batches = [];
	for (let i = 0; i < annotations.length; i += maxAnnotationsPerRequest) {
		batches.push(annotations.slice(i, i + maxAnnotationsPerRequest));
	}
	if (batches.length === 0) {
		batches.push([]);
	}

	const buildBody = (batch, isLast) => ({
		name: linterName,
		output: {
			title: capitalizeFirstLetter(summary),
			summary: `${linterName} found ${summary}`,
			annotations: batch,
		},
		// Setting the conclusion completes the run, so only the last request carries it
		...(isLast ? { conclusion } : { status: "in_progress" }),
	});

	try {
		core.info(
			`Creating GitHub check with ${conclusion} conclusion and ${annotations.length} annotations for ${linterName}…`,
		);

		let checkRunId;
		for (let i = 0; i < batches.length; i += 1) {
			const isLast = i === batches.length - 1;
			if (i === 0) {
				const { data: checkRun } = await request(checkRunsUrl, {
					method: "POST",
					headers,
					body: { head_sha: sha, ...buildBody(batches[i], isLast) },
				});
				checkRunId = checkRun && checkRun.id;
				if (checkRunId == null) {
					throw new Error(`GitHub API did not return an id for the ${linterName} check run`);
				}
			} else {
				core.info(`Adding ${batches[i].length} more annotations to the ${linterName} check…`);
				await request(`${checkRunsUrl}/${checkRunId}`, {
					method: "PATCH",
					headers,
					body: buildBody(batches[i], isLast),
				});
			}
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
