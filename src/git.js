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
	run(`git commit -am "${message}"`);
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
 * Checks whether there are differences from HEAD
 * @returns {boolean} - Boolean indicating whether changes exist
 */
function hasChanges() {
	const res = run("git diff-index --quiet HEAD --", { ignoreErrors: true }).status === 1;
	log(`${res ? "Changes" : "No changes"} found with Git`);
	return res;
}

/**
 * Pushes all changes to the GitHub repository
 * @param {import('./github/context').GithubContext} context - Information about the GitHub
 * repository and action trigger event
 */
function pushChanges(context) {
	const remote = `https://${context.actor}:${context.token}@github.com/${context.repository.repoName}.git`;
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
	hasChanges,
	pushChanges,
	setUserInfo,
};
