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

	const body = {
		name: linterName,
		conclusion,
		output: {
			title: capitalizeFirstLetter(summary),
			summary: `${linterName} found ${summary}`,
			annotations: undefined,
		},
	};

	const headers = {
		"Content-Type": "application/json",
		// "Accept" header is required to access Checks API during preview period
		Accept: "application/vnd.github.antiope-preview+json",
		Authorization: `Bearer ${context.token}`,
		"User-Agent": actionName,
	};

	// GitHub only allows 50 annotations per request, chunk them and send multiple requests
	const chunkSize = 50;
	for (let i = 0; i < annotations.length; i += chunkSize) {
		body.output.annotations = annotations.slice(i, i + chunkSize);

		const checkRuns = await request(
			`${process.env.GITHUB_API_URL}/repos/${context.repository.repoName}/commits/${sha}/check-runs`,
			{
				method: "GET",
				headers,
			},
		);
		const existingRun = checkRuns.data.check_runs.find((run) => run.name === body.name);

		try {
			core.info(
				`Creating GitHub check with ${conclusion} conclusion and ${annotations.length} annotations for ${linterName}…`,
			);

			if (existingRun == null) {
				await request(
					`${process.env.GITHUB_API_URL}/repos/${context.repository.repoName}/check-runs`,
					{
						method: "POST",
						headers,
						body: {
							name: linterName,
							conclusion,
							head_sha: sha,
							output: {
								title: capitalizeFirstLetter(summary),
								summary: `${linterName} found ${summary}`,
								annotations: undefined,
							},
						},
					},
				);

				core.info(`${linterName} check created successfully`);
			} else {
				const existingRunId = existingRun.id;

				await request(
					`${process.env.GITHUB_API_URL}/repos/${context.repository.repoName}/check-runs/${existingRunId}`,
					{
						method: "PATCH",
						headers,
						body: {
							name: linterName,
							conclusion,
							check_run_id: existingRunId,
							output: {
								title: capitalizeFirstLetter(summary),
								summary: `${linterName} found ${summary}`,
								annotations: undefined,
							},
						},
					},
				);

				core.info(`${linterName} check updated successfully`);
			}
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
}

module.exports = { createCheck };
