const git = require("../src/git");
const { run } = require("../src/utils/action");
const { shescape } = require("../src/utils/shescape");

jest.mock("../src/utils/action");

/**
 * Builds a GitHub context object for a pull request from the same repository
 * @param {string} branch - Branch name
 * @returns {object} - Context object accepted by the git helpers
 */
function contextForBranch(branch) {
	return {
		actor: "octocat",
		token: "secret-token",
		branch,
		repository: {
			hasFork: false,
			repoName: "owner/repo",
			cloneUrl: "https://github.com/owner/repo.git",
		},
	};
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
		git.checkOutRemoteBranch(contextForBranch(MALICIOUS_BRANCH));
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

	test("pushChanges quotes the refspec built from the branch name", () => {
		git.pushChanges(contextForBranch(MALICIOUS_BRANCH), false);
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
