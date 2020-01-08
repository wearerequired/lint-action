const { readFileSync } = require("fs");
const { name: actionName } = require("../package");
const { getEnv, getInput, log } = require("./utils/action");
const request = require("./utils/request");

/**
 * Returns information about the GitHub repository and action trigger event
 *
 * @returns {{actor: string, branch: string, event: object, eventName: string, repository: string,
 * token: string, username: string, workspace: string}}
 */
function getContext() {
	// Information provided by environment
	const actor = getEnv("github_actor", true);
	const eventName = getEnv("github_event_name", true);
	const [username, repository] = getEnv("github_repository", true).split("/");
	const workspace = getEnv("github_workspace", true);

	// Information provided by action user
	const token = getInput("github_token", true);

	// Parse `event.json` file (file with the complete webhook event payload, automatically provided
	// by GitHub)
	const eventPath = getEnv("github_event_path", true);
	const eventBuffer = readFileSync(eventPath);
	const event = JSON.parse(eventBuffer);

	// Read branch name/ref from parsed event file
	let branch;
	if (eventName === "push") {
		branch = event.ref.substring(11); // Remove "refs/heads/" from start of string
	} else if (eventName === "pull_request") {
		branch = event.pull_request.head.ref;
	} else {
		throw Error(`${actionName} does not support "${eventName}" GitHub events`);
	}

	return {
		actor,
		branch,
		event,
		eventName,
		repository,
		token,
		username,
		workspace,
	};
}

/**
 * Creates a new check on GitHub which annotates the relevant commit with linting errors
 * @param checkName {string}: Name which will be displayed in the check list
 * @param sha {string}: SHA of the commit which should be annotated
 * @param context {{actor: string, branch: string, event: object, eventName: string, repository:
 * string, token: string, username: string, workspace: string}}: Object information about the GitHub
 * repository and action trigger event
 * @param lintResult {{isSuccess: boolean, warning: [], error: []}}: Parsed lint result
 * @param summary {string}: Summary for the GitHub check
 */
async function createCheck(checkName, sha, context, lintResult, summary) {
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
			`There are more than 50 errors/warnings from ${checkName}. Annotations are created for the first 50 violations only.`,
		);
		annotations = annotations.slice(0, 50);
	}

	const body = {
		name: checkName,
		head_sha: sha,
		conclusion: lintResult.isSuccess ? "success" : "failure",
		output: {
			title: checkName,
			summary,
			annotations,
		},
	};
	try {
		log(`Creating ${annotations.length} annotations for ${checkName}…`);
		await request(
			`https://api.github.com/repos/${context.username}/${context.repository}/check-runs`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					// "Accept" header is required to access Checks API during preview period
					Accept: "application/vnd.github.antiope-preview+json",
					Authorization: `Bearer ${context.token}`,
					"User-Agent": actionName,
				},
				body,
			},
		);
		log(`${checkName} annotations created successfully`);
	} catch (err) {
		log(err, "error");
		throw new Error(
			`Error trying to create "${checkName}" annotations using GitHub API: ${err.message}`,
		);
	}
}

module.exports = {
	createCheck,
	getContext,
};
