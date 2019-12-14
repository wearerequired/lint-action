const { name: actionName } = require("../package");
const request = require("./request");
const { exit, getEnv, getInput, log } = require("./utils");

const ANNOTATION_LEVELS = ["notice", "warning", "failure"];

/**
 * Returns information about the GitHub repository and action trigger event
 *
 * @returns {object}: Object containing the information
 */
function getGithubInfo() {
	// Information provided by environment
	const eventName = getEnv("github_event_name");
	const sha = getEnv("github_sha");
	const [username, repository] = getEnv("github_repository").split("/");
	const workspace = getEnv("github_workspace");

	// Information provided by action user
	const token = getInput("github_token", true);

	return {
		eventName,
		repository,
		sha,
		token,
		username,
		workspace,
	};
}

/**
 * Creates a new check on GitHub which annotates the relevant commit with linting errors
 *
 * @param checkName {string}: Name which will be displayed in the check list
 * @param github {object}: {@see getGithubInfo}
 * @param results {object[]}: Results from the linter execution
 */
async function createCheck(checkName, github, results) {
	let annotations = [];
	for (let level = 0; level < 3; level += 1) {
		annotations = [
			...annotations,
			...results[level].map(result => ({
				path: result.path,
				start_line: result.firstLine,
				end_line: result.lastLine,
				annotation_level: ANNOTATION_LEVELS[level],
				message: result.message,
			})),
		];
	}

	// Temporary: Only use the first 50 annotations (API limit)
	// TODO: Create check in a separate step and send updates with batches of 50 annotations
	annotations = annotations.slice(0, 50);

	const body = {
		name: checkName,
		head_sha: github.sha,
		conclusion: results.length === 0 ? "success" : "failure",
		output: {
			title: checkName,
			summary: `${checkName} found ${results.length === 0 ? "no" : results.length} issue${
				results.length !== 1 ? "s" : ""
			}`,
			annotations,
		},
	};

	try {
		await request(
			`https://api.github.com/repos/${github.username}/${github.repository}/check-runs`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					// "Accept" header is required to access Checks API during preview period
					Accept: "application/vnd.github.antiope-preview+json",
					Authorization: `Bearer ${github.token}`,
					"User-Agent": actionName,
				},
				body,
			},
		);
	} catch (err) {
		log(err, "error");
		exit(`Error trying to create annotations: ${err.message}`);
	}
}

module.exports = {
	createCheck,
	getGithubInfo,
};
