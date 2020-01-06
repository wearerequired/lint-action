const { run } = require("./utils/action");

/**
 * Stages and commits all changes using Git
 *
 * @param message {string}: Git commit message
 */
function commitChanges(message) {
	// Check diff and only create a commit if there are changes (command will fail otherwise)
	run(`(git diff --quiet && git diff --staged --quiet) || git commit -am "${message}"`);
}

/**
 * Returns the SHA of the head commit
 *
 * @return {string}: Head SHA
 */
function getHeadSha() {
	return run("git rev-parse HEAD").stdout;
}

/**
 * Pushes all changes to the GitHub repository
 *
 * @param context {{actor: string, ref: string, workspace: string, eventName: string, repository:
 * string, sha: string, token: string, username: string}}: Object information about the GitHub
 * repository and action trigger event
 */
function pushChanges(context) {
	const remote = `https://${context.actor}:${context.token}@github.com/${context.username}/${context.repository}.git`;
	run(`git push "${remote}" HEAD:${context.ref} --follow-tags`);
}

/**
 * Updates the global Git configuration with the provided information
 *
 * @param name {string}: Git user name
 * @param email {string}: Git email address
 */
function setUserInfo(name, email) {
	run(`git config --global user.name "${name}"`);
	run(`git config --global user.email "${email}"`);
}

module.exports = {
	commitChanges,
	getHeadSha,
	pushChanges,
	setUserInfo,
};
