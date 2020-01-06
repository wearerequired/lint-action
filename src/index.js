const { join } = require("path");
const { name: actionName } = require("../package");
const git = require("./git");
const github = require("./github");
const linters = require("./linters");
const { getInput, log } = require("./utils/action");

const GIT_NAME = actionName;
const GIT_EMAIL = `lint-action@samuelmeuli.com`;

// Abort action on unhandled promise rejections
process.on("unhandledRejection", err => {
	log(err, "error");
	throw new Error(`Exiting because of unhandled promise rejection`);
});

/**
 * Parses the action configuration and runs all enabled linters on matching files
 */
async function runAction() {
	const context = github.getContext();
	const autoFix = getInput("auto_fix") === "true";
	const commitMsg = getInput("commit_message", true);

	if (context.eventName !== "push") {
		throw Error(
			`${actionName} currently only supports "push" events, but was called on a "${context.eventName}" event`,
		);
	}

	git.setUserInfo(GIT_NAME, GIT_EMAIL);

	const checks = [];

	// Loop over all available linters
	for (const [linterId, linter] of Object.entries(linters)) {
		// Determine whether the linter should be executed on the commit
		if (getInput(linterId) === "true") {
			const fileExtensions = getInput(`${linterId}_extensions`, true);
			const lintDirRel = getInput(`${linterId}_dir`) || ".";
			const lintDirAbs = join(context.workspace, lintDirRel);

			// Check that the linter and its dependencies are installed
			log(`\nVerifying setup for ${linter.name}…`);
			await linter.verifySetup(lintDirAbs);
			log(`Verified ${linter.name} setup`);

			// Determine which files should be linted
			const fileExtList = fileExtensions.split(",");
			log(`Will use ${linter.name} to check the files with extensions ${fileExtList}`);

			// Lint and optionally auto-fix the matching files, parse code style violations
			log(
				`Linting ${autoFix ? "and auto-fixing " : ""}files in ${lintDirAbs} with ${linter.name}…`,
			);
			const results = linter.lint(lintDirAbs, fileExtList, autoFix);
			if (autoFix) {
				log("Committing and pushing changes…");
				git.commitChanges(commitMsg.replace(/\${linter}/g, linter.name));
				git.pushChanges(context);
			}
			const resultsParsed = linter.parseResults(context.workspace, results);

			// Build and log a summary of linting errors/warnings
			let summary;
			if (resultsParsed[1].length > 0 && resultsParsed[2].length > 0) {
				summary = `Found ${resultsParsed[2].length} errors and ${resultsParsed[1].length} warnings with ${linter.name}`;
			} else if (resultsParsed[2].length > 0) {
				summary = `Found ${resultsParsed[2].length} errors with ${linter.name}`;
			} else if (resultsParsed[1].length > 0) {
				summary = `Found ${resultsParsed[1].length} warnings with ${linter.name}`;
			} else {
				summary = `No code style issues found with ${linter.name}`;
			}
			log(summary);

			checks.push({ checkName: linter.name, resultsParsed, summary });
		}
	}

	// Add commit annotations in the end. They must be added to the last commit so GitHub displays
	// them on the pull request
	if (context.eventName === "push") {
		const headSha = git.getHeadSha();
		await Promise.all(
			checks.map(({ checkName, resultsParsed, summary }) =>
				github.createCheck(checkName, headSha, context, resultsParsed, summary),
			),
		);
	}
}

runAction();
