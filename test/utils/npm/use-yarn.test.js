const { mkdir } = require("fs").promises;
const { join } = require("path");

const { ensureFile, remove } = require("fs-extra");

const { useYarn } = require("../../../src/utils/npm/use-yarn");
const { createTmpDir } = require("../../test-utils");

const tmpDir = createTmpDir();

afterAll(async () => {
	await remove(tmpDir);
});

describe.skip("useYarn()", () => {
	test("should return `true` if there is a Yarn lockfile", async () => {
		const dir = join(tmpDir, "yarn-project");
		const lockfilePath = join(dir, "yarn.lock");

		// Create temp directory with lockfile
		await mkdir(dir);
		await ensureFile(lockfilePath);

		expect(useYarn(dir)).toBeTruthy();
	});

	test("should return `false` if there is no Yarn lockfile", async () => {
		const dir = join(tmpDir, "npm-project");

		// Create temp directory without lockfile
		await mkdir(dir);

		expect(useYarn(dir)).toBeFalsy();
	});
});
