const { log, run } = require("./utils/action");

/**
 * Switches the Git branch
 * @param {string} branchName - Name of the branch which should be switched to
 */
function checkOutBranch(branchName) {
	log(`Checking out the "${branchName}" branch`);
	run(`git checkout ${branchName}`);
}

/**
 * Stages and commits all changes using Git
 * @param {string} message - Git commit message
 */
function commitChanges(message) {
	log(`Committing changes`);
	// Check diff and only create a commit if there are changes (command will fail otherwise)
	run(`(git diff --quiet && git diff --staged --quiet) || git commit -am "${message}"`);
}

/**
 * Fetches all remote Git branches
 */
function fetchBranches() {
	log(`Fetching all remote Git branches`);
	run("git fetch --no-tags --prune --depth=1 origin +refs/heads/*:refs/remotes/origin/*");
}

/**
 * Returns the SHA of the head commit
 * @returns {string} - Head SHA
 */
function getHeadSha() {
	const sha = run("git rev-parse HEAD").stdout;
	log(`SHA of last commit is "${sha}"`);
	return sha;
}

/**
 * Pushes all changes to the GitHub repository
 * @param {{actor: string, branch: string, event: object, eventName: string, repository: string,
 * token: string, username: string, workspace: string}} context - Object information about the
 * GitHub repository and action trigger event
 */
function pushChanges(context) {
	const remote = `https://${context.actor}:${context.token}@github.com/${context.username}/${context.repository}.git`;
	const localBranch = "HEAD";
	const remoteBranch = context.branch;

	log(`Pushing changes to ${remote}`);
	run(`git push "${remote}" ${localBranch}:${remoteBranch} --follow-tags`);
}

/**
 * Updates the global Git configuration with the provided information
 * @param {string} name - Git user name
 * @param {string} email - Git email address
 */
function setUserInfo(name, email) {
	log(`Setting Git user information`);
	run(`git config --global user.name "${name}"`);
	run(`git config --global user.email "${email}"`);
}

module.exports = {
	checkOutBranch,
	commitChanges,
	fetchBranches,
	getHeadSha,
	pushChanges,
	setUserInfo,
};
