const { execSync } = require("child_process");
const { mkdtempSync, writeFileSync, utimesSync, rmSync } = require("fs");
const { tmpdir } = require("os");
const { join } = require("path");

const git = require("../src/git");

// These tests exercise `hasChanges` against a throwaway repository using the real `run` helper, so
// `../src/utils/action` must not be mocked here (unlike git.test.js).
describe("hasChanges", () => {
	let repoDir;
	let originalCwd;

	/**
	 * Runs a Git command inside the throwaway repository
	 * @param {string} cmd - Git command to run
	 */
	function gitCmd(cmd) {
		execSync(cmd, { cwd: repoDir, stdio: "ignore" });
	}

	beforeEach(() => {
		originalCwd = process.cwd();
		repoDir = mkdtempSync(join(tmpdir(), "lint-action-git-"));
		gitCmd("git init");
		gitCmd("git config user.email test@example.com");
		gitCmd("git config user.name Test");
		gitCmd("git config commit.gpgsign false");
		writeFileSync(join(repoDir, "file.txt"), "content\n");
		gitCmd("git add -A");
		gitCmd("git commit -m init");
		// `hasChanges` runs Git in the current working directory
		process.chdir(repoDir);
	});

	afterEach(() => {
		process.chdir(originalCwd);
		rmSync(repoDir, { recursive: true, force: true });
	});

	test("returns false when the working tree matches HEAD", () => {
		expect(git.hasChanges()).toBe(false);
	});

	test("returns false when a tracked file is stat-dirty but unchanged (#140)", () => {
		// A dependency install step or a formatter can rewrite a tracked file with identical content,
		// leaving it stat-dirty. Before the index refresh this was reported as a change, and the
		// subsequent `git commit -am` then crashed the action with "nothing to commit".
		writeFileSync(join(repoDir, "file.txt"), "content\n");
		const future = new Date(Date.now() + 60000);
		utimesSync(join(repoDir, "file.txt"), future, future);
		expect(git.hasChanges()).toBe(false);
	});

	test("returns true when a tracked file's content actually changes", () => {
		writeFileSync(join(repoDir, "file.txt"), "changed\n");
		expect(git.hasChanges()).toBe(true);
	});
});
