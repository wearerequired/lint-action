const core = require("@actions/core");

const { run } = require("./utils/action");
const { shescape } = require("./utils/shescape");

/** @typedef {import('./github/context').GithubContext} GithubContext */

/**
 * Fetches and checks out the remote Git branch (if it exists, the fork repository will be used)
 * @param {GithubContext} context - Information about the GitHub
 */
function checkOutRemoteBranch(context) {
	if (context.repository.hasFork) {
		// Fork: Add fork repo as remote
		core.info(`Adding "${context.repository.forkName}" fork as remote with Git`);
		const cloneURl = new URL(context.repository.forkCloneUrl);
		cloneURl.username = context.actor;
		cloneURl.password = context.token;
		run(`git remote add fork ${shescape.quote(cloneURl.toString())}`);
	} else {
		// No fork: Update remote URL to include auth information (so auto-fixes can be pushed)
		core.info(`Adding auth information to Git remote URL`);
		const cloneURl = new URL(context.repository.cloneUrl);
		cloneURl.username = context.actor;
		cloneURl.password = context.token;
		run(`git remote set-url origin ${shescape.quote(cloneURl.toString())}`);
	}

	const remote = context.repository.hasFork ? "fork" : "origin";
	const trackingRef = `refs/remotes/${remote}/${context.branch}`;

	// Fetch remote branch. The explicit refspec makes sure the remote-tracking branch is created,
	// the Checkout Action configures a fetch refspec which only covers the ref it checked out.
	// `context.branch` is attacker-controlled (fork PR head ref), so it must be quoted
	core.info(`Fetching remote branch "${context.branch}"`);
	run(
		`git fetch --no-tags --depth=1 ${remote} ${shescape.quote(`${context.branch}:${trackingRef}`)}`,
	);

	// Switch to remote branch. Unlike `git branch --force`, `git checkout -B` also works when the
	// branch is already checked out. The fully qualified ref works independently of the fetch
	// refspec configured by the Checkout Action
	core.info(`Switching to the "${context.branch}" branch`);
	run(`git checkout --force -B ${shescape.quote(context.branch)} ${shescape.quote(trackingRef)}`);
}

/**
 * Stages and commits all changes using Git
 * @param {string} message - Git commit message
 * @param {boolean} skipVerification - Skip Git verification
 */
function commitChanges(message, skipVerification) {
	core.info(`Committing changes`);
	run(`git commit -am ${shescape.quote(message)}${skipVerification ? " --no-verify" : ""}`);
}

/**
 * Returns the SHA of the head commit
 * @returns {string} - Head SHA
 */
function getHeadSha() {
	const sha = run("git rev-parse HEAD").stdout;
	core.info(`SHA of last commit is "${sha}"`);
	return sha;
}

/**
 * Checks whether there are differences from HEAD
 * @returns {boolean} - Boolean indicating whether changes exist
 */
function hasChanges() {
	// Refresh the index first so stat-only differences are not mistaken for real changes. A
	// dependency install step or a formatter can rewrite a tracked file with identical content,
	// leaving it stat-dirty. Without the refresh, `git diff-index` reports such a file as modified
	// while the subsequent `git commit -am` finds nothing to commit and exits non-zero, which
	// crashes the action (#140). `git update-index --refresh` exits non-zero when it updates stat
	// info, so its errors are ignored.
	run("git update-index -q --refresh", { ignoreErrors: true });
	const output = run("git diff-index --name-status --exit-code HEAD --", { ignoreErrors: true });
	const hasChangedFiles = output.status === 1;
	core.info(`${hasChangedFiles ? "Changes" : "No changes"} found with Git`);
	return hasChangedFiles;
}

/**
 * Pushes all changes to the remote repository
 * @param {GithubContext} context - Information about the GitHub repository
 * @param {boolean} skipVerification - Skip Git verification
 */
function pushChanges(context, skipVerification) {
	core.info("Pushing changes with Git");
	const remote = context.repository.hasFork ? "fork" : "origin";
	// The explicit refspec makes the push work without a configured upstream
	run(
		`git push${skipVerification ? " --no-verify" : ""} ${remote} ${shescape.quote(
			`HEAD:refs/heads/${context.branch}`,
		)}`,
	);
}

/**
 * Updates the global Git configuration with the provided information
 * @param {string} name - Git username
 * @param {string} email - Git email address
 */
function setUserInfo(name, email) {
	core.info(`Setting Git user information`);
	run(`git config --global user.name ${shescape.quote(name)}`);
	run(`git config --global user.email ${shescape.quote(email)}`);
}

module.exports = {
	checkOutRemoteBranch,
	commitChanges,
	getHeadSha,
	hasChanges,
	pushChanges,
	setUserInfo,
};
