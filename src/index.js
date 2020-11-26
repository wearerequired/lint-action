const { join } = require("path");

const core = require("@actions/core");

const git = require("./git");
const { createCheck } = require("./github/api");
const { getContext } = require("./github/context");
const linters = require("./linters");
const { getSummary } = require("./utils/lint-result");

// Abort action on unhandled promise rejections
process.on("unhandledRejection", (err) => {
	core.error(err);
	throw new Error(`Exiting because of unhandled promise rejection`);
});

/**
 * Parses the action configuration and runs all enabled linters on matching files
 */
async function runAction() {
	const context = getContext();
	const autoFix = core.getInput("auto_fix") === "true";
	const gitName = core.getInput("git_name", { required: true });
	const gitEmail = core.getInput("git_email", { required: true });
	const commitMessage = core.getInput("commit_message", { required: true });
	const checkName = core.getInput("check_name", { required: true });

	// If on a PR from fork: Display messages regarding action limitations
	if (context.eventName === "pull_request" && context.repository.hasFork) {
		core.error(
			"This action does not have permission to create annotations on forks. You may want to run it only on `push` events. See https://github.com/wearerequired/lint-action/issues/13 for details",
		);
		if (autoFix) {
			core.error(
				"This action does not have permission to push to forks. You may want to run it only on `push` events. See https://github.com/wearerequired/lint-action/issues/13 for details",
			);
		}
	}

	if (autoFix) {
		// Set Git committer username and password
		git.setUserInfo(gitName, gitEmail);
	}
	if (context.eventName === "pull_request") {
		// Fetch and check out PR branch:
		// - "push" event: Already on correct branch
		// - "pull_request" event on origin, for code on origin: The Checkout Action
		//   (https://github.com/actions/checkout) checks out the PR's test merge commit instead of the
		//   PR branch. Git is therefore in detached head state. To be able to push changes, the branch
		//   needs to be fetched and checked out first
		// - "pull_request" event on origin, for code on fork: Same as above, but the repo/branch where
		//   changes need to be pushed is not yet available. The fork needs to be added as a Git remote
		//   first
		git.checkOutRemoteBranch(context);
	}

	const checks = [];

	// Loop over all available linters
	for (const [linterId, linter] of Object.entries(linters)) {
		// Determine whether the linter should be executed on the commit
		if (core.getInput(linterId) === "true") {
			core.startGroup(`Run ${linter.name}`);

			const fileExtensions = core.getInput(`${linterId}_extensions`, { required: true });
			const args = core.getInput(`${linterId}_args`);
			const lintDirRel = core.getInput(`${linterId}_dir`) || ".";
			const prefix = core.getInput(`${linterId}_command_prefix`);
			const lintDirAbs = join(context.workspace, lintDirRel);

			// Check that the linter and its dependencies are installed
			core.info(`\nVerifying setup for ${linter.name}…`);
			await linter.verifySetup(lintDirAbs, prefix);
			core.info(`Verified ${linter.name} setup`);

			// Determine which files should be linted
			const fileExtList = fileExtensions.split(",");
			core.info(`Will use ${linter.name} to check the files with extensions ${fileExtList}`);

			// Lint and optionally auto-fix the matching files, parse code style violations
			core.info(
				`Linting ${autoFix ? "and auto-fixing " : ""}files in ${lintDirAbs} with ${linter.name}…`,
			);
			const lintOutput = linter.lint(lintDirAbs, fileExtList, args, autoFix, prefix);

			// Parse output of linting command
			const lintResult = linter.parseOutput(context.workspace, lintOutput);
			const summary = getSummary(lintResult);
			core.info(
				`${linter.name} found ${summary} (${lintResult.isSuccess ? "success" : "failure"})`,
			);

			if (autoFix) {
				// Commit and push auto-fix changes
				if (git.hasChanges()) {
					git.commitChanges(commitMessage.replace(/\${linter}/g, linter.name));
					git.pushChanges();
				}
			}

			const lintCheckName = checkName
				.replace(/\${linter}/g, linter.name)
				.replace(/\${dir}/g, lintDirRel !== "." ? `${lintDirRel}` : "")
				.trim();

			checks.push({ lintCheckName, lintResult, summary });

			core.endGroup();
		}
	}

	// Add commit annotations after running all linters. To be displayed on pull requests, the
	// annotations must be added to the last commit on the branch. This can either be a user commit or
	// one of the auto-fix commits
	const headSha = git.getHeadSha();
	await Promise.all(
		checks.map(({ lintCheckName, lintResult, summary }) =>
			createCheck(lintCheckName, headSha, context, lintResult, summary),
		),
	);
}

runAction();
