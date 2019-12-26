const { join } = require("path");
const { name: actionName } = require("../package");
const {
	commitChanges,
	createCheck,
	getGithubInfo,
	pushChanges,
	setGitUserInfo,
} = require("./github");
const linters = require("./linters");
const { getInput, log } = require("./utils/action");

const GIT_NAME = actionName;
const GIT_EMAIL = `${actionName}@example.com`; // TODO: change

// Abort action on unhandled promise rejections
process.on("unhandledRejection", err => {
	log(err, "error");
	throw new Error(`Exiting because of unhandled promise rejection`);
});

/**
 * Parses the action configuration and runs all enabled linters on matching files
 */
function runAction() {
	const github = getGithubInfo();
	const autoFix = getInput("auto_fix") === "true";

	setGitUserInfo(GIT_NAME, GIT_EMAIL);

	// Loop over all available linters
	for (const [linterId, linter] of Object.entries(linters)) {
		// Determine whether the linter should be executed on the commit
		if (getInput(linterId) === "true") {
			const fileExtensions = getInput(`${linterId}_extensions`, true);
			const lintDirRel = getInput(`${linterId}_dir`) || ".";
			const lintDirAbs = join(github.workspace, lintDirRel);

			// Check that the linter and its dependencies are installed
			log(`\nVerifying setup for ${linterId}…`);
			linter.verifySetup(lintDirAbs);
			log(`Verified ${linterId} setup`);

			// Determine which files should be linted
			const fileExtList = fileExtensions.split(",");
			log(`Will use ${linterId} to check the files with extensions ${fileExtList}`);

			// Lint the matching files, parse code style violations
			log(`Linting ${autoFix ? "and auto-fixing " : ""}files in ${lintDirAbs} with ${linterId}…`);
			const results = linter.lint(lintDirAbs, fileExtList, autoFix);
			if (autoFix) {
				log("Committing and pushing changes…");
				commitChanges(`Fix code style issues with ${linterId}`);
			}
			const resultsParsed = linter.parseResults(github.workspace, results);

			// Build and log a summary of linting errors/warnings
			let summary;
			if (resultsParsed[1].length > 0 && resultsParsed[2].length > 0) {
				summary = `Found ${resultsParsed[2].length} errors and ${resultsParsed[1].length} warnings with ${linterId}`;
			} else if (resultsParsed[2].length > 0) {
				summary = `Found ${resultsParsed[2].length} errors with ${linterId}`;
			} else if (resultsParsed[1].length > 0) {
				summary = `Found ${resultsParsed[1].length} warnings with ${linterId}`;
			} else {
				summary = `No code style issues found with ${linterId}`;
			}
			log(summary);

			// Annotate commit with code style violations on GitHub
			if (github.eventName === "push") {
				createCheck(linterId, github, resultsParsed, summary);
			}
		}
	}

	if (autoFix) {
		pushChanges(github);
	}
}

runAction();
