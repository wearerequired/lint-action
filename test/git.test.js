const git = require("../src/git");
const { run } = require("../src/utils/action");
const { shescape } = require("../src/utils/shescape");

jest.mock("../src/utils/action");

/**
 * Builds a GitHub context object for a pull request
 * @param {object} [options] - Options
 * @param {string} [options.branch] - Branch name
 * @param {boolean} [options.hasFork] - Whether the pull request comes from a fork
 * @returns {object} - Context object accepted by the git helpers
 */
function makeContext({ branch = "main", hasFork = false } = {}) {
	return {
		actor: "octocat",
		token: "secret-token",
		branch,
		repository: {
			hasFork,
			repoName: "owner/repo",
			cloneUrl: "https://github.com/owner/repo.git",
			forkName: hasFork ? "forker/repo" : undefined,
			forkCloneUrl: hasFork ? "https://github.com/forker/repo.git" : undefined,
		},
	};
}

/**
 * Builds the auth-carrying remote URL exactly like `checkOutRemoteBranch` does
 * @param {string} cloneUrl - Clone URL of the repository
 * @param {object} context - Context object the git helper receives
 * @returns {string} - Remote URL with the actor and token embedded
 */
function authRemoteUrl(cloneUrl, context) {
	const url = new URL(cloneUrl);
	url.username = context.actor;
	url.password = context.token;
	return url.toString();
}

// A branch name is fully attacker-controlled for pull requests from a fork (the head ref). Git
// allows characters like `$`, backticks, `(`, `)` and `;` in ref names, so an unquoted
// interpolation into a shell command would allow command injection. The single quote is included
// to exercise shescape's escaping of the quote character itself.
const MALICIOUS_BRANCH = "x$(touch /tmp/pwned)`whoami`;echo'rm";

describe("git command injection", () => {
	beforeEach(() => {
		run.mockClear();
	});

	test("checkOutRemoteBranch quotes the branch name and refspecs", () => {
		git.checkOutRemoteBranch(makeContext({ branch: MALICIOUS_BRANCH }));
		const commands = run.mock.calls.map((call) => call[0]);
		const trackingRef = `refs/remotes/origin/${MALICIOUS_BRANCH}`;

		// shescape output depends on the platform's shell, so compare against `shescape.quote`
		// rather than a hardcoded escaping
		const fetchCmd = commands.find((cmd) => cmd.startsWith("git fetch"));
		expect(fetchCmd).toContain(shescape.quote(`${MALICIOUS_BRANCH}:${trackingRef}`));

		const checkoutCmd = commands.find((cmd) => cmd.startsWith("git checkout"));
		expect(checkoutCmd).toContain(shescape.quote(MALICIOUS_BRANCH));
		expect(checkoutCmd).toContain(shescape.quote(trackingRef));
	});

	test("checkOutRemoteBranch quotes the auth-carrying origin remote URL", () => {
		const context = makeContext({ hasFork: false });
		git.checkOutRemoteBranch(context);
		const cmd = run.mock.calls
			.map((call) => call[0])
			.find((c) => c.startsWith("git remote set-url origin"));
		expect(cmd).toContain(shescape.quote(authRemoteUrl(context.repository.cloneUrl, context)));
	});

	test("checkOutRemoteBranch quotes the auth-carrying fork remote URL", () => {
		const context = makeContext({ hasFork: true });
		git.checkOutRemoteBranch(context);
		const cmd = run.mock.calls
			.map((call) => call[0])
			.find((c) => c.startsWith("git remote add fork"));
		expect(cmd).toContain(shescape.quote(authRemoteUrl(context.repository.forkCloneUrl, context)));
	});

	test("pushChanges quotes the refspec built from the branch name", () => {
		git.pushChanges(makeContext({ branch: MALICIOUS_BRANCH }), false);
		const cmd = run.mock.calls[0][0];
		expect(cmd).toContain(shescape.quote(`HEAD:refs/heads/${MALICIOUS_BRANCH}`));
	});

	test("commitChanges quotes the commit message", () => {
		const message = 'msg"; rm -rf / #';
		git.commitChanges(message, false);
		const cmd = run.mock.calls[0][0];
		expect(cmd).toContain(shescape.quote(message));
	});
});
